"use client";
import { useEffect, useRef, useState } from "react";
import {
  Music2,
  PlayCircle,
  Radio,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import AuthButton from "@/components/authButton";

function App() {
  const [url, setUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: `rgba(138, 43, 226, ${Math.random() * 0.5 + 0.2})`,
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
        },
      });
    }

    function animate() {
      if (!ctx) return;
      if (!canvas) return;
      requestAnimationFrame(animate);
      ctx.fillStyle = "rgba(18, 18, 18, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        if (particle.x < 0 || particle.x > canvas.width)
          particle.velocity.x *= -1;
        if (particle.y < 0 || particle.y > canvas.height)
          particle.velocity.y *= -1;
      });
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <nav className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Music2 className="h-8 w-8 text-[#8A2BE2]" />
              <span className="ml-2 text-xl font-bold">Muzi</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
              <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#1DB954] text-transparent bg-clip-text mb-8">
              Your Music, Your Way
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Stream millions of songs with crystal clear quality. Discover new
              artists and create your perfect playlist.
            </p>
            <div className="relative w-1/3 m-auto mb-7">
              <Input
                type="url"
                placeholder="Paste user's public dashboard URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-7 pr-24 h-12 bg-black/40 backdrop-blur-lg border-white/10 text-white placeholder:text-gray-400 focus:border-[#8A2BE2] focus:ring-[#8A2BE2] transition-all duration-300"
                required
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center">
                <Button
                  type="submit"
                  className="bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white px-6 h-9  shadow-[0_0_15px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] transition-all duration-300"
                >
                  Go
                </Button>
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="bg-[#8A2BE2] hover:bg-[#7B27CC] text-white px-8 py-6 text-lg rounded-full shadow-[0_0_15px_rgba(138,43,226,0.5)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(138,43,226,0.8)]"
            >
              Get Started <ChevronRight className="ml-2" />
            </Button>
          </div>

          <div className="mt-28">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-6 transform transition-all duration-300 hover:translate-y--2 hover:shadow-[0_0_30px_rgba(138,43,226,0.3)]">
                <div className="flex flex-col items-center text-center">
                  <Radio className="h-12 w-12 text-[#8A2BE2] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Live Radio</h3>
                  <p className="text-gray-400">
                    Listen to curated stations based on your mood and taste
                  </p>
                </div>
              </Card>
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-6 transform transition-all duration-300 hover:translate-y--2 hover:shadow-[0_0_30px_rgba(138,43,226,0.3)]">
                <div className="flex flex-col items-center text-center">
                  <PlayCircle className="h-12 w-12 text-[#8A2BE2] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Offline Mode</h3>
                  <p className="text-gray-400">
                    Download your favorite tracks and listen anywhere
                  </p>
                </div>
              </Card>
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-6 transform transition-all duration-300 hover:translate-y--2 hover:shadow-[0_0_30px_rgba(138,43,226,0.3)]">
                <div className="flex flex-col items-center text-center">
                  <Headphones className="h-12 w-12 text-[#8A2BE2] mb-4" />
                  <h3 className="text-xl font-bold mb-2">HD Quality</h3>
                  <p className="text-gray-400">
                    Experience music in stunning high definition audio
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-32 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-4xl font-bold text-white/10 mx-4">
                Taylor Swift
              </span>
              <span className="text-4xl font-bold text-white/10 mx-4">•</span>
              <span className="text-4xl font-bold text-white/10 mx-4">
                The Weeknd
              </span>
              <span className="text-4xl font-bold text-white/10 mx-4">•</span>
              <span className="text-4xl font-bold text-white/10 mx-4">
                Drake
              </span>
              <span className="text-4xl font-bold text-white/10 mx-4">•</span>
              <span className="text-4xl font-bold text-white/10 mx-4">
                Billie Eilish
              </span>
              <span className="text-4xl font-bold text-white/10 mx-4">•</span>
              <span className="text-4xl font-bold text-white/10 mx-4">
                Ed Sheeran
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
