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
      onClick={handleAuth}
      className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
    >
      {session ? "Sign Out" : "Sign In"}
    </button>
  );
}

export default AuthButton;




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