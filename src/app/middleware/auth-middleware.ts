/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function authMiddleware(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return {
      status: 401,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { status: 200, session };
}
