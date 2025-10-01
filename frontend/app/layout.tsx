import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NGO Portal - Social Impact Platform",
  description:
    "Connect with verified NGOs, discover volunteer opportunities, and make a difference",
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
        <main>{children}</main>
        <Chatbot />
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">NGO Portal</h3>
                <p className="text-gray-400">
                  Connecting people with verified NGOs to create meaningful
                  social impact across India.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="/ngos"
                      className="hover:text-white transition-colors"
                    >
                      Browse NGOs
                    </a>
                  </li>
                  <li>
                    <a
                      href="/volunteer"
                      className="hover:text-white transition-colors"
                    >
                      Volunteer
                    </a>
                  </li>
                  <li>
                    <a
                      href="/events"
                      className="hover:text-white transition-colors"
                    >
                      Events
                    </a>
                  </li>
                  <li>
                    <a
                      href="/impact"
                      className="hover:text-white transition-colors"
                    >
                      Impact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">For NGOs</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="/auth/ngo-register"
                      className="hover:text-white transition-colors"
                    >
                      Register NGO
                    </a>
                  </li>
                  <li>
                    <a
                      href="/auth/login"
                      className="hover:text-white transition-colors"
                    >
                      NGO Login
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; 2025 United We Serve . All rights reserved. Built with
                love for social impact.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
