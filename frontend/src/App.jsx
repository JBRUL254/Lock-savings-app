import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* ---------------- SUPABASE CLIENT ---------------- */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- AUTH SESSION ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  /* ---------------- AUTH ---------------- */
  const login = async () => {
    setLoading(true);
    await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
  };

  const signup = async () => {
    setLoading(true);
    const { data } = await supabase.auth.signUp({ email, password });

    if (data?.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: email.split("@")[0],
        phone: "",
        wallet_balance: 0,
        accepted_terms: true,
      });
    }

    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  /* ---------------- PAYSTACK DEPOSIT (REDIRECT) ---------------- */
  const depositWithPaystack = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/paystack/init`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            amount: Number(amount),
            user_id: user.id,
          }),
        }
      );

      const data = await res.json();

      if (!data.url) {
        alert("Failed to initialize payment");
        return;
      }

      // 🔥 THIS OPENS THE REAL PAYSTACK CHECKOUT PAGE
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGIN SCREEN ---------------- */
  if (!user) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>Lock Savings</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password / PIN"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.primary} disabled={loading}>
            Login
          </button>

          <button onClick={signup} style={styles.secondary}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <div style={styles.nav}>
        <strong>Lock Savings</strong>
        <button onClick={logout} style={{ color: "red" }}>
          Logout
        </button>
      </div>

      <h2>Welcome, {profile?.full_name}</h2>
      <p>
        Account: <strong>{profile?.phone || "Not set"}</strong>
      </p>

      <h3>
        Wallet Balance:{" "}
        <strong>KES {profile?.wallet_balance ?? 0}</strong>
      </h3>

      <div style={styles.card}>
        <h3>Deposit Funds</h3>

        <input
          type="number"
          placeholder="Enter amount (KES)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={depositWithPaystack}
          style={styles.primary}
          disabled={loading}
        >
          Deposit with Paystack
        </button>

        <p style={{ fontSize: 12, marginTop: 10 }}>
          You will be redirected to Paystack to complete payment via MPESA.
        </p>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: 360,
    marginTop: 20,
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
    cursor: "pointer",
  },
  secondary: {
    width: "100%",
    padding: 12,
    background: "#eaeaea",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 8,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
};
