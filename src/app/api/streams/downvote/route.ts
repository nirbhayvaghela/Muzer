import { auth } from "@/auth";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  console.log(session?.user?.email);

  const user = await db.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized.",
      },
      {
        status: 411,
      }
    );
  }

  try {
    const data = UpvoteSchema.parse(await req.json());
    await db.upvote.delete({
      where: {
        streamId_userId: {
          streamId: data.streamId,
          userId: user.id,
        },
      },
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      message: "Error while addressing a stream",
      status: 411,
    });
  }
}
