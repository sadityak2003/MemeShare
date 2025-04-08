"use client";

import Link from "next/link";
import {
  Menu,
  Star,
  ThumbsUp,
  SaveIcon,
  ChartBar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiArtificialHive } from "react-icons/gi";

export default function Navbar() {
  const { user, signOut, signInWithGoogle } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const libraryMenuRef = useRef<HTMLDivElement>(null);


  const handleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        libraryMenuRef.current &&
        !libraryMenuRef.current.contains(event.target as Node)
      ) {
        setIsDrawerOpen(false);
      }
    }

    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  const navItems = [
    { name: "Explore", path: "/", requiresAuth: false },
    { name: "Trending", path: "/trending", requiresAuth: false },
    { name: "Upload", path: "/upload", requiresAuth: true },
    { name: "My Memes", path: "/my-memes", requiresAuth: true },
  ];
 // bg-[#1e2433]
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-[#8b5cf6]/20 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="gap-5 flex items-center">
              <button
                className="cursor-pointer"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              >
                <Menu size={24} className="text-purple-700 font-bold"></Menu>
              </button>

              <div className="flex items-center">
                <div className="relative" ref={libraryMenuRef}>
                {isDrawerOpen && (
                <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.15,
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                  }}
                  className="absolute left-0 mt-20  h-150 w-60 bg-white rounded-lg shadow-lg py-1 border border-[#8b5cf6]/20 z-50"
                >
                  <div className="flex items-center px-4 py-3 space-x-3 border-b border-[#8b5cf6]/10">
                    <p className="text-xl font-medium text-gray-500 truncate">
                      Library
                    </p>
                  </div>

                  <ul className="mt-2 space-y-2">
                <li className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]">
                  <SaveIcon size={18} />
                  <Link href="/your-memes">Saved Memes</Link>
                </li>
                <li className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]">
                  <Star size={18} />
                  <Link href="/upload">Favourites</Link>
                </li>
                <li className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]">
                  <ThumbsUp size={18} />
                  <Link href="/upload">Liked</Link>
                </li>
                <li className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]">
                  <ChartBar size={18} />
                  <Link href="/upload">Your Comments</Link>
                </li>
                <li className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]">
                  <GiArtificialHive size={18}/>
                  <Link href="/upload">AI Generated Memes</Link>
                </li>
              </ul>
               
                
                </motion.div>
              )}
                </div>
              </div>
              
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#f472b6] text-transparent bg-clip-text"
              >
                MemeShare
              </motion.span>
            </div>

            <div className="hidden md:flex md:ml-8 md:space-x-4">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      pathname === item.path
                        ? "bg-[#8b5cf6]/20 text-[#a78bfa]"
                        : "text-gray-500 hover:text-[#a78bfa] hover:bg-[#8b5cf6]/10"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-1.5 rounded-lg  hover:bg-[#8b5cf6]/10 border border-[#8b5cf6] transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <img
                        src={user.photoURL || ""}
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full border-2 border-[#8b5cf6]/30 object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#171b23]"></div>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-500">
                      {user.displayName?.split(" ")[0] || "User"}
                    </span>
                  </div>
                  <motion.svg
                    animate={{ rotate: profileMenuOpen ? 180 : 0 }}
                    className="w-4 h-4 text-gray-500 hidden sm:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.15,
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                      }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-1 border border-[#8b5cf6]/20 z-50"
                    >
                      <div className="flex items-center px-4 py-3 space-x-3 border-b border-[#8b5cf6]/10">
                        <img
                          src={user.photoURL || ""}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-500 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/my-memes"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]"
                      >
                        My Memes
                      </Link>

                      <Link
                        href="/upload"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#a78bfa]"
                      >
                        Upload Meme
                      </Link>

                      <div className="border-t border-[#8b5cf6]/10 mt-1 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                disabled={isAuthLoading}
                className="px-4 py-2 text-sm font-medium bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg transition-colors duration-200 shadow-lg shadow-[#8b5cf6]/20"
              >
                {isAuthLoading ? "Signing in..." : "Sign In"}
              </motion.button>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center ml-4 md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-[#a78bfa] hover:bg-[#8b5cf6]/10 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.svg
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      className="h-6 w-6"
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
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#171b23] border-t border-[#8b5cf6]/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      pathname === item.path
                        ? "bg-[#8b5cf6]/20 text-[#a78bfa]"
                        : "text-gray-300 hover:text-[#a78bfa] hover:bg-[#8b5cf6]/10"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {user && (
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
