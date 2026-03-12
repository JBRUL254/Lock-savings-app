import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ================= AUTH SESSION ================= */

  useEffect(() => {

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
    };

    getSession();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {

    if (!user) return;

    const loadProfile = async () => {

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    loadProfile();

  }, [user]);

  /* ================= LOGIN ================= */

  const login = async () => {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      alert(error.message);
      return;
    }

    setUser(data.user);
  };

  /* ================= SIGNUP ================= */

  const signup = async () => {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    await supabase.from("profiles").insert({
      id: user.id,
      email: email,
      wallet_balance: 0
    });

    alert("Account created. Please login.");
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {

    await supabase.auth.signOut();
    setUser(null);
  };

  /* ================= LOGIN PAGE ================= */

  if (!user) {

    return (
      <div style={styles.center}>

        <div style={styles.card}>

          <h2>Lock Savings</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
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

  /* ================= DASHBOARD ================= */

  return (

    <div style={{padding:40}}>

      <h2>Dashboard</h2>

      <p><b>Email:</b> {profile?.email}</p>

      <p>
        <b>Wallet Balance:</b>  
        KES {profile?.wallet_balance ?? 0}
      </p>

      <button onClick={logout}>
        Logout
      </button>

    </div>

  );

}

/* ================= STYLES ================= */

const styles = {

  center:{
    minHeight:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"#f4f6f8"
  },

  card:{
    background:"#fff",
    padding:30,
    borderRadius:10,
    width:350,
    boxShadow:"0 10px 30px rgba(0,0,0,0.1)"
  },

  input:{
    width:"100%",
    padding:12,
    marginBottom:10
  },

  primary:{
    width:"100%",
    padding:12,
    background:"#1e88e5",
    color:"#fff",
    border:"none",
    marginBottom:8
  },

  secondary:{
    width:"100%",
    padding:12
  }

};
