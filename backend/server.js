import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 10000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const paymentsFile = path.join(__dirname, "payments.json");

// ================= INIT PAYSTACK PAYMENT =================
app.post("/api/paystack", async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: "Email and amount are required" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Number(amount) * 100,
        currency: "KES",
        callback_url: `${process.env.BASE_URL}/api/verify-payment`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      authorization_url: response.data.data.authorization_url,
    });
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

// ================= VERIFY PAYMENT =================
app.get("/api/verify-payment", async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.status(400).send("Missing reference");

  try {
    const verify = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = verify.data.data;

    const record = {
      email: data.customer.email,
      amount: data.amount / 100,
      reference: data.reference,
      status: data.status,
      date: new Date().toISOString(),
    };

    let payments = [];
    if (fs.existsSync(paymentsFile)) {
      payments = JSON.parse(fs.readFileSync(paymentsFile));
    }

    payments.push(record);
    fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2));

    res.send(`
      <html>
        <body style="font-family:Arial;text-align:center;margin-top:10%">
          <h2>✅ Payment Successful</h2>
          <p>Email: ${record.email}</p>
          <p>Amount: KES ${record.amount}</p>
          <p>Status: ${record.status}</p>
          <a href="${process.env.FRONTEND_URL}">Return to app</a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Verify error:", err.response?.data || err.message);
    res.status(500).send("Payment verification failed");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
