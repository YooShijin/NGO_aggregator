// lib/api.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface NGO {
  id: number;
  name: string;
  registration_no?: string;
  darpan_id?: string;
  mission?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  verified: boolean;
  blacklisted: boolean;
  transparency_score: number;
  categories: Category[];
  office_bearers?: any[];
  blacklist_info?: any;
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface VolunteerPost {
  id: number;
  ngo_id: number;
  ngo_name?: string;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  deadline?: string;
  active: boolean;
  created_at: string;
  applications_count?: number;
  bookmarks_count?: number;
}

export interface Event {
  id: number;
  ngo_id: number;
  ngo_name?: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  registration_link?: string;
  created_at: string;
}

export interface Stats {
  total_ngos: number;
  verified_ngos: number;
  blacklisted_ngos: number;
  total_volunteers: number;
  upcoming_events: number;
  categories: { name: string; count: number }[];
  states: { name: string; count: number }[];
}

export interface MapNGO {
  id: number;
  name: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  verified: boolean;
  blacklisted: boolean;
  categories: string[];
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
};

// User API
export const userAPI = {
  getDashboard: () => api.get("/user/dashboard"),
  addBookmark: (volunteer_post_id: number) =>
    api.post("/user/bookmarks", { volunteer_post_id }),
  removeBookmark: (id: number) => api.delete(`/user/bookmarks/${id}`),
  addLike: (ngo_id: number) => api.post("/user/likes", { ngo_id }),
  removeLike: (id: number) => api.delete(`/user/likes/${id}`),
};

// NGO API
export const ngoAPI = {
  getAll: (params?: any) => api.get("/ngos", { params }),
  getById: (id: number) => api.get(`/ngos/${id}`),
  getMapData: () => api.get("/ngos/map"),
  requestAccount: (data: any) => api.post("/ngo/request", data),
  getDashboard: () => api.get("/ngo/dashboard"),
  createVolunteerPost: (data: any) => api.post("/ngo/volunteer-posts", data),
  updateVolunteerPost: (id: number, data: any) =>
    api.put(`/ngo/volunteer-posts/${id}`, data),
  createEvent: (data: any) => api.post("/ngo/events", data),
  updateApplicationStatus: (id: number, status: string) =>
    api.put(`/ngo/applications/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getNGORequests: (status?: string) =>
    api.get("/admin/ngo-requests", { params: { status } }),
  approveNGORequest: (id: number, password: string) =>
    api.post(`/admin/ngo-requests/${id}/approve`, { password }),
  rejectNGORequest: (id: number, reason: string) =>
    api.post(`/admin/ngo-requests/${id}/reject`, { reason }),
  verifyNGO: (id: number) => api.post(`/ngos/${id}/verify`),
  blacklistNGO: (id: number, data: any) =>
    api.post(`/ngos/${id}/blacklist`, data),
  unblacklistNGO: (id: number) => api.post(`/ngos/${id}/unblacklist`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get("/categories"),
};

// Volunteer API
export const volunteerAPI = {
  getAll: (params?: any) => api.get("/volunteer-posts", { params }),
  apply: (data: { volunteer_post_id: number; message: string }) =>
    api.post("/applications", data),
};

// Event API
export const eventAPI = {
  getAll: (params?: any) => api.get("/events", { params }),
};

// Stats API
export const statsAPI = {
  get: () => api.get("/stats"),
};

// Blacklist API
export const blacklistAPI = {
  getAll: (params?: any) => api.get("/blacklisted", { params }),
};

// Search API
export const searchAPI = {
  search: (query: string) => api.get("/search", { params: { q: query } }),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message: string) => api.post("/chatbot", { message }),
};

export default api;