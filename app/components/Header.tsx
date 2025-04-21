import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const [userTitleHeading, setUserTitleHeading] = useState("Loading...");

  useEffect(() => {
    if (!session) return;

    if (session.user.role === "admin") {
      setUserTitleHeading("Admin");
    } else {
      setUserTitleHeading("Account Summary");
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="bg-white shadow-md p-6 rounded-lg mx-6 my-4">
        <h1 className="text-3xl font-semibold text-gray-800">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md p-6 rounded-lg mx-6 my-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {userTitleHeading}
        </h1>
        <button
          onClick={() => signOut()}
          className="bg-[#ffffff] border-2 border-[#000000] text-black px-4 py-2 rounded-full shadow-md hover:bg-[#000000] hover:text-[#ffffff] transition duration-300"
        >
          Sign Out
        </button>
      </div>
      <p className="mt-2 text-gray-600">Welcome, {session?.user?.name}!</p>
    </div>
  );
}
