"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./context/AuthContext";
import MemeCard from "./components/MemeCard";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

interface Meme {
  id: string;
  imageUrl: string;
  publicId: string;
  title: string;
  authorId: string;
  authorName: string;
  likes: string[];
  comments: Array<{
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
  }>;
  createdAt: number;
}

export default function Home() {
  const { user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const q = query(
        collection(db, "memes"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const memesData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Meme)
      );
      setMemes(memesData);
    } catch (error) {
      console.error("Error fetching memes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemeDelete = (deletedId: string) => {
    setMemes((currentMemes) => currentMemes.filter((meme) => meme.id !== deletedId));
  };

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-[#ffffff] overflow-hidden"
    >
    
      <Particles
        className="absolute inset-0 z-0"
        init={particlesInit}
        options={{
          background: { color: "transparent" },
          particles: {
            number: { value: 80, density: { enable: true, area: 800 } },
            move: { enable: true, speed: 1.5 },
            shape: { type: "circle" },
            size: { value: { min: 2, max: 4 } },
            opacity: { value: 0.4 },
            color: { value: ["#8b5cf6", "#a78bfa", "#c084fc"] },
          },
        }}
      />

      <div className="relative max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pb-4 sm:pb-6 border-b border-[#8b5cf6]/20 mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#f472b6] text-transparent bg-clip-text">
            Explore Memes
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">
            Discover the latest memes from the community
          </p>
        </motion.div>

        {!user && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#f3f6fc] p-4 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8 border border-[#8b5cf6]/20"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-[#a78bfa]">
              Welcome to MemeShare!
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Sign in to like, comment, and upload your own memes.
            </p>
          </motion.div>
        )}

        {memes.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-[#8b5cf6]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </motion.div>
            <h3 className="mt-4 text-xl sm:text-2xl font-medium text-white">
              No memes found
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-300">
              Be the first to share a meme with the community!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {memes.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <MemeCard {...meme} onDelete={handleMemeDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
