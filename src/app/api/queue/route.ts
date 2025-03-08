/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the user in the database using email from session
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Upsert queue with the correct user ID from the database
    const queue = await db.queue.upsert({
      where: { userId: user.id }, // Use user.id from DB, not session.user.id
      update: {}, // No updates needed, just return existing queue
      create: { userId: user.id },
      include: { streams: true }, // Include related streams if needed
    });

    // Fetch streams sorted by upvotes
    const streams = await db.stream.findMany({
      where: {
        queueId: queue.id,
      },
      include: {
        _count: {
          select: { upvotes: true },
        },
      },
      orderBy: {
        upvotes: {
          _count: "desc",
        },
      },
    });

    return Response.json({
      message: "Streams fetched successfully",
      streams,
    });

  } catch (error) {
    console.error("Error fetching streams:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
