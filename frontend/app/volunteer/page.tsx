"use client";

import { useState, useEffect } from "react";
import { volunteerAPI, userAPI, type VolunteerPost } from "@/lib/api";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  Send,
  Heart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VolunteerPage() {
  const [posts, setPosts] = useState<VolunteerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<VolunteerPost | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loadData = async () => {
    try {
      const res = await volunteerAPI.getAll({ active: true });
      setPosts(res.data);
    } catch (error) {
      console.error("Error loading volunteer posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (post: VolunteerPost) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setSelectedPost(post);
    setShowApplicationModal(true);
    setApplicationMessage("");
    setSuccessMessage("");
  };

  const handleBookmark = async (postId: number) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      await userAPI.addBookmark(postId);
      setSuccessMessage("Bookmarked successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to bookmark");
    }
  };

  const submitApplication = async () => {
    if (!selectedPost || !applicationMessage.trim()) return;

    setSubmitting(true);
    try {
      await volunteerAPI.apply({
        volunteer_post_id: selectedPost.id,
        message: applicationMessage,
      });

      setSuccessMessage("Application submitted successfully!");
      setShowApplicationModal(false);
      setSelectedPost(null);
      setApplicationMessage("");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" />
            Volunteer Opportunities
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Make a{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Difference
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover volunteer opportunities with verified NGOs and start your
            journey of giving back
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading opportunities...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Opportunities Available
            </h2>
            <p className="text-gray-600 text-lg">
              Check back soon for new volunteer positions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-blue-100 mb-2">
                      <Heart className="w-4 h-4" />
                      {post.ngo_name}
                    </div>
                    <h3 className="text-2xl font-bold leading-tight mb-2">
                      {post.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {post.description && (
                    <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    {post.location && (
                      <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{post.location}</span>
                      </div>
                    )}

                    {post.deadline && (
                      <div className="flex items-center gap-3 text-gray-600 bg-blue-50 px-4 py-3 rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-blue-700 font-medium">
                            Apply by
                          </div>
                          <div className="font-medium text-gray-900">
                            {new Date(post.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {post.requirements && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Requirements
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {post.requirements}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApply(post)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Apply Now
                    </button>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                      title="Bookmark"
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-bold">Apply for Position</h3>
              <p className="text-blue-100 mt-1">{selectedPost.title}</p>
              <p className="text-sm text-blue-200 mt-1">
                {selectedPost.ngo_name}
              </p>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Why do you want to volunteer?
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Tell us about your motivation, relevant experience, and why you'd be a great fit for this role..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                />
              </div>

              {!user && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-medium">
                      Please login to apply
                    </p>
                    <Link
                      href="/auth/login"
                      className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
                    >
                      Login here
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedPost(null);
                    setApplicationMessage("");
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={submitting || !applicationMessage.trim() || !user}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
