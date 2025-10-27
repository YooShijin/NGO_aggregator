import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NGO Aggregator - Discover & Connect with NGOs",
  description:
    "Find verified NGOs, volunteer opportunities, and make an impact",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        // <Chatbot />
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2025 NGO Portal. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-400">
              Connecting people with causes that matter
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
