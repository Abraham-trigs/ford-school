"use client";

import { useRouter } from "next/navigation";
import LoginButton from "./LoginButton";

interface NavigateToLoginButtonProps {
  isLoading?: boolean;
  className?: string;
}

export default function NavigateToLoginButton({
  isLoading = false,
  className = "",
}: NavigateToLoginButtonProps) {
  const router = useRouter();

  function handleClick() {
    router.push("/login"); // navigate to login page
  }

  return (
    <LoginButton
      onClick={handleClick}
      isLoading={isLoading}
      className={className}
    >
      Login
    </LoginButton>
  );
}
