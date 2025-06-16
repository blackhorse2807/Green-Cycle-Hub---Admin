"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { FileText, LogIn, LogOut, ClipboardCheck, LayoutDashboard, Package, ChevronDown, CheckCircle, Clock , XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white text-gray-800 shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/login"}
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
          >
            <Image
              src="/colorlogo.svg"
              alt="rPP Admin"
              width={50}
              height={50}
              className="h-12 sm:h-16 w-auto"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/kyc"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  <span>KYC</span>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                  >
                    <Package className="w-5 h-5" />
                    <span>Products</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {isProductsOpen && (
                    <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          href="/products/pending"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Pending Products
                        </Link>
                        <Link
                          href="/products/verified"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verified Products
                        </Link>
                        <Link
                          href="/products/rejected"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejected Products
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 py-2 border-t border-gray-100">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </div>
                </Link>
                <Link
                  href="/kyc"
                  className="block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <ClipboardCheck className="w-5 h-5" />
                    <span>KYC</span>
                  </div>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="block w-full text-left py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Products</span>
                    </div>
                  </button>
                  
                  {isProductsOpen && (
                    <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          href="/products/pending"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Pending Products
                        </Link>
                        <Link
                          href="/products/verified"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verified Products
                        </Link>
                        <Link
                          href="/products/rejected"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejected Products
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 