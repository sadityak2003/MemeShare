import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "Meme App",
  description: "Share and discover the best memes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.className}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "bg-secondary text-text-primary border border-primary/20",
              style: {
                background: "var(--color-secondary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-primary-light)",
              },
              duration: 3000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
