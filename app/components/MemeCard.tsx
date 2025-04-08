"use client";

import { CldImage } from "next-cloudinary";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import ConfirmModal from "./ConfirmModal";
import MemeDetailModal from "./MemeDetailModal";
import { deleteCloudinaryImage } from "@/utils/cloudinaryUtils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface MemeCardProps {
  id: string;
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
  createdAt?: number;
  onDelete?: (id: string) => void;
}

export default function MemeCard({
  id,
  publicId,
  title,
  authorId,
  authorName,
  likes,
  comments,
  createdAt,
  onDelete,
}: MemeCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(likes.includes(user?.uid || ""));
  const [likesCount, setLikesCount] = useState(likes.length);
  const [localComments, setLocalComments] = useState(comments);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Check if current user is the owner of this meme
  const isOwner = user?.uid === authorId;

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like memes");
      return;
    }

    const memeRef = doc(db, "memes", id);
    const operation = isLiked ? arrayRemove : arrayUnion;

    try {
      await updateDoc(memeRef, {
        likes: operation(user.uid),
      });
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      toast.success(isLiked ? "Meme unliked" : "Meme liked!");
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleDeleteMeme = async () => {
    if (!isOwner) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // First delete the document from Firestore
      await deleteDoc(doc(db, "memes", id));

      // Then attempt to delete the image from Cloudinary
      try {
        await deleteCloudinaryImage(publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // We still consider the deletion successful if Firestore delete worked
        // The Cloudinary cleanup can be handled separately if needed
      }

      // Mark as deleted for immediate UI feedback
      setIsDeleted(true);

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(id);
      }

      toast.success("Meme deleted successfully!");
      router.refresh(); // Still call refresh for other components to update
    } catch (error) {
      console.error("Error deleting meme:", error);
      setDeleteError("Failed to delete meme");
      toast.error("Failed to delete meme");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // If this meme is deleted, don't render it
  if (isDeleted) {
    return null;
  }

  const openDetailModal = () => {
    setShowDetailModal(true);
  };

  // This function will be called when a comment is added in the detail modal
  const updateComments = (newComments: typeof comments) => {
    setLocalComments(newComments);
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300 flex flex-col h-full"
      >
        <div
          className="relative group cursor-pointer"
          onClick={openDetailModal}
        >
          {/*Creator Details*/}
          <div className="p-4 flex items-center gap-2">
            <img src={user?.photoURL || ""} className="w-10 h-10 rounded-full" />
            <div className="flex items-center">
              <Link
                href={`/profile/${authorId}`}
                className="flex items-center justify-between space-x-1 sm:space-x-2 hover:text-[#a78bfa] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-l font-bold text-gray-500">{authorName}</h2>

                {createdAt && (
                  <span className="text-xs text-gray-400 hidden xs:inline-block">
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="aspect-w-1 aspect-h-1 w-full">
            <CldImage
              src={publicId}
              alt={title}
              width={400}
              height={400}
              className="w-full h-full object-fill"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h3
            className="text-base sm:text-lg font-semibold text-gray-500 mb-3 cursor-pointer line-clamp-2"
            onClick={openDetailModal}
          >
            {title}
          </h3>
            {isOwner && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          

          <div className="flex items-center space-x-4 sm:space-x-6 mb-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center space-x-1 sm:space-x-2 ${
                isLiked ? "text-[#f472b6]" : "text-gray-500"
              } hover:text-[#f472b6] transition-colors`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  isLiked ? "fill-[#f472b6]" : "fill-none"
                }`}
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
              <span className="text-sm sm:text-base">{likesCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                openDetailModal();
              }}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-[#6b57a5] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm sm:text-base">
                {localComments.length}
              </span>
            </motion.button>
          </div>

          {/* Comment section with fixed height */}
          <div className="mt-auto pt-2">
            <div
              className="mt-2 sm:mt-3 hover:bg-[#ededf0] border-1 border-[#8b5cf6]/40 p-2 rounded-lg cursor-pointer text-xs sm:text-sm min-h-[70px] flex flex-col justify-center"
              onClick={openDetailModal}
            >
              {localComments.length > 0 ? (
                <>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-medium text-[#5049a2] truncate max-w-[100px] sm:max-w-[140px]">
                      {localComments[localComments.length - 1].userName}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1 truncate">
                    {localComments[localComments.length - 1].text}
                  </p>
                  {localComments.length > 1 && (
                    <p className="text-gray-400 text-xs mt-1">
                      View all {localComments.length} comments
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-xs sm:text-sm text-center">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMeme}
        title="Delete Meme"
        message="Are you sure you want to delete this meme? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        error={deleteError}
      />

      <MemeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        id={id}
        publicId={publicId}
        title={title}
        authorId={authorId}
        authorName={authorName}
        likes={likes}
        comments={comments}
        createdAt={createdAt}
        isLiked={isLiked}
        onLike={handleLike}
        likesCount={likesCount}
        onCommentUpdate={updateComments}
      />
    </>
  );
}
