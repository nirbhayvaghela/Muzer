/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Music,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import {
  useCreateStream,
  useGetCurrentQueue,
  useGetCurrentStream,
  useGetDeleteStream,
  useUpvoteStream,
} from "@/hooks/queries";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import YouTubePlayer from "youtube-player";
import { useParams } from "next/navigation";

interface Stream {
  id: string;
  url: string;
  extractedId: string;
  title: string;
  smallImage: string;
  bigImage: string;
  creatorId: string;
  type: "Youtube";
  queueId: string;
  _count: {
    upvotes: number;
  };
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [url, setUrl] = useState<string>("");
  const [queue, setQueue] = useState<Stream[] | []>([]);
  const [currentSong, setCurrentSong] = useState<Stream | null>(null);
  const [error, setError] = useState<string>("");
  const videoPlayerRef = useRef<any>(null);
  const { dashboardId } = useParams(); 

  const isCreator = dashboardId === session?.user?.id; 
  const { mutateAsync: createStream, isPending: isCreatingStream } =
    useCreateStream();
  const { data: streams, isPending: isFecthingQueue } = useGetCurrentQueue();
  const { data: currentStream, isPending: isFecthingCurrentsong } =
    useGetCurrentStream();
  const { mutateAsync: deleteStream, isPending: isDeletingStream } =
    useGetDeleteStream();
  const { mutateAsync: upvotestream } = useUpvoteStream();

  useEffect(() => {
    if (!videoPlayerRef.current || !currentStream) {
      return;
    }
    const player = YouTubePlayer(videoPlayerRef.current);
    // const player = YouTubePlayer(videoPlayerRef.current);

    // 'loadVideoById' is queued until the player is ready to receive API calls.
    player.loadVideoById(currentSong?.extractedId as string);

    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
    player.playVideo();

    async function eventHandler(event: any) {
      // console.log(event);
      // console.log(event.data);
      if (event.data === 0) {
        // playNext();
        await deleteStream(currentSong?.id as string);
      }
    }
    player.on("stateChange", eventHandler);
    return () => {
      player.destroy();
    };
  }, [currentSong, videoPlayerRef]);

  useEffect(() => {
    if (!isFecthingQueue) {
      const data = streams?.data?.streams;
      setQueue(data);
    }
  }, [streams, isFecthingQueue]);

  useEffect(() => {
    if (!isFecthingCurrentsong) {
      const data = currentStream?.data?.stream;
      setCurrentSong(data);
    }
  }, [currentStream, isFecthingCurrentsong]);

  const addToQueue = async () => {
    try {
      if (url === "") return;
      setError("");

      // Send request to create stream
      const res = await createStream({
        creatorId: session?.user?.id ?? "",
        url,
      });

      // Handle response
      if (res?.data) {
        toast.success("Stream created successfully!");
      } else {
        throw new Error("Failed to create stream.");
      }
      setUrl("");
    } catch (error: any) {
      console.error("Error in addToQueue:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to add song.");
    }
  };

  const removeSong = async (streamId: string) => {
    try {
      const res = await deleteStream(streamId);

      if (res?.data) {
        toast.success("Stream deleted successfully!");
        console.log(res.data, "response");
      } else {
        throw new Error("Failed to delete stream.");
      }
    } catch (error: any) {
      console.error("Error in addToQueue:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to delete song.");
    }
  };

