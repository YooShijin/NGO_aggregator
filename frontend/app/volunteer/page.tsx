"use client";

import { useState, useEffect } from "react";
import { volunteerAPI, type VolunteerPost } from "@/lib/api";
import { MapPin, Calendar, Users, Briefcase, Clock } from "lucide-react";

export default function VolunteerPage() {
  const [posts, setPosts] = useState<VolunteerPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await volunteerAPI.getAll({ active: true });
      setPosts(res.data);
    } catch (error) {
      console.error("Error loading volunteer posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Volunteer Opportunities
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Make a{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Difference
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join verified NGOs and create meaningful impact through volunteer
            work
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading opportunities...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Opportunities Yet
            </h2>
            <p className="text-gray-600 text-lg">
              Check back soon for new volunteer opportunities!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => {
              const daysLeft = post.deadline
                ? getDaysLeft(post.deadline)
                : null;
              return (
                <div
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-200"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="text-sm text-green-100 font-medium mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {post.ngo_name}
                      </div>
                      <h3 className="text-2xl font-bold leading-tight">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {post.description && (
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {post.description}
                      </p>
                    )}

                    {post.requirements && (
                      <div className="mb-6 bg-green-50 p-4 rounded-xl border-2 border-green-100">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <span>✓</span> Requirements:
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {post.requirements}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      {post.location && (
                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="font-medium">{post.location}</span>
                        </div>
                      )}
                      {post.deadline && (
                        <div className="flex items-center justify-between bg-amber-50 px-4 py-3 rounded-xl border-2 border-amber-100">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-amber-600" />
                            <div>
                              <div className="text-xs text-amber-700 font-medium">
                                Apply by
                              </div>
                              <div className="font-bold text-gray-900">
                                {new Date(post.deadline).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {daysLeft !== null && (
                            <div className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                              {daysLeft > 0
                                ? `${daysLeft} days left`
                                : "Expired"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                      <Users className="w-5 h-5" />
                      Apply Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
