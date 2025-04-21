// pages/transaction/transfer.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Account {
  id: string;
  userId: string;
  accountType: string;
  balance: number;
  createdAt: string;
}

const Transfer = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [amount, setAmount] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleTransfer = async () => {
    if (!fromAccountId || !toAccountId || amount === null) return;

    try {
      const response = await fetch("../api/transactions/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAccountId,
          toAccountId,
          amount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts((prevAccounts) =>
          prevAccounts.map((acc) => {
            if (acc.id === data.fromAccount.id) {
              return { ...acc, balance: data.fromAccount.balance };
            } else if (acc.id === data.toAccount.id) {
              return { ...acc, balance: data.toAccount.balance };
            }
            return acc;
          })
        );

        alert("Transfer successful!");
        router.push("/dashboards/normalUser");
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Transfer Money
        </h1>

        <p className="text-gray-600 text-center">
          Select the amount and accounts to transfer:
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

        <div className="mt-4">
          <label htmlFor="fromAccount" className="block text-gray-600">
            From Account
          </label>
          <select
            id="fromAccount"
            className="w-full px-4 py-2 border rounded-md mt-2"
            onChange={(e) => setFromAccountId(e.target.value)}
            value={fromAccountId || ""}
          >
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountType} - ${account.balance}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="toAccount" className="block text-gray-600">
            To Account
          </label>
          <select
            id="toAccount"
            className="w-full px-4 py-2 border rounded-md mt-2"
            onChange={(e) => setToAccountId(e.target.value)}
            value={toAccountId || ""}
          >
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountType} - ${account.balance}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={handleTransfer}
            disabled={
              amount === null || !fromAccountId || !toAccountId || loading
            }
            className={`w-full py-3 text-lg font-semibold text-white rounded-md transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Processing..." : "Transfer"}
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

export default Transfer;
