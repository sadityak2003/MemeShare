"use client";

import { CldImage } from "next-cloudinary";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

interface MemeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  publicId: string;
  title: string;
  authorId: string;
  authorName: string;
  likes: string[];
  comments: Comment[];
  createdAt?: number;
  isLiked: boolean;
  onLike: () => void;
  likesCount: number;
  onCommentUpdate?: (comments: Comment[]) => void;
}

export default function MemeDetailModal({
  isOpen,
  onClose,
  id,
  publicId,
  title,
  authorName,
  comments: initialComments,
  createdAt,
  isLiked,
  onLike,
  likesCount,
  onCommentUpdate,
}: MemeDetailModalProps) {
  const { user } = useAuth();
  const [localComments, setLocalComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Close modal when clicking outside or pressing Escape
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const comment = {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      text: newComment.trim(),
      timestamp: Date.now(),
    };

    const memeRef = doc(db, "memes", id);
    try {
      await updateDoc(memeRef, {
        comments: arrayUnion(comment),
      });
      setLocalComments([...localComments, comment]);
      setNewComment("");
      toast.success("Comment added!");
      if (onCommentUpdate) {
        onCommentUpdate([...localComments, comment]);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-[#171b23] rounded-xl overflow-hidden max-w-6xl w-full max-h-[90vh] shadow-xl border border-[#8b5cf6]/20 flex ${
            isMobile ? 'flex-col' : 'flex-col md:flex-row'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-300 hover:text-white z-10 bg-black/30 rounded-full p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          {/* Meme side */}
          <div 
            className={`w-full ${
              isMobile 
                ? 'max-h-[40vh] sm:max-h-[50vh]' 
                : 'md:w-[55%] md:max-h-[90vh]'
            } bg-[#1e2433] relative overflow-hidden flex flex-col`}
          >
            <div className="relative flex-grow flex items-center justify-center bg-black/30 p-2">
              <CldImage
                src={publicId}
                alt={title}
                width={800}
                height={800}
                className="max-h-full w-auto object-contain"
              />
            </div>
            
            <div className="p-3 sm:p-4 bg-[#1e2433] border-t border-[#8b5cf6]/10">
              <h2 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate">{title}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-[#a78bfa] text-sm sm:text-base truncate max-w-[100px] sm:max-w-[200px]">{authorName}</span>
                  {createdAt && (
                    <span className="text-xs sm:text-sm text-gray-400">
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onLike}
                  className={`flex items-center space-x-1 sm:space-x-2 ${
                    isLiked ? "text-[#f472b6]" : "text-gray-300"
                  } hover:text-[#f472b6] transition-colors`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? "fill-[#f472b6]" : "fill-none"}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isLiked ? "0" : "2"}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{likesCount}</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Comments side */}
          <div className={`w-full ${isMobile ? '' : 'md:w-[45%]'} flex flex-col ${isMobile ? 'max-h-[50vh]' : 'md:max-h-[90vh]'}`}>
            <div className="p-3 sm:p-4 border-b border-[#8b5cf6]/10 bg-[#171b23]">
              <h3 className="text-base sm:text-lg font-medium text-white">Comments</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2 sm:space-y-3">
              {localComments.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-400 italic text-sm sm:text-base">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                localComments.map((comment, index) => (
                  <motion.div
                    key={comment.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#1e2433] p-2 sm:p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="font-medium text-[#a78bfa] text-sm sm:text-base truncate max-w-[100px] sm:max-w-full">{comment.userName}</span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-white mt-1 text-sm sm:text-base break-words">{comment.text}</p>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="p-3 sm:p-4 border-t border-[#8b5cf6]/10 bg-[#171b23]">
              <form onSubmit={handleComment} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#1e2433] text-white placeholder-gray-400 rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 border border-[#8b5cf6]/20"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#8b5cf6]/20 text-sm sm:text-base min-w-[60px] sm:min-w-[80px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4"
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
                    </span>
                  ) : (
                    "Post"
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 