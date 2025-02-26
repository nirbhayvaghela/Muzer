"use client";

import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleAuth = async () => {
    if (session) {
      await signOut();
    } else {
      await signIn("google");
    }
  };

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button
    className="px-4 py-2 rounded-md bg-[#7D26CD] text-white hover:bg-[#9D4DFF] transition-colors"
    onClick={handleAuth}
  >
    {session ? "Sign Out" : "Sign In"}
  </button>
  );
}

export default AuthButton;