  // Handle keyboard shortcut for adding songs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addToQueue();
    }
  };

  const upvoteSong = async (streamId: string) => {
    try {
      const res = await upvotestream({ streamId });
    } catch (error: any) {
      console.error("Error in addToQueue:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Failed to upvote stream.");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#1E1E1E] p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-[#8A2BE2]">
            <Music size={24} />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex-1 flex items-center w-full">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste YouTube URL here..."
                className="w-full bg-[#2A2A2A] text-white px-4 py-2 pr-10 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] placeholder-gray-400"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <button
              onClick={addToQueue}
              className="bg-[#8A2BE2] w-24 h-10 hover:bg-[#9D4EDD] text-white px-4 py-2 rounded-r-md flex items-center gap-1 transition-colors duration-200 justify-center"
            >
              {isCreatingStream ? (
                <CircularProgress sx={{ color: "white"}} size="23px"/>
              ) : (
                <div className="flex gap-2 items-center justify-center">
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add</span>
                </div>
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 max-w-6xl mx-auto">{error}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
        {/* Queue Panel */}
        <div className="md:w-1/3 bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 bg-[#252525] border-b border-[#333]">
            <h2 className="font-bold">Queue ({queue.length ?? 0})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isFecthingQueue ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <CircularProgress sx={{ color: "#8A2BE2" }} />
              </div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <Music size={48} className="mb-2 opacity-50" />
                <p>Your queue is empty</p>
                <p className="text-sm mt-2">
                  Add songs by pasting YouTube URLs above
                </p>
              </div>
            ) : (
              <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
                {queue.map((song, index) => (
                  <li
                    key={`${song.id}-${index}`}
                    className={`flex gap-3 p-3 rounded-md cursor-pointer transition-all relative backdrop-blur-md bg-opacity-20 hover:bg-opacity-30 shadow-md border border-transparent ${
                      currentSong?.id === song.id
                        ? "border-[#8A2BE2] shadow-lg"
                        : ""
                    }`}
                    style={{ background: "rgba(42, 42, 42, 0.7)" }}
                  >
                    <div
                      className="relative flex-shrink-0 "
                      // onClick={() => playSong(song)}
                    >
                      <Image
                        width={100}
                        height={100}
                        src={song.bigImage || "/placeholder.svg"}
                        alt={song.title}
                        className="w-20 h-14 object-cover rounded-md shadow-md"
                      />
                      {currentSong?.id === song.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <div className="w-3 h-3 bg-[#8A2BE2] rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Title */}
                      <div
                        className="cursor-pointer mb-2"
                        // onClick={() => playSong(song)}
                      >
                        <p className="truncate text-sm font-medium text-white pr-2">
                          {song.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              upvoteSong(song.id);
                            }}
                            className="p-1 rounded-md bg-gray-800 text-gray-400 hover:text-white transition-all duration-200"
                            aria-label="Upvote"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <span className="text-xs font-semibold text-white px-1">
                            {song._count.upvotes}
                          </span>
                          {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downvoteSong(index);
                          }}
                          className="p-1 rounded-md bg-gray-800 text-gray-400 hover:text-white transition-all duration-200"
                          aria-label="Downvote"
                        >
                          <ChevronDown size={14} />
                        </button> */}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSong(song?.id);
                          }}
                          className="p-1 rounded-md bg-[#333] hover:bg-red-500 text-gray-400 hover:text-white transition-colors shadow-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="md:w-2/3 bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 bg-[#252525] border-b border-[#333]">
            <h2 className="font-bold">Now Playing</h2>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            {isFecthingCurrentsong ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <CircularProgress sx={{ color: "#8A2BE2" }} />
              </div>
            ) : currentSong ? (
              <div className="w-full h-full flex flex-col">
                <div className="relative pt-[56.25%] w-full bg-black">
                  {/* <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentSong}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe> */}
                  <div
                    ref={videoPlayerRef}
                    className="absolute top-0 left-0 w-full h-full"
                  ></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium">{currentSong.title}</h3>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <Music size={64} className="mb-4 opacity-50" />
                <p className="text-xl">No song selected</p>
                <p className="text-sm mt-2">
                  Add a YouTube URL and select a song to start playing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1E1E1E] p-4 text-center text-gray-500 text-sm">
        <p>
          YouTube Music Dashboard • Paste any YouTube URL to add to your queue
        </p>
      </div>
    </div>
  );
}
