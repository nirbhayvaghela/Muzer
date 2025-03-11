/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";

const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

// Define validation schema
const CreateStreamSchema = z.object({
  url: z.string().url(),
  creatorId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateStreamSchema.parse(body);

    // Ensure Queue Exists for User
    const userExists = await db.user.findUnique({
      where: { id: data.creatorId },
    });

    if (!userExists) {
      return NextResponse.json(
        { message: "Creator does not exist", status: false },
        { status: 400 }
      );
    }

    const queue = await db.queue.findFirst({
      where: { userId: data?.creatorId },
    });
    if (!queue) {
      return NextResponse.json(
        { message: "QueueId is required" },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const videoId = data.url.match(YT_REGEX)?.[1];
    if (!videoId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    const isStreamExits = await db.stream.findFirst({
      where: {
        queueId: queue?.id,
        extractedId: videoId,
      },
    });

    if (isStreamExits) {
      return NextResponse.json(
        { message: "This video is alredy exits." },
        { status: 409 }
      );
    }
    // Fetch YouTube Video Details
    let videoDetails: any;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.key}`
      );
      console.log(response)
      if (!response.ok) {
        return NextResponse.json(
          { message: "Failed to fetch video details from YouTube API" },
          { status: response.status }
        );
      }
      const data = await response.json(); // Parse response JSON
      console.log(data, "data"); // Logging parsed data
    
      if (!data.items || data.items.length === 0) {
        return NextResponse.json(
          { message: "Invalid video details response" },
          { status: 400 }
        );
      }
    
      videoDetails = data.items[0].snippet; // Correctly accessing snippet
    
      if (!videoDetails?.thumbnails?.medium) {
        return NextResponse.json(
          { message: "Thumbnail not available" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
      return NextResponse.json(
        { message: "Failed to fetch video details" },
        { status: 500 }
      );
    }
    

    // // Process Thumbnails
    // const thumbnails = [...videoDetails.thumbnail.thumbnails].sort(
    //   (a, b) => a.width - b.width
    // );

    const fallbackImage =
      "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg";

    // Create Stream
    const stream = await db.stream.create({
      data: {
        creatorId: data?.creatorId,
        url: data.url,
        extractedId: videoId,
        title: videoDetails.title || "Can't find video",
        thumbnail: videoDetails?.thumbnails?.medium?.url ?? fallbackImage,
        queueId: queue?.id,
        type: "Youtube",
      },
    });

    return NextResponse.json({
      message: "Stream added successfully.",
      id: stream.id,
      status: true,
    });
  } catch (error: any) {
    // console.error("Error in POST handler:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors, status: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Error while adding stream", status: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json({
        message: "streamId required.",
        status: 404,
      });
    }
    // Check if the stream exists
    const stream = await db.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { message: "Stream not found", status: false },
        { status: 404 }
      );
    }

    // Delete the stream
    await db.stream.delete({
      where: { id: streamId },
    });

    return NextResponse.json({
      message: "Stream deleted successfully",
      status: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors, status: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error deleting stream", status: false },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   const searchParams = req.nextUrl.searchParams;
//   const creatorId = searchParams.get("creatorId");

//   try {
//     const streams = await db.stream.findMany({
//       where: {
//         userId: (creatorId as string) ?? "",
//       },
//     });
//     return NextResponse.json({
//       message: "strems fetched Successfully.",
//       streams: streams,
//       status: true,
//     });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({
//       message: "Error while fetching a stream",
//       status: false,
//     });
//   }
// }
