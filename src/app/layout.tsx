import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/providers/SessionWrapper";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muzi",
  description: "Enjoy music collaboratively",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          <QueryProvider>
            {children}{" "}
            <Toaster
              position="top-right"
              toastOptions={{
                success: {
                  style: {
                    backgroundColor: "green",
                    color: "white",
                  },
                },
                error: {
                  style: {
                    backgroundColor: "red",
                    color: "white",
                  },
                },
              }}
            />
          </QueryProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
