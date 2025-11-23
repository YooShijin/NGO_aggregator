"use client";

import { useState, useEffect } from "react";
import { ngoAPI } from "@/lib/api";
import {
  Users,
  Calendar,
  Send,
  CheckCircle,
  Clock,
  Plus,
  Edit,
} from "lucide-react";

export default function NGODashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await ngoAPI.getDashboard();
      setDashboard(res.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: number, status: string) => {
    try {
      await ngoAPI.updateApplicationStatus(appId, status);
      loadDashboard();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unable to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {dashboard.ngo.name}
          </h1>
          <p className="text-gray-600 text-lg">{dashboard.ngo.mission}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard.stats.total_posts}
            </div>
            <div className="text-sm text-gray-600">Volunteer Posts</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard.stats.upcoming_events}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard.stats.total_applications}
            </div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard.stats.pending_applications}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Create Volunteer Post
          </button>

          <button
            onClick={() => setShowEventModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Create Event
          </button>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Applications
          </h2>

          {dashboard.applications.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.applications.map((app: any) => (
                <div
                  key={app.id}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {app.user_name}
                      </h3>
                      <p className="text-sm text-gray-600">{app.user_email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied for: {app.volunteer_post_title}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{app.message}</p>

                  {app.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(app.id, "accepted")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "rejected")}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
