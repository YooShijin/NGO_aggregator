"use client";

import { useState, useEffect } from "react";
import { eventAPI, type Event } from "@/lib/api";
import { Calendar, MapPin, ExternalLink, Clock, Users } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventAPI.getAll({ upcoming: true });
      setEvents(res.data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Upcoming Events
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Join{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              NGO Events
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Participate in campaigns, fundraisers, and community events
            organized by verified NGOs
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Upcoming Events
            </h2>
            <p className="text-gray-600 text-lg">
              Check back soon for new events and campaigns!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const dateInfo = formatEventDate(event.event_date);
              return (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-200"
                >
                  {/* Date Badge */}
                  <div className="relative">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="text-sm text-purple-100 font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.ngo_name}
                        </div>
                        <h3 className="text-2xl font-bold leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    {/* Floating Date Card */}
                    <div className="absolute -bottom-8 right-6 bg-white rounded-2xl shadow-xl p-4 text-center border-2 border-purple-200">
                      <div className="text-3xl font-extrabold text-purple-600">
                        {dateInfo.day}
                      </div>
                      <div className="text-sm font-bold text-gray-600 uppercase">
                        {dateInfo.month}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 pt-12">
                    {event.description && (
                      <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-600 bg-purple-50 px-4 py-3 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-xs text-purple-700 font-medium">
                            Date & Time
                          </div>
                          <div className="font-medium text-gray-900">
                            {dateInfo.time}
                          </div>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                          <MapPin className="w-5 h-5 text-pink-600" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.registration_link ? (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                      >
                        Register Now
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    ) : (
                      <button className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold cursor-not-allowed">
                        Registration Closed
                      </button>
                    )}
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
