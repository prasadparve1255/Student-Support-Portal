import React, { useState } from 'react';
import {
  ArrowLeft, UserCircle, Shield, Building2, Mail, GraduationCap,
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, MessageSquare, Clock, TrendingUp, FileText
} from 'lucide-react';
import { useAuthContext as useAuth } from '../context/AuthContext';
import { useComplaints } from '../hooks/useComplaints';
import API_BASE from '../services/api';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { authState } = useAuth();
  const { complaints } = useComplaints();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = authState.isAdmin;
  const admin = authState.currentAdmin;
  const student = authState.currentStudent;

  const displayName = isAdmin ? (admin?.username || '') : (student?.name || '');
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const studentComplaints = !isAdmin
    ? complaints.filter(c => c.studentId === student?.id && !c.isArchived)
    : [];

  const stats = isAdmin
    ? {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
      }
    : {
        total: studentComplaints.length,
        pending: studentComplaints.filter(c => c.status === 'Pending').length,
        inProgress: studentComplaints.filter(c => c.status === 'In Progress').length,
        resolved: studentComplaints.filter(c => c.status === 'Resolved').length,
      };

  const handleChangePassword = async () => {
    setMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: 'All fields are required', success: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', success: false });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', success: false });
      return;
    }
    if (newPassword === currentPassword) {
      setMessage({ text: 'New password must be different from current password', success: false });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Password changed successfully!', success: true });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'Failed to change password', success: false });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', success: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10">
            <div className="flex items-center space-x-6">
              <div className="bg-white bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white border-opacity-40">
                <span className="text-white text-2xl font-bold">{initials || <UserCircle className="h-10 w-10 text-white" />}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  isAdmin
                    ? admin?.isMainAdmin
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-blue-200 text-blue-900'
                    : 'bg-green-300 text-green-900'
                }`}>
                  {isAdmin ? (admin?.isMainAdmin ? 'Main Admin' : 'Department Admin') : 'Student'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAdmin ? (
              <>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="font-semibold text-gray-900">{admin?.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Building2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-semibold text-gray-900">{admin?.department || 'All Departments'}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <UserCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Student ID</p>
                    <p className="font-semibold text-gray-900">{student?.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="h-5 w-5 text-purple-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{student?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl sm:col-span-2">
                  <GraduationCap className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-semibold text-gray-900">{student?.department as string}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>{isAdmin ? 'Complaints Managed' : 'My Complaint Stats'}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <FileText className="h-6 w-6 text-gray-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl text-center">
              <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-gray-500 mt-1">In Progress</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-xs text-gray-500 mt-1">Resolved</p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <span>Change Password</span>
          </h2>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-1 flex items-center space-x-2">
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-red-400'}`} />
                  <span className={`text-xs ${newPassword.length >= 6 ? 'text-green-600' : 'text-red-500'}`}>
                    {newPassword.length >= 6 ? 'Strong enough' : 'Too short'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <p className="text-xs text-green-600 mt-1">Passwords match ✓</p>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${message.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.success
                  ? <CheckCircle className="h-4 w-4 shrink-0" />
                  : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
