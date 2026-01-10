export default function Withdraw() {
  const withdrawMoney = async () => {
    const recipient = "RCP_xyz"; // Replace with actual Paystack recipient code
    const amount = 5000; // Example amount

    const res = await fetch(import.meta.env.VITE_API + "/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, recipient })
    });
    const data = await res.json();
    alert(JSON.stringify(data));
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Withdraw</h2>
      <button onClick={withdrawMoney} className="bg-red-600 text-white py-2 px-4 rounded">
        Withdraw Money
      </button>
    </div>
  );
}
