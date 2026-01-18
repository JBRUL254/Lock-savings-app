// ================== IMPORTS ==================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

// ================== CONFIG ==================
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Needed for Paystack webhook (raw body)
app.use(
  "/api/paystack/webhook",
  express.raw({ type: "application/json" })
);

const PORT = process.env.PORT || 10000;

// ================== ENV VALIDATION ==================
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_PUBLIC_KEY,
  FRONTEND_URL,
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !PAYSTACK_SECRET_KEY
) {
  throw new Error("❌ Missing required environment variables");
}

// ================== SUPABASE ==================
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ================== PAYSTACK INIT ==================
app.post("/api/paystack/init", async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        error: "Phone number and amount required",
      });
    }

    // Paystack REQUIRES email
    const email = `user${phone}@walletapp.com`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // ksh → cents
        currency: "KES",
        channels: ["mobile_money"],
        metadata: { phone },
        callback_url: `${FRONTEND_URL}/payment-success`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      authorization_url:
        response.data.data.authorization_url,
    });
  } catch (err) {
    console.error(
      "Paystack init error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      error: "Failed to initialize payment",
    });
  }
});

// ================== PAYSTACK WEBHOOK ==================
app.post("/api/paystack/webhook", async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.sendStatus(401);
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      const data = event.data;
      const phone = data.metadata.phone;
      const amount = data.amount / 100;

      // Update wallet balance
      await supabase.rpc("increment_wallet", {
        phone_number: phone,
        deposit_amount: amount,
      });

      // Save transaction
      await supabase.from("transactions").insert({
        phone,
        amount,
        reference: data.reference,
        status: "success",
        type: "deposit",
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
});

// ================== GET WALLET ==================
app.get("/api/wallet/:phone", async (req, res) => {
  const { phone } = req.params;

  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("phone", phone)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ balance: data.balance });
});

// ================== ADMIN TRANSACTIONS ==================
app.get("/api/admin/transactions", async (req, res) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// ================== ROOT ==================
app.get("/", (req, res) => {
  res.send("✅ Wallet API running");
});

// ================== START ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
