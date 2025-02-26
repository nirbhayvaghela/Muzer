"use client"
import React, { useState } from 'react';
import { Search, Plus, Music, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
}

export default function Dashboard() {
  const [url, setUrl] = useState<string>('');
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [error, setError] = useState<string>('');

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Fetch video title and thumbnail using YouTube API
  const fetchVideoDetails = async (videoId: string) => {
    try {
      // In a real app, you would use the YouTube API here
      // For this demo, we'll create a placeholder with the video ID
      const title = `YouTube Video ${videoId}`;
      const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      return { id: videoId, title, thumbnail };
    } catch (error) {
      console.error('Error fetching video details:', error);
      setError('Failed to fetch video details');
      return null;
    }
  };

  const addToQueue = async () => {
    setError('');
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    const songDetails = await fetchVideoDetails(videoId);
    if (songDetails) {
      setQueue(prev => [...prev, songDetails]);
      setUrl('');
      
      // If no song is currently playing, set this as current
      if (!currentSong) {
        setCurrentSong(songDetails);
      }
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
  };

  const removeSong = (index: number) => {
    const newQueue = [...queue];
    const removedSong = newQueue.splice(index, 1)[0];
    setQueue(newQueue);
    
    // If the removed song was playing, play the next song or clear player
    if (currentSong && currentSong.id === removedSong.id) {
      if (newQueue.length > 0) {
        setCurrentSong(newQueue[0]);
      } else {
        setCurrentSong(null);
      }
    }
  };

  // Handle keyboard shortcut for adding songs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addToQueue();
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#1E1E1E] p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-[#8A2BE2]">
            <Music size={24} />
            <h1 className="text-xl font-bold">YouTube Music Dashboard</h1>
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
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button
              onClick={addToQueue}
              className="bg-[#8A2BE2] hover:bg-[#9D4EDD] text-white px-4 py-2 rounded-r-md flex items-center gap-1 transition-colors duration-200"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2 max-w-6xl mx-auto">{error}</p>}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
        {/* Queue Panel */}
        <div className="md:w-1/3 bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 bg-[#252525] border-b border-[#333]">
            <h2 className="font-bold">Queue ({queue.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <Music size={48} className="mb-2 opacity-50" />
                <p>Your queue is empty</p>
                <p className="text-sm mt-2">Add songs by pasting YouTube URLs above</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {queue.map((song, index) => (
                  <li 
                    key={`${song.id}-${index}`}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all hover:bg-[#2A2A2A] ${currentSong?.id === song.id ? 'bg-[#2A2A2A] border-l-4 border-[#8A2BE2]' : ''}`}
                  >
                    <div className="relative flex-shrink-0" onClick={() => playSong(song)}>
                      <Image
                        width="100"
                        height="100"
                        src={song.thumbnail} 
                        alt={song.title} 
                        className="w-20 h-14 object-cover rounded"
                      />
                      {currentSong?.id === song.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <div className="w-3 h-3 bg-[#8A2BE2] rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => playSong(song)}>
                      <p className="truncate text-sm">{song.title}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSong(index);
                      }}
                      className="p-1 rounded-full hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
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
            {currentSong ? (
              <div className="w-full h-full flex flex-col">
                <div className="relative pt-[56.25%] w-full bg-black">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentSong.id}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium">{currentSong.title}</h3>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <Music size={64} className="mb-4 opacity-50" />
                <p className="text-xl">No song selected</p>
                <p className="text-sm mt-2">Add a YouTube URL and select a song to start playing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1E1E1E] p-4 text-center text-gray-500 text-sm">
        <p>YouTube Music Dashboard • Paste any YouTube URL to add to your queue</p>
      </div>
    </div>
  );
}
