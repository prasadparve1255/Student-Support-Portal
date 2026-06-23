import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Filter, Clock, CheckCircle, FileText,
  Calendar, Building, Tag, MessageSquare, TrendingUp,
  Eye, LogOut, UserCircle, Paperclip, ChevronRight,
  AlertCircle, Inbox, ArrowLeft, Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../hooks/useComplaints';
import { useAuthContext as useAuth } from '../context/AuthContext';
import { Complaint } from '../types/complaint';
import ComplaintForm from './ComplaintForm';

const StudentDashboard: React.FC = () => {
  const { complaints, markNotificationAsRead, loadComplaints, deleteComplaint } = useComplaints();
  const { authState, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-complaint' | 'view-complaint' | 'history'>('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    loadComplaints();
    setIsLoading(false);
  }, [loadComplaints]);

  const studentComplaints = useMemo(() => {
    if (!authState.currentStudent?.id) return [];
    return complaints.filter(c => c.studentId === authState.currentStudent?.id && !c.isArchived);
  }, [complaints, authState.currentStudent?.id]);

  const archivedComplaints = useMemo(() => {
    if (!authState.currentStudent?.id) return [];
    return complaints.filter(c => c.studentId === authState.currentStudent?.id && c.isArchived);
  }, [complaints, authState.currentStudent?.id]);

  const notifications = useMemo(() => studentComplaints.filter(c => c.isNotification), [studentComplaints]);

  const filteredComplaints = useMemo(() => {
    return studentComplaints
      .filter(c => {
        const matchSearch = c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [studentComplaints, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: studentComplaints.length,
    pending: studentComplaints.filter(c => c.status === 'Pending').length,
    inProgress: studentComplaints.filter(c => c.status === 'In Progress').length,
    resolved: studentComplaints.filter(c => c.status === 'Resolved').length,
  }), [studentComplaints]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending': return { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400', icon: <Clock className="h-3 w-3" /> };
      case 'In Progress': return { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', icon: <TrendingUp className="h-3 w-3" /> };
      case 'Resolved': return { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400', icon: <CheckCircle className="h-3 w-3" /> };
      default: return { color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400', icon: null };
    }
  };

  if (!authState.currentStudent) return null;

  if (currentView === 'new-complaint') return <ComplaintForm onBack={() => setCurrentView('dashboard')} />;

  // ── History View ──
  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center space-x-3">
            <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Complaint History</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {archivedComplaints.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Inbox className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No archived complaints</p>
              <p className="text-gray-400 text-sm mt-1">Resolved complaints will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedComplaints.map(c => {
                const sc = getStatusConfig(c.status);
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                      <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.color}`}>
                        {sc.icon}<span className="ml-1">{c.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                    {c.adminResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-800">{c.adminResponse}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">Updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── View Complaint ──
  if (currentView === 'view-complaint' && selectedComplaint) {
    if (selectedComplaint.isNotification) {
      markNotificationAsRead(selectedComplaint.id);
      loadComplaints();
    }
    const sc = getStatusConfig(selectedComplaint.status);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center space-x-3">
            <button onClick={() => { setCurrentView('dashboard'); setSelectedComplaint(null); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900 line-clamp-1">{selectedComplaint.subject}</h1>
              <p className="text-xs text-gray-400">ID: #{selectedComplaint.id}</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Status Banner */}
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border ${sc.color}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${sc.dot} shrink-0`} />
            <div>
              <p className="text-sm font-semibold">Status: {selectedComplaint.status}</p>
              <p className="text-xs opacity-75">Last updated: {new Date(selectedComplaint.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Complaint Details</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <Building className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div><p className="text-xs text-gray-400">Department</p><p className="text-sm font-medium text-gray-800">{selectedComplaint.department}</p></div>
              </div>
              <div className="flex items-start space-x-2">
                <Tag className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div><p className="text-xs text-gray-400">Category</p><p className="text-sm font-medium text-gray-800">{selectedComplaint.category}</p></div>
              </div>
              <div className="flex items-start space-x-2 col-span-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div><p className="text-xs text-gray-400">Submitted on</p><p className="text-sm font-medium text-gray-800">{new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Complaint</p>
            <p className="text-gray-700 leading-relaxed text-sm">{selectedComplaint.description}</p>
          </div>

          {/* Attachments */}
          {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center space-x-1">
                <Paperclip className="h-3.5 w-3.5" /><span>Attachments ({selectedComplaint.attachments.length})</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedComplaint.attachments.map((url, i) => {
                  const isPdf = url.toLowerCase().endsWith('.pdf');
                  return isPdf ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      <FileText className="h-5 w-5 text-red-500 shrink-0" />
                      <span className="text-xs text-red-700 truncate">{url.split('/').pop()}</span>
                    </a>
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`attachment-${i + 1}`}
                        className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            '<div class="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs border">Image not found</div>';
                        }} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Response */}
          {selectedComplaint.adminResponse ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Response from Admin</p>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{selectedComplaint.adminResponse}</p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Awaiting Response</p>
                <p className="text-xs text-amber-600 mt-0.5">Your complaint has been received. Admin will respond soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky Navbar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.svg" alt="logo" className="h-11 w-11 shrink-0" />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                  Welcome, {authState.currentStudent.name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="text-sm text-gray-500 font-mono">ID: {authState.currentStudent.id}</span>
                  {authState.currentStudent.class && (
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {authState.currentStudent.class}
                    </span>
                  )}
                  {authState.currentStudent.department && (
                    <span className="hidden sm:inline px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {authState.currentStudent.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={() => { setSelectedComplaint(notifications[0]); setCurrentView('view-complaint'); }}
                  className="relative flex items-center px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-sm font-semibold"
                >
                  <span className="animate-pulse hidden sm:inline">Updates ({notifications.length})</span>
                  <span className="sm:hidden">🔔 {notifications.length}</span>
                </button>
              )}
              <button onClick={() => setCurrentView('new-complaint')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">New Complaint</span>
                <span className="sm:hidden">New</span>
              </button>
              <button onClick={() => setCurrentView('history')}
                className="flex items-center space-x-1.5 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium" title="History">
                <FileText className="h-5 w-5" />
                <span className="hidden sm:inline">History</span>
              </button>
              <button onClick={() => navigate('/profile')}
                className="flex items-center space-x-1.5 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium" title="Profile">
                <UserCircle className="h-5 w-5" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button onClick={logout}
                className="flex items-center space-x-1.5 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium" title="Logout">
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Complaints', value: stats.total, color: 'text-gray-900', bg: 'bg-white', icon: <FileText className="h-8 w-8 text-gray-400" /> },
            { label: 'Pending', value: stats.pending, color: 'text-orange-600', bg: 'bg-orange-50', icon: <Clock className="h-8 w-8 text-orange-400" /> },
            { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50', icon: <TrendingUp className="h-8 w-8 text-blue-400" /> },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle className="h-8 w-8 text-green-400" /> },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between`}>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              {s.icon}
            </div>
          ))}
        </div>

        {/* New Complaint CTA — only when no complaints */}
        {studentComplaints.length === 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-white text-center shadow-lg">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">Submit Your First Complaint</h2>
            <p className="text-blue-100 text-base mb-6">Have an issue? Let your department know. We'll get back to you.</p>
            <button
              onClick={() => setCurrentView('new-complaint')}
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-base"
            >
              + New Complaint
            </button>
          </div>
        )}

        {/* Search + Filter */}
        {studentComplaints.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search complaints..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm" />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="pl-11 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-base shadow-sm w-full sm:w-48">
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        )}

        {/* Complaints List */}
        {studentComplaints.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">My Complaints <span className="text-gray-400 font-normal text-base">({filteredComplaints.length})</span></h2>
            </div>

            {isLoading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
                <p className="text-gray-400 mt-4">Loading...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Search className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No complaints match</p>
                <p className="text-gray-400 mt-1">Try changing your search or filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map(c => {
                  const sc = getStatusConfig(c.status);
                  return (
                    <div key={c.id}
                      onClick={() => { setSelectedComplaint(c); setCurrentView('view-complaint'); }}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-3">
                            <h3 className="text-base font-bold text-gray-900">{c.subject}</h3>
                            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${sc.color}`}>
                              {sc.icon}<span className="ml-1">{c.status}</span>
                            </span>
                            {c.isNotification && (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 border border-red-200 animate-pulse">
                                🔴 New Update!
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-3">
                            <span className="flex items-center space-x-1.5"><Building className="h-4 w-4" /><span>{c.department}</span></span>
                            <span className="flex items-center space-x-1.5"><Tag className="h-4 w-4" /><span>{c.category}</span></span>
                            <span className="flex items-center space-x-1.5"><Calendar className="h-4 w-4" /><span>{new Date(c.createdAt).toLocaleDateString()}</span></span>
                            {c.attachments && c.attachments.length > 0 && (
                              <span className="flex items-center space-x-1.5"><Paperclip className="h-4 w-4" /><span>{c.attachments.length} attachment(s)</span></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{c.description}</p>
                          {c.adminResponse && (
                            <div className="mt-3 flex items-start space-x-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                              <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-blue-700 line-clamp-1">{c.adminResponse}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                          {c.status === 'Pending' && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!window.confirm('Delete this complaint?')) return;
                                try { await deleteComplaint(c.id); }
                                catch (err: any) { alert(err.message || 'Delete failed'); }
                              }}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete complaint"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
