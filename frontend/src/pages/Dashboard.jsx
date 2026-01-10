import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to Lock Savings 💰</h1>
      <div className="flex flex-col gap-4">
        <Link to="/deposit" className="bg-green-600 text-white py-2 px-4 rounded w-40 text-center">
          Deposit
        </Link>
        <Link to="/withdraw" className="bg-red-600 text-white py-2 px-4 rounded w-40 text-center">
          Withdraw
        </Link>
        <Link to="/loans" className="bg-blue-600 text-white py-2 px-4 rounded w-40 text-center">
          Loans
        </Link>
      </div>
    </div>
  );
}
