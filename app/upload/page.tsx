"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";
import CloudinaryUploader from "@/app/components/CloudinaryUploader";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUploadSuccess = (url: string, publicId: string) => {
    setImageUrl(url);
    setPublicId(publicId);
    setError("");
    toast.success("Image uploaded successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to upload a meme");
      return;
    }

    if (!title.trim()) {
      toast.error("Please provide a title for your meme");
      return;
    }

    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    try {
      setUploading(true);
      setError("");

      await addDoc(collection(db, "memes"), {
        title: title.trim(),
        imageUrl,
        publicId,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        likes: [],
        comments: [],
        createdAt: Date.now(),
      });

      toast.success("Your meme has been uploaded successfully!");
      setTitle("");
      setImageUrl("");
      setPublicId("");

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error uploading meme:", error);
      toast.error("Failed to upload meme. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
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

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#171b23] flex flex-col items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#1e2433] p-6 sm:p-8 rounded-xl shadow-xl max-w-md w-full border border-[#8b5cf6]/20"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-[#a78bfa]">
            Sign In Required
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 text-center">
            You need to be signed in to upload memes. Please sign in to continue.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2 sm:py-3 px-4 rounded-lg transition-colors shadow-lg shadow-[#8b5cf6]/20 text-sm sm:text-base"
          >
            Go to Home
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#171b23] py-6 sm:py-12 px-3 sm:px-4"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1e2433] p-5 sm:p-8 rounded-xl shadow-xl border border-[#8b5cf6]/20"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#f472b6] text-transparent bg-clip-text">
            Upload a Meme
          </h1>

  

          <div>
              <label className="block text-sm font-medium text-gray-200 mb-1 sm:mb-2">
                Image
              </label>

              {imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 relative rounded-lg overflow-hidden border border-[#8b5cf6]/20 shadow-lg"
              >
                <div className="aspect-w-1 aspect-h-1 max-h-[250px] sm:max-h-[300px]">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            )}

              <div className="mb-3 sm:mb-4">
                <CloudinaryUploader
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(error) => {
                    setError(error as string);
                    toast.error("Failed to upload image");
                  }}
                />
              </div>
            </div>

      

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-200 mb-1 sm:mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your meme a catchy title..."
                className="w-full bg-[#171b23] text-white placeholder-gray-400 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 border border-[#8b5cf6]/20"
              />
            </div>

            

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs sm:text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading || !title.trim() || !imageUrl}
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#8b5cf6]/20 text-sm sm:text-base mt-4"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                  Uploading...
                </span>
              ) : (
                "Upload Meme"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
