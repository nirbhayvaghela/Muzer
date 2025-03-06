/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  const searchParams = req.nextUrl.searchParams;
  const queueId = searchParams.get("queueId");
  if (!queueId) {
    return Response.json({ message: "QueueId is required" }, { status: 404 });
  }

  try {
    const streams = await db.stream.findMany({
      where: {
        queueId: queueId,
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
      message: "Stream upvoted successfully",
      streams,
    });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
