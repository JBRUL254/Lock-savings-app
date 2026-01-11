export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6f8",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: 350,
          padding: 24,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Lock Savings Login</h2>

        <input
          placeholder="Email"
          style={{ width: "100%", padding: 10, marginTop: 12 }}
        />
        <input
          type="password"
          placeholder="Password"
          style={{ width: "100%", padding: 10, marginTop: 12 }}
        />

        <button
          style={{
            width: "100%",
            padding: 12,
            marginTop: 16,
            background: "#0a7cff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
