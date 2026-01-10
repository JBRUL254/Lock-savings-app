import { supabase } from "../supabase";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert("Check your email to confirm your account!");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <input
          className="input w-full p-2 border rounded mb-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input w-full p-2 border rounded mb-4"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={register} className="bg-green-600 text-white w-full py-2 rounded">
          Register
        </button>
        <p className="mt-2 text-sm">
          Already have an account? <Link to="/" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
