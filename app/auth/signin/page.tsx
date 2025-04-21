"use client";

import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Attempt to Sign in
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid Credentials, Please try again");
    } else {
      // Wait a moment to make sure the session is updated
      const session = await getSession();

      if (session?.user.role === "admin") {
        router.push("/dashboards/adminUser");
      } else {
        router.push("/dashboards/normalUser");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md p-6 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Sign In
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-2 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:border-[#388E3C] transition duration-200 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-2 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:border-[#388E3C] transition duration-200 text-gray-900"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#388E3C] hover:text-[#2c6e3f] transition duration-300"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {error && <p className="mt-2 text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full mt-4 bg-[#388E3C] text-white py-2 rounded-full shadow-md hover:bg-[#2c6e3f] transition duration-300"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
