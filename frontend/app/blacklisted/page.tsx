"use client";

import { useState, useEffect } from "react";
import { blacklistAPI, type NGO } from "@/lib/api";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function BlacklistedPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    blacklisted_by: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
  });

  useEffect(() => {
    loadNGOs();
  }, [filters, pagination.current]);

  const loadNGOs = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.current };
      if (filters.search) params.search = filters.search;
      if (filters.state) params.state = filters.state;
      if (filters.blacklisted_by)
        params.blacklisted_by = filters.blacklisted_by;

      const res = await blacklistAPI.getAll(params);
      setNgos(res.data.ngos);
      setPagination({
        total: res.data.total,
        pages: res.data.pages,
        current: pagination.current,
      });
    } catch (error) {
      console.error("Error loading blacklisted NGOs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-3xl p-10 mb-8 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">Blacklisted NGOs</h1>
              <p className="text-red-100 text-lg">
                Organizations that have been blacklisted by regulatory
                authorities due to non-compliance or violations.
              </p>
              <div className="mt-4 bg-red-600/30 border border-red-300 rounded-xl p-4">
                <p className="text-sm">
                  ⚠️ <strong>Warning:</strong> These NGOs have been flagged by
                  government authorities. Exercise extreme caution before
                  engaging with them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or DARPAN ID..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <input
              type="text"
              placeholder="Filter by State"
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Blacklisted by..."
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              value={filters.blacklisted_by}
              onChange={(e) =>
                setFilters({ ...filters, blacklisted_by: e.target.value })
              }
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading blacklisted NGOs...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-gray-700">
                Found{" "}
                <span className="font-bold text-red-600">
                  {pagination.total}
                </span>{" "}
                blacklisted NGO{pagination.total !== 1 ? "s" : ""}
              </div>

              <Link
                href="/ngos"
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
              >
                View Active NGOs →
              </Link>
            </div>

            <div className="space-y-6">
              {ngos.map((ngo) => (
                <div
                  key={ngo.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-red-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {ngo.name}
                        </h3>
                        {ngo.darpan_id && (
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 font-mono">
                              DARPAN: {ngo.darpan_id}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Blacklisted
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {(ngo.city || ngo.state) && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-500">
                                Location
                              </div>
                              <div className="text-gray-900">
                                {ngo.city}
                                {ngo.city && ngo.state && ", "}
                                {ngo.state}
                              </div>
                            </div>
                          </div>
                        )}

                        {ngo.registration_no && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-sm text-gray-500">
                                Registration No.
                              </div>
                              <div className="text-gray-900 font-mono text-sm">
                                {ngo.registration_no}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Blacklist Info */}
                      {ngo.blacklist_info && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="text-sm font-semibold text-red-900 mb-3">
                            Blacklist Details
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Blacklisted By:
                              </span>
                              <div className="font-medium text-gray-900">
                                {ngo.blacklist_info.blacklisted_by}
                              </div>
                            </div>

                            {ngo.blacklist_info.wef_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">WEF:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(
                                    ngo.blacklist_info.wef_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {ngo.blacklist_info.last_updated && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  Last Updated:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {new Date(
                                    ngo.blacklist_info.last_updated
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {ngo.blacklist_info.reason && (
                              <div className="mt-3 pt-3 border-t border-red-200">
                                <span className="text-gray-600">Reason:</span>
                                <div className="font-medium text-gray-900 mt-1">
                                  {ngo.blacklist_info.reason}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Transparency Score:{" "}
                        <span className="font-bold text-red-600">
                          {ngo.transparency_score}/100
                        </span>
                      </div>

                      <Link
                        href={`/ngos/${ngo.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium transition-colors"
                      >
                        View Full Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() =>
                        setPagination({ ...pagination, current: page })
                      }
                      className={`px-5 py-3 rounded-xl font-medium transition-all ${
                        page === pagination.current
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
