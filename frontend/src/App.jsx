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

  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const [deposits, setDeposits] = useState([]);
  const [loans, setLoans] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  // ---------------- AUTH ----------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchDeposits();
      fetchLoans();
    }
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ---------------- PAYSTACK DEPOSIT ----------------
  const depositWithPaystack = async () => {
    if (!user) return alert("Please login first");
    if (depositAmount <= 0) return alert("Enter a valid amount");

    if (!window.PaystackPop)
      return alert("Paystack not loaded. Refresh the page and try again.");

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: depositAmount * 100, // convert KES to kobo
      currency: "KES",
      ref: `lock_savings_${Math.floor(Math.random() * 1000000000)}`,
      onClose: () => alert("Payment window closed"),
      callback: async (response) => {
        alert(`Payment successful! Reference: ${response.reference}`);

        const { error } = await supabase.from("deposits").insert([
          {
            user_id: user.id,
            amount: depositAmount,
            reference: response.reference,
            status: "success",
          },
        ]);

        if (error) console.error("Error saving deposit:", error);
        else {
          setDepositAmount(0);
          fetchDeposits();
        }
      },
    });

    handler.openIframe();
  };

  // ---------------- FETCH DEPOSITS ----------------
  const fetchDeposits = async () => {
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
      setDeposits(data);
      const total = data.reduce((sum, d) => sum + d.amount, 0);
      setTotalSavings(total);
    }
  };

  // ---------------- WITHDRAW ----------------
  const withdraw = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > totalSavings)
      return alert("Enter a valid amount to withdraw");

    const { error } = await supabase.from("withdrawals").insert([
      {
        user_id: user.id,
        amount: withdrawAmount,
        status: "pending",
      },
    ]);

    if (error) console.error(error);
    else {
      alert("Withdrawal request submitted");
      setWithdrawAmount(0);
      fetchDeposits();
    }
  };

  // ---------------- LOANS ----------------
  const fetchLoans = async () => {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setLoans(data);
  };

  const requestLoan = async () => {
    const amount = prompt("Enter loan amount in KES");
    if (!amount || isNaN(amount)) return;
    const { error } = await supabase.from("loans").insert([
      {
        user_id: user.id,
        amount: Number(amount),
        status: "pending",
      },
    ]);
    if (error) console.error(error);
    else fetchLoans();
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

      <div style={{ padding: 20 }}>
        {page === "dashboard" && (
          <>
            <h2>Welcome 👋</h2>
            <p>{user.email}</p>
            <p>
              Total Savings: <strong>KES {totalSavings.toLocaleString()}</strong>
            </p>
          </>
        )}

        {page === "savings" && (
          <>
            <h2>My Savings</h2>
            {deposits.length === 0 ? (
              <p>No savings yet.</p>
            ) : (
              <ul>
                {deposits.map((d) => (
                  <li key={d.id}>
                    KES {d.amount} - {new Date(d.created_at).toLocaleString()} -{" "}
                    {d.status}
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
              placeholder="Enter amount in KES"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              style={styles.input}
            />
            <button style={styles.primary} onClick={depositWithPaystack}>
              Deposit with Paystack
            </button>
          </>
        )}

        {page === "withdraw" && (
          <>
            <h2>Withdraw</h2>
            <p>Total Savings: KES {totalSavings.toLocaleString()}</p>
            <input
              type="number"
              placeholder="Enter amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              style={styles.input}
            />
            <button style={styles.primary} onClick={withdraw}>
              Submit Withdrawal
            </button>
          </>
        )}

        {page === "loans" && (
          <>
            <h2>Loans</h2>
            <button style={styles.primary} onClick={requestLoan}>
              Request Loan
            </button>
            {loans.length === 0 ? (
              <p>No loans yet.</p>
            ) : (
              <ul>
                {loans.map((l) => (
                  <li key={l.id}>
                    KES {l.amount} - {new Date(l.created_at).toLocaleString()} -{" "}
                    {l.status}
                  </li>
                ))}
              </ul>
            )}
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
