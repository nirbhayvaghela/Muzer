import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import db from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        const signInUser = await db.user.findUnique({
          where: {
            email: user?.email ?? "",
          },
        });

        if (!signInUser) {
          await db.user.create({
            data: {
              email: user.email ?? "",
              provider: "Google",
            },
          });
        }
      }
      return true;
    },
  },
});
