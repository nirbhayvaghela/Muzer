import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import db from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        let signInUser = await db.user.findUnique({
          where: { email: user?.email ?? "" },
        });

        if (!signInUser) {
          signInUser = await db.user.create({
            data: {
              email: user.email ?? "",
              provider: "Google",
            },
          });

          await db.queue.create({
            data: {
              userId: signInUser.id,
            },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
  },
});
