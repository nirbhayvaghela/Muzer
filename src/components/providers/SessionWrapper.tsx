import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionWrapperProps {
  children: ReactNode;
}

function SessionWrapper({ children }: SessionWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default SessionWrapper;
