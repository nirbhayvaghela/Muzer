import { auth } from "@/auth";
import db from "@/lib/db";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
    console.log(session,"session")
  if (!session?.user?.email) {
    return Response.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const user = await db.user.findFirst({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return Response.json(
      { message: "User not found" },
      { status: 401 }
    );
  }

  try {
    const data = UpvoteSchema.parse(await req.json());
    
    const existingUpvote = await db.upvote.findFirst({
      where: {
        streamId: data.streamId,
        userId: user.id,
      },
    });

    if (existingUpvote) {
      return Response.json(
        { message: "Already upvoted" },
        { status: 400 }
      );
    }

    await db.upvote.create({
      data: {
        streamId: data.streamId,
        userId: user.id,
      },
    });

    return Response.json({
      message: "Stream upvoted successfully",
      streamId: data.streamId,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error(error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}