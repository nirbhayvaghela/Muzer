import { auth } from "@/auth";
import db from "@/lib/db";
import { NextRequest } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  // check authorized
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  // user exits
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return Response.json({ message: "User not found" }, { status: 401 });
  }

  try {
    const { streamId } = UpvoteSchema.parse(await req.json());

    // Check if the stream exists
    const stream = await db.stream.findUnique({
      where: { id: streamId },
    });
    if (!stream) {
      return Response.json(
        { message: "Stream doesn't exist." },
        { status: 404 }
      );
    } else if (stream?.creatorId !== user?.id) {
      return Response.json(
        { message: "You are not creator of this stream" },
        { status: 404 }
      );
    }

    // Check if the user has already upvoted
    const existingUpvote = await db.upvote.findUnique({
      where: { streamId_userId: { streamId, userId: user.id } },
    });

    if (existingUpvote) {
      // Remove upvote if it already exists
      await db.upvote.delete({
        where: { id: existingUpvote.id },
      });

      return Response.json({
        message: "Upvote removed",
        streamId,
      });
    }

    // Add upvote if it doesn't exist
    await db.upvote.create({
      data: { streamId, userId: user.id },
    });

    return Response.json({
      message: "Stream upvoted successfully",
      streamId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
