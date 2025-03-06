/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const mostUpvoted = await db.upvote.groupBy({
      by: ["streamId"],
      _count: { streamId: true },
      orderBy: { _count: { streamId: "desc" } },
      take: 1,
    });

    if (mostUpvoted.length === 0) {
      return NextResponse.json(
        { message: "No streams found", status: false },
        { status: 404 }
      );
    }

    const stream = await db.stream.findUnique({
      where: { id: mostUpvoted[0].streamId },
    });

    return NextResponse.json({ stream, status: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching stream", errors: error.errors, status: false },
      { status: 500 }
    );
  }
}
