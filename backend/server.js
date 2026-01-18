import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/* ---------------- INITIALIZE PAYMENT ---------------- */
app.post("/api/paystack/init", async (req, res) => {
  const { email, amount, user_id } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        currency: "KES",
        metadata: { user_id },
        callback_url: process.env.PAYSTACK_CALLBACK_URL
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ url: response.data.data.authorization_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Paystack init failed" });
  }
});

/* ---------------- WEBHOOK (MOST IMPORTANT) ---------------- */
app.post("/api/paystack/webhook", async (req, res) => {
  const event = req.body;

  if (event.event === "charge.success") {
    const data = event.data;
    const userId = data.metadata.user_id;
    const amount = data.amount / 100;

    // update wallet
    await supabase.rpc("increment_wallet", {
      uid: userId,
      amt: amount
    });

    // save transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      amount,
      type: "deposit",
      reference: data.reference,
      status: "success"
    });
  }

  res.sendStatus(200);
});

/* ---------------- ADMIN DASHBOARD API ---------------- */
app.get("/api/admin/transactions", async (req, res) => {
  const { data } = await supabase
    .from("transactions")
    .select("*, profiles(full_name, phone)");
  res.json(data);
});

app.listen(10000, () =>
  console.log("✅ Backend running on port 10000")
);
