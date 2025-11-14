"use client";

import Link from "next/link";
import {
  Heart,
  Menu,
  X,
  Home,
  Building2,
  Users,
  Calendar,
  BarChart3,
  AlertTriangle,
  LogIn,
  UserPlus,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // handles mobile menu open/close
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false); // dropdown for logged-in user
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // when page loads, try to load user from localStorage
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    // clearing saved login info
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowUserMenu(false);
    router.push("/"); // back to home page after logout
  };

  // send user to the right dashboard based on role
  const getDashboardLink = () => {
    if (!user) return "/auth/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "ngo") return "/ngo/dashboard";
    return "/dashboard";
  };

  // navbar links for common routes
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/ngos", label: "NGOs", icon: Building2 },
    { href: "/volunteer", label: "Volunteer", icon: Users },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/impact", label: "Impact", icon: BarChart3 },
    { href: "/blacklisted", label: "Blacklisted", icon: AlertTriangle },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-4 border-indigo-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and branding */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  NGO Portal
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Social Impact Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            {/* main routes */}
            {navLinks.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {l.label}
                </Link>
              );
            })}

            {/* Login / Profile */}
            {user ? (
              <div className="relative ml-4">
                {/* show username */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <User className="w-4 h-4" />
                  {user.name}
                </button>

                {/* profile dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // login + signup buttons
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {l.label}
                </Link>
              );
            })}

            {/* mobile auth box */}
            <div className="pt-3 mt-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="px-4 py-3 mb-2 bg-indigo-50 rounded-xl">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
