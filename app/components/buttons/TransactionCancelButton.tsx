import React from "react";
import { useRouter } from "next/navigation";

const TransactionCancelButton: React.FC = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/dashboards/normalUser");
  };

  return (
    <button
      onClick={handleCancel}
      className="w-full py-3 text-lg font-semibold text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300"
    >
      Cancel
    </button>
  );
};

export default TransactionCancelButton;
