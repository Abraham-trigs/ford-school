"use client";

import { FC } from "react";
import { motion } from "framer-motion";

interface LoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

const LoginButton: FC<LoginButtonProps> = ({
  isLoading = false,
  disabled = false,
  onClick,
  children = "Login",
  className = "",
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative w-full py-3 px-6 rounded-md text-white font-semibold
        bg-wine hover:bg-light transition-colors
        disabled:bg-switch disabled:text-gray-400
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        <span>{children}</span>
      )}
    </motion.button>
  );
};

export default LoginButton;
