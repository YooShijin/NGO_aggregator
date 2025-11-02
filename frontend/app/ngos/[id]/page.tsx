'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ngoAPI, type NGO } from '@/lib/api';
import { MapPin, Mail, Phone, ExternalLink, CheckCircle, Calendar, FileText, Users, Award, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NGODetailPage() {
  const params = useParams();
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNGO();
  }, []);

  const loadNGO = async () => {
    try {
      const res = await ngoAPI.getById(Number(params.id));
      setNgo(res.data);
    } catch (error) {
      console.error('Error loading NGO:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading NGO details...</p>
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">NGO Not Found</h1>
          <Link href="/ngos" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to NGO Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Blacklist Warning */}
        {ngo.blacklisted && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">⚠️ This NGO is Blacklisted</h3>
                <p className="text-red-100">
                  This organization has been flagged by regulatory authorities. Please exercise extreme caution.
                </p>
                {ngo.blacklist_info && (
                  <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm"><strong>Blacklisted by:</strong> {ngo.blacklist_info.blacklisted_by}</p>
                    {ngo.blacklist_info.reason && (
                      <p className="text-sm mt-1"><strong>Reason:</strong> {ngo.blacklist_info.reason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-2 border-gray-200">
          <div className={`${ngo.blacklisted ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500'} p-10 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <Link href="/ngos" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
                    ← Back to Directory
                  </Link>
                  <h1 className="text-5xl font-extrabold mb-4 leading-tight">{ngo.name}</h1>
                  {ngo.darpan_id && (
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      DARPAN: {ngo.darpan_id}
                    </div>
                  )}
                </div>
                {ngo.verified && !ngo.blacklisted && (
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                )}
              </div>

              {ngo.categories.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {ngo.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mission & Description */}
          <div className="p-10">
            {ngo.mission && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-600" />
                  Our Mission
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100">
                  {ngo.mission}
                </p>
              </div>
            )}

            {ngo.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
                <p className="text-gray-700 leading-relaxed">{ngo.description}</p>
              </div>
            )}

            {/* Transparency Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600" />
                Transparency Score
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-6 rounded-full transition-all flex items-center justify-end pr-3"
                      style={{ width: `${ngo.transparency_score}%` }}
                    >
                      <span className="text-white text-xs font-bold">{ngo.transparency_score}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-gray-900">{ngo.transparency_score}/100</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact & Registration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-indigo-600" />
                Contact Information
              </h2>

              <div className="space-y-4">
                {(ngo.city || ngo.state) && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      {ngo.address && <p className="text-gray-900 font-medium mb-1">{ngo.address}</p>}
                      <p className="text-gray-700">
                        {ngo.city}
                        {ngo.city && ngo.state && ', '}
                        {ngo.state}
                      </p>
                    </div>
                  </div>
                )}

                {ngo.email && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Mail className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <a href={`mailto:${ngo.email}`} className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                        {ngo.email}
                      </a>
                    </div>
                  </div>
                )}

                {ngo.phone && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Phone className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone</div>
                      <a href={`tel:${ngo.phone}`} className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                        {ngo.phone}
                      </a>
                    </div>
                  </div>
                )}

                {ngo.website && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <ExternalLink className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Website</div>
                      <a
                        href={ngo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                      >
                        {ngo.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Details */}
            {(ngo.registration_no || ngo.registered_with || ngo.type_of_ngo) && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  Registration Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ngo.registered_with && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Registered With</div>
                      <div className="text-gray-900 font-medium">{ngo.registered_with}</div>
                    </div>
                  )}

                  {ngo.type_of_ngo && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Type of NGO</div>
                      <div className="text-gray-900 font-medium">{ngo.type_of_ngo}</div>
                    </div>
                  )}

                  {ngo.registration_no && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Registration Number</div>
                      <div className="text-gray-900 font-mono font-medium">{ngo.registration_no}</div>
                    </div>
                  )}

                  {ngo.registration_date && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Registration Date</div>
                      <div className="text-gray-900 font-medium">
                        {new Date(ngo.registration_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {ngo.act_name && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Act Name</div>
                      <div className="text-gray-900 font-medium">{ngo.act_name}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Office Bearers & Actions */}
          <div className="space-y-8">
            {/* Office Bearers */}
            {ngo.office_bearers && ngo.office_bearers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  Office Bearers
                </h2>
                <div className="space-y-4">
                  {ngo.office_bearers.map((bearer) => (
                    <div key={bearer.id} className="p-4 bg-indigo-50 rounded-xl border-2 border-indigo-100">
                      <div className="font-bold text-gray-900">{bearer.name}</div>
                      <div className="text-sm text-indigo-600 font-medium">{bearer.designation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!ngo.blacklisted && (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Support This NGO</h3>
                <div className="space-y-3">
                  <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                    💝 Donate Now
                  </button>
                  <button className="w-full bg-indigo-700 text-white py-3 rounded-xl font-bold hover:bg-indigo-800 transition-all border-2 border-indigo-400">
                    🤝 Volunteer
                  </button>
                  <button className="w-full bg-purple-700 text-white py-3 rounded-xl font-bold hover:bg-purple-800 transition-all">
                    📧 Contact
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}