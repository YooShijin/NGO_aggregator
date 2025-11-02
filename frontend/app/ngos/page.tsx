'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ngoAPI, categoryAPI, type NGO, type Category } from '@/lib/api';
import { MapPin, CheckCircle, ExternalLink, Mail, Phone, Search, Filter, Heart } from 'lucide-react';
import Link from 'next/link';

export default function NGOsPage() {
  const searchParams = useSearchParams();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: '',
    verified: false,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadNGOs();
  }, [filters, pagination.current]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadNGOs = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.current };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.state) params.state = filters.state;
      if (filters.verified) params.verified = 'true';

      const res = await ngoAPI.getAll(params);
      setNgos(res.data.ngos);
      setPagination({
        total: res.data.total,
        pages: res.data.pages,
        current: pagination.current,
      });
    } catch (error) {
      console.error('Error loading NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            NGO Directory
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Verified NGOs</span>
          </h1>
          <p className="text-xl text-gray-600">Browse through our curated list of verified social organizations</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Filter NGOs</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search NGOs..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <select
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Filter by State"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            />
            
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="font-medium text-gray-700">Verified Only</span>
            </label>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading NGOs...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div className="text-gray-700 text-lg">
                Found <span className="font-bold text-indigo-600 text-2xl">{pagination.total}</span> NGO{pagination.total !== 1 ? 's' : ''}
              </div>
              <Link
                href="/blacklisted"
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
              >
                <span>⚠️</span>
                View Blacklisted NGOs
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ngos.map((ngo) => (
                <div
                  key={ngo.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-indigo-200"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold leading-tight pr-4">{ngo.name}</h3>
                        {ngo.verified && (
                          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full flex-shrink-0">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      {ngo.verified && (
                        <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {ngo.mission && (
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{ngo.mission}</p>
                    )}

                    {ngo.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ngo.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium"
                          >
                            <span>{cat.icon}</span>
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {(ngo.city || ngo.state) && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-xl">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {ngo.city}
                          {ngo.city && ngo.state && ', '}
                          {ngo.state}
                        </span>
                      </div>
                    )}

                    {/* Contact Icons */}
                    <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                      {ngo.email && (
                        <a
                          href={`mailto:${ngo.email}`}
                          className="w-10 h-10 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
                          title={ngo.email}
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                      {ngo.phone && (
                        <a
                          href={`tel:${ngo.phone}`}
                          className="w-10 h-10 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors"
                          title={ngo.phone}
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                      )}
                      {ngo.website && (
                        <a
                          href={ngo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    {/* Transparency Score */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-600">Transparency</span>
                        <span className="text-xs font-bold text-indigo-600">{ngo.transparency_score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${ngo.transparency_score}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      href={`/ngos/${ngo.id}`}
                      className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-center py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, current: page })}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      page === pagination.current
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}