"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import {
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, reqRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getNGORequests(activeTab),
      ]);
      setDashboard(dashRes.data);
      setRequests(reqRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const password = prompt("Enter default password for NGO account:");
    if (!password) return;

    try {
      await adminAPI.approveNGORequest(id, password);
      loadData();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await adminAPI.rejectNGORequest(id, reason);
      loadData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-indigo-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage NGO registrations and platform activities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard?.stats.total_users}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard?.stats.total_ngos}
            </div>
            <div className="text-sm text-gray-600">Total NGOs</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard?.stats.pending_verifications}
            </div>
            <div className="text-sm text-gray-600">Pending Reviews</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard?.stats.blacklisted_ngos}
            </div>
            <div className="text-sm text-gray-600">Blacklisted</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "pending"
                  ? "bg-yellow-50 text-yellow-700 border-b-2 border-yellow-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Pending ({dashboard?.stats.pending_verifications || 0})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "approved"
                  ? "bg-green-50 text-green-700 border-b-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Approved
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "rejected"
                  ? "bg-red-50 text-red-700 border-b-2 border-red-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <XCircle className="w-5 h-5 inline mr-2" />
              Rejected
            </button>
          </div>

          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No {activeTab} requests</p>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {request.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.email} • {request.phone}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Registration No.
                        </div>
                        <div className="font-mono text-sm text-gray-900">
                          {request.registration_no}
                        </div>
                      </div>

                      {request.darpan_id && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            DARPAN ID
                          </div>
                          <div className="font-mono text-sm text-gray-900">
                            {request.darpan_id}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Location
                        </div>
                        <div className="text-sm text-gray-900">
                          {request.city}, {request.state}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Applied On
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {request.mission && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">
                          Mission
                        </div>
                        <p className="text-gray-900">{request.mission}</p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-gray-300">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    )}

                    {request.status === "rejected" &&
                      request.rejection_reason && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="text-sm font-semibold text-red-900 mb-1">
                            Rejection Reason
                          </div>
                          <p className="text-sm text-red-800">
                            {request.rejection_reason}
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
