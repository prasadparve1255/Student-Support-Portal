import React, { useState } from "react";
import {
  User,
  Lock,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  BookOpen,
  Star,
  Award,
} from "lucide-react";
import { useAuthContext as useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { loginStudent, loginAdmin } = useAuth();
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success = false;
      if (loginType === "student") {
        success = await loginStudent(formData.username, formData.password);
      } else {
        success = await loginAdmin(formData.username, formData.password);
      }

      if (!success) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 sm:p-3 rounded-2xl shadow-lg">
                  <img src="/logo.svg" alt="Student Support Portal Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Student Support Portal
                </h1>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight">
                A Smart Student Complaint
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {" "}& Grievance Management
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 max-w-lg mx-auto lg:mx-0">
                A Smart Student Complaint and Grievance Management System — streamline your academic concerns efficiently.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Secure Login</h3>
                    <p className="text-blue-100 text-sm">Protected access</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Track Status</h3>
                    <p className="text-blue-100 text-sm">Real-time updates</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Easy Filing</h3>
                    <p className="text-blue-100 text-sm">Simple process</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Quick Response</h3>
                    <p className="text-blue-100 text-sm">Fast resolution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-white/20">
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 sm:p-3 rounded-2xl w-fit mx-auto mb-4">
                  {loginType === "student" ? (
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  ) : (
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Sign in to{" "}
                  {loginType === "student"
                    ? "manage your complaints"
                    : "access admin dashboard"}
                </p>

              </div>

              {/* Login Type Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-4 sm:mb-6">
                <button
                  type="button"
                  onClick={() => setLoginType("student")}
                  className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    loginType === "student"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("admin")}
                  className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    loginType === "admin"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {loginType === "student" ? "Student ID" : "Username"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder={
                        loginType === "student"
                          ? "Enter your student ID"
                          : "Enter username"
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              {/* <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Demo Credentials:
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="break-all">
                    <strong>Student:</strong> CS001 /{" "}
                    {import.meta.env.VITE_DEFAULT_STUDENT_PASSWORD ||
                      "defaultPassword"}
                  </p>
                  <p className="break-all">
                    <strong>Main Admin:</strong> admin /{" "}
                    {import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD ||
                      "defaultAdminPassword"}{" "}
                    (can register students)
                  </p>
                  <p className="break-all">
                    <strong>CS Dept Admin:</strong> csadmin /{" "}
                    {import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD ||
                      "defaultAdminPassword"}{" "}
                    (view only)
                  </p>
                  <p className="break-all">
                    <strong>EC Dept Admin:</strong> ecadmin /{" "}
                    {import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD ||
                      "defaultAdminPassword"}{" "}
                    (view only)
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
