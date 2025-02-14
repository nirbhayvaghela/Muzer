/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";

export const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;

// Define validation schema
const CreateStreamSchema = z.object({
  url: z.string().url(),
  creatorId: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateStreamSchema.parse(body);

    //TODO: remoe this  validation for creatorID
    const iscreatorExist = await db.user.findFirst({
      where:{
        id: data?.creatorId
      }
    });

    if(!iscreatorExist) {
      return NextResponse.json({
        message:"creator doesn't exist"
      });
    }

    if (!data.url.trim()) {
      return NextResponse.json(
        {
          message: "YouTube link cannot be empty",
        },
        {
          status: 400,
        },
      );
    }

    // YouTube URL validationa
    const videoId = data.url.match(YT_REGEX)?.[1];
    if (!videoId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    // Fetch video details with error handling
    let videoDetails;
    try {
      videoDetails = await youtubesearchapi.GetVideoDetails(videoId);
      if (!videoDetails?.thumbnail?.thumbnails?.length) {
        throw new Error('Invalid video details response');
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      return NextResponse.json(
        { message: "Failed to fetch video details" },
        { status: 500 }
      );
    }

    // Process thumbnails
    const thumbnails = [...videoDetails.thumbnail.thumbnails].sort(
      (a, b) => a.width - b.width
    );

    const fallbackImage = "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg";

    // Create stream with proper error handling
    const stream = await db.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId: videoId,
        title: videoDetails.title || "Can't find video",
        smallImage: thumbnails.length > 1 
          ? thumbnails[thumbnails.length - 2].url 
          : thumbnails[0]?.url ?? fallbackImage,
        bigImage: thumbnails[thumbnails.length - 1]?.url ?? fallbackImage,
        type: "Youtube"
      }
    });

    return NextResponse.json({
      message: "Stream added Successfully.",
      id: stream.id,
      status: true
    });

  } catch (error) {
    console.error('Error in POST handler:', error);
    
    // Provide more specific error messages based on error type
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Invalid input data",
        errors: error.errors,
        status: false
      }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({
        message: error.message || "Error while adding stream",
        status: false
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "An unexpected error occurred",
      status: false
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const creatorId = searchParams.get("creatorId");

  try {
    const streams = await db.stream.findMany({
      where: {
        userId: (creatorId as string) ?? "",
      },
    });
    return NextResponse.json({
      message: "strems fetched Successfully.",
      streams: streams,
      status: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Error while fetching a stream",
      status: false,
    });
  }
}
