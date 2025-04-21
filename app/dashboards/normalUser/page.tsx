"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TransactionButton from "../../components/TransactionButton";
import Header from "@/app/components/Header";

export default function Dash() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated") {
      fetchAccounts();
    }
  }, [status, router]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();

        // Sort so that Checking comes first
        const sortedAccounts = data.sort((a: any, b: any) => {
          if (
            a.accountType.toLowerCase() === "checking" &&
            b.accountType.toLowerCase() !== "checking"
          )
            return -1;
          if (
            a.accountType.toLowerCase() !== "checking" &&
            b.accountType.toLowerCase() === "checking"
          )
            return 1;
          return 0;
        });

        setAccounts(sortedAccounts);
      } else {
        console.error("Error fetching accounts");
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="px-6 py-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Accounts</h2>

        {loading ? (
          <p className="mt-4 text-gray-600">Loading Accounts...</p>
        ) : accounts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
              >
                <h3 className="text-xl font-medium text-gray-700">
                  {account.accountType}
                </h3>
                <p className="mt-2 text-lg text-gray-600">
                  Balance: ${account.balance}
                </p>
                <div className="mt-4 space-x-4">
                  <TransactionButton
                    label="Deposit"
                    onClick={() =>
                      router.push(
                        `/transactions/deposit?accountId=${account.id}`
                      )
                    }
                    className="border-2 border-[#000000] text-black px-4 py-2 rounded-full shadow-md hover:bg-[#000000] hover:text-[#ffffff] transition duration-300"
                  />
                  <TransactionButton
                    label="Withdraw"
                    onClick={() =>
                      router.push(
                        `/transactions/withdrawal?accountId=${account.id}`
                      )
                    }
                    className="border-2 border-[#000000] text-black px-4 py-2 rounded-full shadow-md hover:bg-[#000000] hover:text-[#ffffff] transition duration-300"
                  />
                  <TransactionButton
                    label="Transfer"
                    onClick={() =>
                      router.push(
                        `/transactions/transfer?accountId=${account.id}`
                      )
                    }
                    className="border-2 border-[#000000] text-black px-4 py-2 rounded-full shadow-md hover:bg-[#000000] hover:text-[#ffffff] transition duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No accounts available.</p>
        )}
      </div>
    </div>
  );
}
