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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("dashboard");

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [deposits, setDeposits] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  // ---------------- AUTH ----------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (user) fetchDeposits();
  }, [user]);

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

  // ---------------- PAYSTACK DEPOSIT (REDIRECT FLOW) ----------------
  const depositWithPaystack = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "0712345678", // metadata only
          amount: Number(depositAmount),
        }),
      });

      const data = await res.json();

      if (data.authorization_url) {
        // ✅ THIS IS THE KEY FIX
        window.location.href = data.authorization_url;
      } else {
        alert("Failed to initialize Paystack payment");
      }
    } catch (err) {
      console.error(err);
      alert("Payment error");
    }
  };

  // ---------------- FETCH DEPOSITS ----------------
  const fetchDeposits = async () => {
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", user.id);

    if (error) console.error(error);
    else {
      setDeposits(data);
      const total = data.reduce((sum, d) => sum + Number(d.amount), 0);
      setTotalSavings(total);
    }
  };

  // ---------------- WITHDRAW ----------------
  const withdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0)
      return alert("Enter valid amount");
    if (withdrawAmount > totalSavings)
      return alert("Insufficient balance");

    const { error } = await supabase.from("withdrawals").insert([
      {
        user_id: user.id,
        amount: Number(withdrawAmount),
        status: "pending",
      },
    ]);

    if (error) console.error(error);
    else {
      alert("Withdrawal request submitted");
      setWithdrawAmount("");
    }
  };

  // ---------------- LOGIN PAGE ----------------
  if (!user) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>Lock Savings</h2>
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

  // ---------------- DASHBOARD ----------------
  return (
    <div style={{ minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={styles.nav}>
        <strong>Lock Savings</strong>
        <div>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("savings")}>Savings</button>
          <button onClick={() => setPage("deposit")}>Deposit</button>
          <button onClick={() => setPage("withdraw")}>Withdraw</button>
          <button onClick={logout} style={{ color: "red" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {page === "dashboard" && (
          <>
            <h2>Welcome 👋</h2>
            <p>{user.email}</p>
            <p>
              Total Savings:{" "}
              <strong>KES {totalSavings.toLocaleString()}</strong>
            </p>
          </>
        )}

        {page === "savings" && (
          <>
            <h2>My Savings</h2>
            {deposits.length === 0 ? (
              <p>No deposits yet</p>
            ) : (
              <ul>
                {deposits.map((d) => (
                  <li key={d.id}>
                    KES {d.amount} —{" "}
                    {new Date(d.created_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {page === "deposit" && (
          <>
            <h2>Deposit Funds</h2>
            <input
              type="number"
              placeholder="Amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={styles.input}
            />
            <button style={styles.primary} onClick={depositWithPaystack}>
              Continue to Paystack
            </button>
          </>
        )}

        {page === "withdraw" && (
          <>
            <h2>Withdraw</h2>
            <input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={styles.input}
            />
            <button style={styles.primary} onClick={withdraw}>
              Submit Withdrawal
            </button>
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
    justifyContent: "center",
    alignItems: "center",
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
