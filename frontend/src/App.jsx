import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client (frontend uses anon key only)
 * These MUST be set in Render Static Site ENV
 */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // LOGIN
  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
    }
  };

  // SIGN UP
  const handleSignup = async () => {
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert("Account created! Check your email if confirmation is required.");
      setUser(data.user);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ===== DASHBOARD (AFTER LOGIN) =====
  if (user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          background: "#f4f6f8",
        }}
      >
        <h2>Welcome 👋</h2>
        <p>{user.email}</p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 20,
            padding: 12,
            background: "#ff3b3b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // ===== LOGIN PAGE =====
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 24,
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Lock Savings Login
        </h2>

        {error && (
          <div
            style={{
              background: "#ffe0e0",
              color: "#b00000",
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#0a7cff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            marginBottom: 10,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#eaeaea",
            color: "#000",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Create account
        </button>
      </div>
    </div>
  );
}
