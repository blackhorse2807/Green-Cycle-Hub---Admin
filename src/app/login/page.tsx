"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [invalidCredsError, setInvalidCredsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, user, logout } = useAuth();

  // Handle redirection after successful login
  useEffect(() => {
    if (user?.role) {
      if (user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        // If not admin, log them out and show error
        logout();
        setInvalidCredsError("Access denied. This portal is for administrators only.");
      }
    }
  }, [user, router, logout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setInvalidCredsError("");
    setIsLoading(true);

    let valid = true;

    if (!email) {
      setEmailError("Please enter your email");
      valid = false;
    } else if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      valid = false;
    }

    if (!password) {
      setPasswordError("Please enter your password");
      valid = false;
    }

    if (!valid) {
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      
      if (!success) {
        setInvalidCredsError("Invalid email or password. Please try again.");
      }
      // Redirection will be handled by the useEffect above
    } catch (error) {
      console.error("Login error:", error);
      setInvalidCredsError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
      
      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo and branding */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/colorlogo.svg" 
            alt="rPP Admin" 
            width={80} 
            height={80} 
            className="h-20 w-auto"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white p-8 sm:p-10 rounded-lg shadow-xl border border-gray-200"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Administrator Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" /> {emailError}
                </motion.p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" /> {passwordError}
                </motion.p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {invalidCredsError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center"
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                {invalidCredsError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center bg-blue-600 text-white py-3 rounded-md text-base font-medium transition-all duration-200 
                ${isLoading 
                  ? "opacity-70 cursor-not-allowed" 
                  : "hover:bg-blue-700 active:transform active:scale-[0.99] hover:shadow-md"}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Sign in to Dashboard"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} VELEBIT GREEN. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}