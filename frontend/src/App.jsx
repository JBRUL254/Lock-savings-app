import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const login = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setUser(data.user);
  };

  const signup = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ---------------- LOGIN PAGE ----------------
  if (!user) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>Lock Savings Login</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button onClick={login} style={styles.primary}>
            Login
          </button>
          <button onClick={signup} style={styles.secondary}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // ---------------- DASHBOARD ----------------
  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh" }}>
      {/* NAV */}
      <div style={styles.nav}>
        <strong>Lock Savings</strong>
        <div>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("savings")}>Savings</button>
          <button onClick={() => setPage("deposit")}>Deposit</button>
          <button onClick={() => setPage("withdraw")}>Withdraw</button>
          <button onClick={() => setPage("loans")}>Loans</button>
          <button onClick={logout} style={{ color: "red" }}>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 20 }}>
        {page === "dashboard" && (
          <>
            <h2>Welcome 👋</h2>
            <p>{user.email}</p>
            <p>Total Savings: <strong>KES 0.00</strong></p>
          </>
        )}

        {page === "savings" && (
          <>
            <h2>My Savings</h2>
            <p>No savings yet.</p>
          </>
        )}

        {page === "deposit" && (
          <>
            <h2>Deposit Funds</h2>
            <button
              style={styles.primary}
              onClick={() => alert("Paystack deposit coming next")}
            >
              Deposit with Paystack
            </button>
          </>
        )}

        {page === "withdraw" && (
          <>
            <h2>Withdraw</h2>
            <p>Withdrawal logic will be added.</p>
          </>
        )}

        {page === "loans" && (
          <>
            <h2>Loans</h2>
            <p>Loan application coming soon.</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
  },
  card: {
    width: 360,
    padding: 24,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
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
    marginBottom: 8,
    cursor: "pointer",
  },
  secondary: {
    width: "100%",
    padding: 12,
    background: "#eaeaea",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  nav: {
    padding: 12,
    background: "#0a7cff",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
  },
};
