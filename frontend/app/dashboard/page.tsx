"use client";

import { useState, useEffect } from "react";
import { userAPI } from "@/lib/api";
import {
  Heart,
  Bookmark,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "applications" | "bookmarks" | "likes"
  >("applications");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await userAPI.getDashboard();
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (id: number) => {
    try {
      await userAPI.removeBookmark(id);
      loadDashboard();
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const handleRemoveLike = async (id: number) => {
    try {
      await userAPI.removeLike(id);
      loadDashboard();
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unable to load dashboard</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData.user.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Track your volunteer applications and saved opportunities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.total_applications}
                </div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.pending_applications}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.bookmarks_count}
                </div>
                <div className="text-sm text-gray-600">Bookmarks</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats.likes_count}
                </div>
                <div className="text-sm text-gray-600">Liked NGOs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "applications"
                  ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Send className="w-5 h-5 inline mr-2" />
              My Applications
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "bookmarks"
                  ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Bookmark className="w-5 h-5 inline mr-2" />
              Saved Posts
            </button>
            <button
              onClick={() => setActiveTab("likes")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "likes"
                  ? "bg-red-50 text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Liked NGOs
            </button>
          </div>

          <div className="p-6">
            {/* Applications Tab */}
            {activeTab === "applications" && (
              <div className="space-y-4">
                {dashboardData.applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No applications yet</p>
                    <Link
                      href="/volunteer"
                      className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Browse volunteer opportunities →
                    </Link>
                  </div>
                ) : (
                  dashboardData.applications.map((app: any) => (
                    <div
                      key={app.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {app.volunteer_post_title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {app.ngo_name}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          <span className="font-semibold capitalize">
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{app.message}</p>
                      <div className="text-sm text-gray-500">
                        Applied on{" "}
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === "bookmarks" && (
              <div className="space-y-4">
                {dashboardData.bookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No saved posts yet</p>
                  </div>
                ) : (
                  dashboardData.bookmarks.map((bookmark: any) => (
                    <div
                      key={bookmark.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {bookmark.volunteer_post.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {bookmark.volunteer_post.ngo_name}
                          </p>
                          <p className="text-gray-700 line-clamp-2">
                            {bookmark.volunteer_post.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                          className="ml-4 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Likes Tab */}
            {activeTab === "likes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.liked_ngos.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No liked NGOs yet</p>
                  </div>
                ) : (
                  dashboardData.liked_ngos.map((like: any) => (
                    <div
                      key={like.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-red-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {like.ngo.name}
                        </h3>
                        <button
                          onClick={() => handleRemoveLike(like.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {like.ngo.mission}
                      </p>
                      <Link
                        href={`/ngos/${like.ngo.id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
