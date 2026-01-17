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
    if (!error) setUser(data.user);
    else alert(error.message);
  };

  const signup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (!error) setUser(data.user);
    else alert(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ================= PAYSTACK REDIRECT =================
  const deposit = async () => {
    if (!amount || amount <= 0) return alert("Enter valid amount");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/paystack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount,
      }),
    });

    const data = await res.json();
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      alert("Failed to start payment");
    }
  };

  if (!user) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>Lock Savings</h2>
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button onClick={login} style={styles.primary}>Login</button>
          <button onClick={signup} style={styles.secondary}>Create Account</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome 👋</h2>
      <p>{user.email}</p>

      <h3>Deposit (MPESA / Airtel)</h3>
      <input
        type="number"
        placeholder="Amount in KES"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />
      <button onClick={deposit} style={styles.primary}>
        Pay with Paystack
      </button>

      <br /><br />
      <button onClick={logout} style={{ color: "red" }}>Logout</button>
    </div>
  );
}

const styles = {
  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: 360,
    padding: 24,
    background: "#fff",
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
  },
  primary: {
    width: "100%",
    padding: 12,
    background: "#0a7cff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },
  secondary: {
    width: "100%",
    padding: 12,
    background: "#eaeaea",
    border: "none",
    borderRadius: 6,
  },
};
