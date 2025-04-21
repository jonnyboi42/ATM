"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUp = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic password validation (you can adjust this as needed)
    if (passwordError) {
      setError("Please fix the password issues before submitting.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Redirect to login or dashboard after successful sign-up
        router.push("/auth/signin");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  // Validate password
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) {
      setPasswordError("Password must be at least 8 characters long.");
    } else if (!hasNumber) {
      setPasswordError("Password must contain at least one number.");
    } else if (!hasUppercase) {
      setPasswordError("Password must contain at least one uppercase letter.");
    } else if (!hasLowercase) {
      setPasswordError("Password must contain at least one lowercase letter.");
    } else if (!hasSpecialChar) {
      setPasswordError("Password must contain at least one special character.");
    } else {
      setPasswordError(""); // No error if all requirements are met
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 ">
      <div className="bg-white shadow-md p-6 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Sign-Up
        </h1>
        <form onSubmit={handleSignUp} className="flex flex-col mt-6 space-y-4">
          <label htmlFor="userNameSignUp" className="block text-gray-700">
            Name
          </label>
          <input
            id="userNameSignUp"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 block w-full px-2 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:border-[#388E3C] transition duration-200 text-gray-900"
          />
          <label htmlFor="emailSignUp" className="block text-gray-700">
            Email
          </label>
          <input
            id="emailSignUp"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-2 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:border-[#388E3C] transition duration-200 text-gray-900"
          />
          <label htmlFor="passwordSignUp" className="block text-gray-700">
            Password
          </label>
          <input
            id="passwordSignUp"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
            className="mt-1 block w-full px-2 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:border-[#388E3C] transition duration-200 text-gray-900"
          />
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Have an Account Already?{" "}
              <Link
                href="/auth/signin"
                className="text-[#388E3C] hover:text-[#2c6e3f] transition duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
          <button
            type="submit"
            disabled={!!passwordError}
            className="w-full mt-4 bg-[#388E3C] text-white py-2 rounded-full shadow-md hover:bg-[#2c6e3f] transition duration-300"
          >
            Sign Up
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
