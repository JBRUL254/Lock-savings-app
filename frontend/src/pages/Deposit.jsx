export default function Deposit() {
  const pay = () => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: "user@email.com",
      amount: 5000 * 100,
      callback: res => {
        fetch(import.meta.env.VITE_API + "/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: res.reference,
            amount: 5000,
            lock_until: "2026-01-01"
          })
        });
      }
    });
    handler.openIframe();
  };

  return (
    <button onClick={pay}
      className="bg-green-600 text-white p-3 rounded">
      Deposit with Paystack
    </button>
  );
}
