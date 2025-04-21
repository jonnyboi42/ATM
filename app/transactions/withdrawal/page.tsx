"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const WithdrawalPage = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const accountId = searchParams.get("accountId");

  const amountOptions = [5, 20, 60, 100, 200, 300, 400, 500];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    fetchAccounts();
  }, [status, router]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        console.error("Error fetching accounts");
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!accountId || amount === null) return;

    try {
      const response = await fetch("/api/transactions/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId, amount, type: "withdrawal" }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Withdrawal successful!");
        router.push("/dashboards/normalUser");
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Withdraw Money
        </h1>
        <p className="text-gray-600 text-center">
          Select the amount you want to withdraw:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {amountOptions.map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value)}
              className={`px-6 py-3 border rounded-md text-lg font-semibold transition duration-300 w-28 ${
                amount === value
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              ${value}
            </button>
          ))}
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleTransaction}
            disabled={amount === null || loading}
            className={`w-full py-3 text-lg font-semibold text-white rounded-md transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 text-lg font-semibold text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;
