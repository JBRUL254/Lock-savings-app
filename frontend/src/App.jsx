import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert(error.message);
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ REAL PAYSTACK DEPOSIT
  const deposit = () => {
    if (!window.PaystackPop) {
      alert("Paystack not loaded");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Number(amount) * 100,
      currency: "KES",
      ref: "LOCK_" + Math.floor(Math.random() * 1000000000),

      callback: async (response) => {
        alert("Payment successful");

        await supabase.from("deposits").insert({
          user_id: user.id,
          amount: Number(amount),
          reference: response.reference,
          status: "success",
        });

        setAmount("");
      },

      onClose: () => {
        alert("Payment cancelled");
      },
    });

    handler.openIframe();
  };

  // 🔐 LOGIN PAGE
  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Login</h2>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  // 🏦 DASHBOARD
  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome</h2>
      <p>{user.email}</p>

      <input
        type="number"
        placeholder="Amount (KES)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />

      <button onClick={deposit}>Deposit with Paystack</button>
      <br /><br />

      <button onClick={logout} style={{ color: "red" }}>
        Logout
      </button>
    </div>
  );
}
