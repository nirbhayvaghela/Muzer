/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: any) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = params.id; 
  console.log(userId,"userID")
  try {
    // Find the user from the database using email
    const user = await db.user.findUnique({
      where: { id: userId},
      include: { Queue: true },
    });

    if (!user?.Queue) {
      return NextResponse.json({ message: "Queue not found for user" }, { status: 404 });
    }

    // Fetch the most upvoted stream for the user's queue
    const mostUpvoted = await db.stream.findFirst({
      where: {
        queueId: user.Queue.id, 
      },
      orderBy: {
        upvotes: {
          _count: "desc",
        },
      },
      include: {
        upvotes: true,
      },
    });

    return NextResponse.json({ stream: mostUpvoted, status: 200 });
  } catch (error: any) {
    console.error("Error fetching stream:", error);
    return NextResponse.json(
      { message: "Error fetching stream", errors: error.errors, status: false },
      { status: 500 }
    );
  }
}
