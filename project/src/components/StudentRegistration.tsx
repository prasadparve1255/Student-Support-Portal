import React, { useState, useMemo } from "react";
import { X, UserPlus, GraduationCap, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useDepartments } from "../hooks/useDepartments";
import { useClasses } from "../hooks/useClasses";
import { useAuthContext as useAuth } from "../context/AuthContext";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const StudentRegistration: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { authState } = useAuth();
  const { departments } = useDepartments();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: authState.currentAdmin?.isMainAdmin ? "" : (authState.currentAdmin?.department || ""),
    classId: "",
    password: "",
  });

  const selectedDeptId = useMemo(() => {
    return departments.find(d => d.name === formData.department)?._id;
  }, [departments, formData.department]);

  const { classes } = useClasses(selectedDeptId);

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    return score;
  }, [formData.password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.email || !formData.department || !formData.password) {
      setError("Please fill all required fields");
      return;
    }
    if (classes.length > 0 && !formData.classId) {
      setError("Please select a class");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          department: formData.department,
          classId: formData.classId || undefined,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessId(data.studentId);
        onSuccess();
        setTimeout(onClose, 3000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (successId) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Student Registered!</h3>
          <p className="text-gray-500 mb-4">Student has been successfully registered.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-6">
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">Student ID</p>
            <p className="text-2xl font-bold text-blue-700 font-mono">{successId}</p>
          </div>
          <p className="text-xs text-gray-400">A welcome email has been sent to the student. Closing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Register New Student</h3>
              <p className="text-xs text-gray-400">Fill in student details below</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Section 1: Personal Info */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Personal Info</span>
            </div>
            <div className="space-y-3 bg-blue-50 rounded-xl p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center space-x-1"><Mail className="h-3.5 w-3.5" /><span>Email <span className="text-red-500">*</span></span></span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="student@college.edu"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Info */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <GraduationCap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Academic Info</span>
            </div>
            <div className="space-y-3 bg-purple-50 rounded-xl p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                {authState.currentAdmin?.isMainAdmin ? (
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value, classId: "" })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d._id} value={d.name}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.department}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-sm text-gray-600 cursor-not-allowed"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class {classes.length > 0 && <span className="text-red-500">*</span>}
                </label>
                {classes.length > 0 ? (
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <span className="text-amber-600 text-sm">⚠ No classes found. Add classes first from the Classes tab.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Password */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Login Password</span>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${["", "text-red-500", "text-orange-500", "text-yellow-600", "text-green-600"][passwordStrength]}`}>
                    {strengthLabel}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Student will use this password to login.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Registering...</span></>
              ) : (
                <><UserPlus className="h-4 w-4" /><span>Register Student</span></>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
