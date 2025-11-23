"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  Shield,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  statsAPI,
  categoryAPI,
  ngoAPI,
  type Category,
  type Stats,
  type MapNGO,
} from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamic import for map to avoid SSR issues
const NGOMap = dynamic(() => import("../components/NGOMap"), { ssr: false });

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mapNGOs, setMapNGOs] = useState<MapNGO[]>([]);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, categoriesRes, mapRes] = await Promise.all([
        statsAPI.get(),
        categoryAPI.getAll(),
        ngoAPI.getMapData(),
      ]);
      setStats(statsRes.data);
      setCategories(categoriesRes.data);
      setMapNGOs(mapRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ngos?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with modern gradient */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Verified NGO Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Discover NGOs
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Making a Difference
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-indigo-100 max-w-2xl mx-auto">
              Connect with verified organizations and create meaningful social
              impact
            </p>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Search className="absolute left-6 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search NGOs by name, cause, location, or DARPAN ID..."
                  className="flex-1 pl-16 pr-6 py-5 text-gray-900 text-lg focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="m-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowBlacklistModal(true)}
                className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-300 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-500/30 transition-all"
              >
                <AlertTriangle className="w-5 h-5" />
                View Blacklisted NGOs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section with modern cards */}
      {stats && (
        <div className="py-16 -mt-12 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {stats.total_ngos}
                </div>
                <div className="text-gray-600 text-center mt-2 text-sm">
                  Total NGOs
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {stats.verified_ngos}
                </div>
                <div className="text-gray-600 text-center mt-2 text-sm">
                  Verified
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {stats.total_volunteers}
                </div>
                <div className="text-gray-600 text-center mt-2 text-sm">
                  Opportunities
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {stats.upcoming_events}
                </div>
                <div className="text-gray-600 text-center mt-2 text-sm">
                  Events
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-red-100">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {stats.blacklisted_ngos}
                </div>
                <div className="text-gray-600 text-center mt-2 text-sm">
                  Blacklisted
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              Geographic Distribution
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              NGOs Near You
            </h2>
            <p className="text-xl text-gray-600">
              Discover verified NGOs across India on our interactive map
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            <NGOMap ngos={mapNGOs} />
          </div>
        </div>
      </div>

      {/* Categories Section with hover effects */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600">
              Find NGOs working in areas that matter to you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/ngos?category=${category.slug}`}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-indigo-200"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <div className="font-semibold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section with gradient */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-10 text-indigo-100 max-w-2xl mx-auto">
            Explore NGOs, volunteer opportunities, and upcoming events to start
            your social impact journey
          </p>

          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/ngos"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-2xl text-lg"
            >
              <Heart className="w-5 h-5" />
              Browse NGOs
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center gap-2 bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-800 transition-all shadow-2xl text-lg border-2 border-indigo-400"
            >
              <Users className="w-5 h-5" />
              Find Volunteer Work
            </Link>
          </div>
        </div>
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-7 h-7" />
                  Blacklisted NGOs
                </h3>
                <p className="text-red-100 mt-1">
                  NGOs that have been blacklisted by authorities
                </p>
              </div>
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <p className="text-gray-700 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                ⚠️ These organizations have been flagged by regulatory
                authorities. Please exercise caution when engaging with them.
              </p>

              <Link
                href="/blacklisted"
                onClick={() => setShowBlacklistModal(false)}
                className="block w-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-center py-4 rounded-2xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
              >
                View Complete Blacklist →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
