"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MemeCard from "@/app/components/MemeCard";
import { motion, AnimatePresence } from "framer-motion";

interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  publicId: string;
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

export default function TrendingPage() {
  const [trendingMemes, setTrendingMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingMemes();
  }, []);

  const fetchTrendingMemes = async () => {
    try {
      const memesRef = collection(db, "memes");
      const q = query(memesRef, orderBy("likes", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      const memesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Meme[];
      setTrendingMemes(memesData);
    } catch (error) {
      console.error("Error fetching trending memes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for meme deletion
  const handleMemeDelete = (deletedId: any) => {
    setTrendingMemes((currentMemes) => 
      currentMemes.filter((meme) => meme.id !== deletedId)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171b23]">
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
      className="min-h-screen bg-[#171b23] py-4 sm:py-8"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#f472b6] text-transparent bg-clip-text">
            Trending Memes
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg">
            {trendingMemes.length === 0
              ? "No trending memes yet"
              : `Top ${trendingMemes.length} most liked memes`}
          </p>
        </motion.div>

        <AnimatePresence>
          {trendingMemes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1e2433] p-4 sm:p-8 rounded-xl shadow-lg border border-[#8b5cf6]/20 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#a78bfa] mb-3 sm:mb-4">
                No Trending Memes
              </h2>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                Be the first to upload and get your meme trending!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trendingMemes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MemeCard
                    id={meme.id}
                    title={meme.title}
                    publicId={meme.publicId}
                    authorId={meme.authorId}
                    authorName={meme.authorName}
                    likes={meme.likes}
                    comments={meme.comments}
                    createdAt={meme.createdAt}
                    onDelete={handleMemeDelete}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
