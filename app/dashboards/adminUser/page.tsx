"use client";

import { Decimal } from "@prisma/client/runtime/library";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header"; // 👈 Import Header

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  accounts: {
    id: string;
    accountType: string;
    accountNumber: string;
    balance: string;
  }[];
};

type Accounts = {
  id: string;
  userId: string;
  accountType: string;
  accountNumber: string;
  balance: string;
  createdAt: string;
  transactions: Transaction[];
};

type Transaction = {
  id: string;
  accountId: string;
  type: "deposit" | "withdrawal";
  amount: string;
  createdAt: string;
};

export default function AdminDash() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSearch = async () => {
    if (!email) {
      setError("Please enter an email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/searchUsers?email=${email}`);
      if (!response.ok) {
        throw new Error("User not found or error with the request.");
      }
      const data = await response.json();
      setUser(data.user);
      setAccounts(data.accounts);
    } catch (error) {
      console.error("Error", error);
      setError("Failed to find user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header /> {/* 👈 Inserted Header here */}
      <div className="px-6 py-4">
        <h1 className="text-3xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>

        {/* Search Bar */}
        <div className="mt-6 flex gap-4 items-center">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Search for a user by email"
            className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-md shadow hover:bg-gray-800 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {user ? (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-700">User Found</h2>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>

            {accounts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-medium text-gray-700">Accounts</h3>
                {accounts.map((account) => (
                  <div key={account.id} className="mt-2 border-t pt-2">
                    <p>
                      <strong>Account Type:</strong> {account.accountType}
                    </p>
                    <p>
                      <strong>Account Number:</strong> {account.accountNumber}
                    </p>
                    <p>
                      <strong>Balance:</strong> ${account.balance}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-gray-600">No user found.</p>
        )}
      </div>
    </div>
  );
}
