import fetch from "node-fetch";

// VERIFY PAYSTACK PAYMENT
app.post("/verify-paystack", async (req, res) => {
  const { reference, user_id, amount } = req.body;

  if (!reference || !user_id || !amount) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      // Save to Supabase
      const { error } = await supabase.from("deposits").insert([
        {
          user_id,
          amount,
          reference,
          status: "success",
        },
      ]);

      if (error) throw error;

      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: "Payment not successful" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});
