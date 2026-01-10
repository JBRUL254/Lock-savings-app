import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabase.js";
import { paystack } from "./paystack.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("API running ✅"));

/* VERIFY PAYSTACK PAYMENT */
app.post("/verify", async (req, res) => {
  const { reference, user_id, amount, lock_until } = req.body;

  const verify = await paystack.get(`/transaction/verify/${reference}`);
  if (verify.data.data.status !== "success")
    return res.status(400).json({ error: "Payment failed" });

  await supabase.from("savings").insert([
    { user_id, amount, lock_until }
  ]);

  res.json({ success: true });
});

/* WITHDRAW */
app.post("/withdraw", async (req, res) => {
  const { amount, recipient } = req.body;

  const transfer = await paystack.post("/transfer", {
    source: "balance",
    amount: amount * 100,
    recipient,
    reason: "Savings withdrawal"
  });

  res.json(transfer.data);
});

/* APPLY LOAN */
app.post("/loan", async (req, res) => {
  const { user_id, amount } = req.body;

  const { data } = await supabase
    .from("savings")
    .select("amount")
    .eq("user_id", user_id);

  const totalSaved = data.reduce((a, b) => a + Number(b.amount), 0);
  if (amount > totalSaved * 0.5)
    return res.status(400).json({ error: "Loan limit exceeded" });

  const interest = amount * 0.1;
  await supabase.from("loans").insert([
    {
      user_id,
      amount,
      interest,
      total_repay: amount + interest
    }
  ]);

  res.json({ success: true });
});

app.listen(process.env.PORT || 5000);
