// TransactionButton.tsx
import React from "react";

interface TransactionButtonProps {
  label: string;
  onClick: () => void;
  type?: "deposit" | "withdrawal" | "transfer"; // Optional styling
  className?: string; // Add this line to accept className
}

const TransactionButton: React.FC<TransactionButtonProps> = ({
  label,
  onClick,
  type,
  className = "", // Default to an empty string if no className is provided
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-black ${className}`} // Explicitly set text color here
    >
      {label}
    </button>
  );
};

export default TransactionButton;
