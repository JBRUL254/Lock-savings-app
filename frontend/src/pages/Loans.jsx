export default function Loans() {
  const apply = () => {
    fetch(import.meta.env.VITE_API + "/loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 3000 })
    });
  };

  return (
    <button onClick={apply}
      className="bg-blue-600 text-white p-3 rounded">
      Apply Loan
    </button>
  );
}
