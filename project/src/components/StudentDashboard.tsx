// import React, { useState, useMemo } from 'react';
// import { 
//   Plus, 
//   Search, 
//   Filter, 
//   Clock, 
//   CheckCircle, 
//   AlertTriangle, 
//   FileText,
//   Calendar,
//   User,
//   Mail,
//   Hash,
//   Building,
//   Tag,
//   Star,
//   MessageSquare,
//   TrendingUp,
//   Eye,
//   LogOut
// } from 'lucide-react';
// import { useComplaints } from '../hooks/useComplaints';
// import { useAuth } from '../hooks/useAuth';
// import { Complaint } from '../types/complaint';
// import ComplaintForm from './ComplaintForm';

// const StudentDashboard: React.FC = () => {
//   const { complaints, markNotificationAsRead, loadComplaints } = useComplaints();
//   const { authState, logout } = useAuth();
//   const [currentView, setCurrentView] = useState<'dashboard' | 'new-complaint' | 'view-complaint' | 'history'>('dashboard');
//   const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');

//   const studentComplaints = useMemo(() => {
//     return complaints.filter(complaint => 
//       complaint.studentId === authState.currentStudent?.id && !complaint.isArchived
//     );
//   }, [complaints, authState.currentStudent?.id]);
  
//   const archivedComplaints = useMemo(() => {
//     return complaints.filter(complaint => 
//       complaint.studentId === authState.currentStudent?.id && complaint.isArchived
//     );
//   }, [complaints, authState.currentStudent?.id]);
  
//   const notifications = useMemo(() => {
//     return studentComplaints.filter(complaint => complaint.isNotification);
//   }, [studentComplaints]);

//   const filteredComplaints = useMemo(() => {
//     return studentComplaints.filter(complaint => {
//       const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      
//       return matchesSearch && matchesStatus;
//     }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }, [studentComplaints, searchTerm, statusFilter]);

//   const stats = useMemo(() => {
//     return {
//       total: studentComplaints.length,
//       pending: studentComplaints.filter(c => c.status === 'Pending').length,
//       inProgress: studentComplaints.filter(c => c.status === 'In Progress').length,
//       resolved: studentComplaints.filter(c => c.status === 'Resolved').length,
//     };
//   }, [studentComplaints]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'High': return 'text-red-600';
//       case 'Medium': return 'text-yellow-600';
//       case 'Low': return 'text-green-600';
//       default: return 'text-gray-600';
//     }
//   };

//   if (currentView === 'new-complaint') {
//     return <ComplaintForm onBack={() => setCurrentView('dashboard')} />;
//   }

//   if (currentView === 'history') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <div className="mb-6">
//             <button
//               onClick={() => setCurrentView('dashboard')}
//               className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
//             >
//               <span>← Back to Dashboard</span>
//             </button>
//             <h1 className="text-2xl font-bold text-gray-900 mt-4">Complaint History</h1>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//             {archivedComplaints.length === 0 ? (
//               <div className="p-12 text-center">
//                 <p className="text-gray-500 text-lg">No archived complaints</p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-200">
//                 {archivedComplaints.map((complaint) => (
//                   <div key={complaint.id} className="p-6">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-2">
//                           <h3 className="text-lg font-semibold text-gray-900">{complaint.subject}</h3>
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
//                             {complaint.status}
//                           </span>
//                         </div>
//                         <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>
//                         <div className="text-sm text-gray-500">
//                           Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
//                         </div>
//                         {complaint.adminResponse && (
//                           <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                             <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
//                             <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (currentView === 'view-complaint' && selectedComplaint) {
//     // If viewing a notification, mark it as read
//     if (selectedComplaint.isNotification) {
//       markNotificationAsRead(selectedComplaint.id);
//       // Reload complaints to refresh the UI
//       loadComplaints();
//     }
    
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <div className="mb-6">
//             <button
//               onClick={() => {
//                 setCurrentView('dashboard');
//                 setSelectedComplaint(null);
//               }}
//               className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
//             >
//               <span>← Back to Dashboard</span>
//             </button>
//           </div>

//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h1 className="text-2xl font-bold text-white mb-2">{selectedComplaint.subject}</h1>
//                   <p className="text-blue-100">Complaint ID: #{selectedComplaint.id}</p>
//                 </div>
//                 <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)} bg-white`}>
//                   {selectedComplaint.status}
//                 </span>
//               </div>
//             </div>

//             <div className="p-8">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3">
//                     <Building className="h-5 w-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-600">Department</p>
//                       <p className="font-medium text-gray-900">{selectedComplaint.department}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <Tag className="h-5 w-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-600">Category</p>
//                       <p className="font-medium text-gray-900">{selectedComplaint.category}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3">
//                     <Star className="h-5 w-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-600">Priority</p>
//                       <p className={`font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
//                         {selectedComplaint.priority}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <Calendar className="h-5 w-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-600">Submitted</p>
//                       <p className="font-medium text-gray-900">
//                         {new Date(selectedComplaint.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
//                 <div className="bg-gray-50 p-4 rounded-xl">
//                   <p className="text-gray-700 leading-relaxed">{selectedComplaint.description}</p>
//                 </div>
//               </div>

//               {selectedComplaint.adminResponse && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//                   <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
//                     <MessageSquare className="h-5 w-5" />
//                     <span>Admin Response</span>
//                   </h3>
//                   <p className="text-blue-800 leading-relaxed">{selectedComplaint.adminResponse}</p>
//                   <p className="text-sm text-blue-600 mt-3">
//                     Updated: {new Date(selectedComplaint.updatedAt).toLocaleDateString()}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       {/* Header */}
//       <div className="bg-white shadow-lg border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
//                 <User className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">
//                   Welcome, {authState.currentStudent?.name}
//                 </h1>
//                 <p className="text-gray-600">Student ID: {authState.currentStudent?.id}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               {notifications.length > 0 && (
//                 <div className="relative">
//                   <button
//                     onClick={() => {
//                       if (notifications.length > 0) {
//                         setSelectedComplaint(notifications[0]);
//                         setCurrentView('view-complaint');
//                       }
//                     }}
//                     className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
//                   >
//                     <span className="animate-pulse">New Updates ({notifications.length})</span>
//                   </button>
//                 </div>
//               )}
//               <button
//                 onClick={() => setCurrentView('history')}
//                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//               >
//                 <span>History</span>
//               </button>
//               <button
//                 onClick={logout}
//                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//               >
//                 <LogOut className="h-4 w-4" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Complaints</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//               </div>
//               <FileText className="h-8 w-8 text-blue-600" />
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending</p>
//                 <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
//               </div>
//               <Clock className="h-8 w-8 text-orange-600" />
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">In Progress</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
//               </div>
//               <TrendingUp className="h-8 w-8 text-blue-600" />
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Resolved</p>
//                 <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-600" />
//             </div>
//           </div>
//         </div>

//         {/* Action Bar */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//             <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search complaints..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div className="relative">
//                 <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="Pending">Pending</option>
//                   <option value="In Progress">In Progress</option>
//                   <option value="Resolved">Resolved</option>
//                 </select>
//               </div>
//             </div>

//             <button
//               onClick={() => setCurrentView('new-complaint')}
//               className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
//             >
//               <Plus className="h-4 w-4" />
//               <span>New Complaint</span>
//             </button>
//           </div>
//         </div>

//         {/* Complaints List */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-xl font-semibold text-gray-900">
//               My Complaints ({filteredComplaints.length})
//             </h2>
//           </div>

//           {filteredComplaints.length === 0 ? (
//             <div className="p-12 text-center">
//               <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg mb-2">No complaints found</p>
//               <p className="text-gray-400 mb-6">
//                 {studentComplaints.length === 0 
//                   ? "You haven't filed any complaints yet." 
//                   : "Try adjusting your search or filter criteria."
//                 }
//               </p>
//               {studentComplaints.length === 0 && (
//                 <button
//                   onClick={() => setCurrentView('new-complaint')}
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
//                 >
//                   <Plus className="h-4 w-4" />
//                   <span>File Your First Complaint</span>
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredComplaints.map((complaint) => (
//                 <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <h3 className="text-lg font-semibold text-gray-900">{complaint.subject}</h3>
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
//                           {complaint.status}
//                         </span>
//                         <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
//                           {complaint.priority} Priority
//                         </span>
//                       </div>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium">Department:</span> {complaint.department}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium">Category:</span> {complaint.category}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium">Submitted:</span> {new Date(complaint.createdAt).toLocaleDateString()}
//                           </p>
//                           {complaint.updatedAt !== complaint.createdAt && (
//                             <p className="text-sm text-gray-600">
//                               <span className="font-medium">Updated:</span> {new Date(complaint.updatedAt).toLocaleDateString()}
//                             </p>
//                           )}
//                         </div>
//                       </div>

//                       <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>
                      
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-gray-500">
//                           ID: #{complaint.id}
//                         </div>
                        
//                         <button
//                           onClick={() => {
//                             setSelectedComplaint(complaint);
//                             setCurrentView('view-complaint');
//                           }}
//                           className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
//                         >
//                           <Eye className="h-4 w-4" />
//                           <span>View Details</span>
//                         </button>
//                       </div>

//                       {complaint.adminResponse && (
//                         <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                           <p className="text-sm font-medium text-blue-900 mb-1">Latest Update:</p>
//                           <p className="text-sm text-blue-800 line-clamp-2">{complaint.adminResponse}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;


import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  FileText,
  Calendar,
  User,
  Building,
  Tag,
  Star,
  MessageSquare,
  TrendingUp,
  Eye,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../hooks/useComplaints';
import { useAuth } from '../hooks/useAuth';
import { Complaint } from '../types/complaint';
import ComplaintForm from './ComplaintForm';

const StudentDashboard: React.FC = () => {
  const { complaints, markNotificationAsRead, loadComplaints } = useComplaints();
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-complaint' | 'view-complaint' | 'history'>('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated or not a student
  useEffect(() => {
    if (!authState.isAuthenticated || authState.isAdmin) {
      navigate('/');
    }
  }, [authState, navigate]);

  // Load complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        await loadComplaints();
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [loadComplaints]);

  const studentComplaints = useMemo(() => {
    if (!authState.currentStudent?.id) return [];
    return complaints.filter(complaint => 
      complaint.studentId === authState.currentStudent?.id && !complaint.isArchived
    );
  }, [complaints, authState.currentStudent?.id]);

  const archivedComplaints = useMemo(() => {
    if (!authState.currentStudent?.id) return [];
    return complaints.filter(complaint => 
      complaint.studentId === authState.currentStudent?.id && complaint.isArchived
    );
  }, [complaints, authState.currentStudent?.id]);

  const notifications = useMemo(() => {
    return studentComplaints.filter(complaint => complaint.isNotification);
  }, [studentComplaints]);

  const filteredComplaints = useMemo(() => {
    return studentComplaints
      .filter(complaint => {
        const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [studentComplaints, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: studentComplaints.length,
      pending: studentComplaints.filter(c => c.status === 'Pending').length,
      inProgress: studentComplaints.filter(c => c.status === 'In Progress').length,
      resolved: studentComplaints.filter(c => c.status === 'Resolved').length,
    };
  }, [studentComplaints]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!authState.currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-red-600">Error: Student data not found. Please log in again.</p>
      </div>
    );
  }

  if (currentView === 'new-complaint') {
    return <ComplaintForm onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>← Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Complaint History</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading complaints...</p>
              </div>
            ) : archivedComplaints.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No archived complaints</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {archivedComplaints.map((complaint) => (
                  <div key={complaint.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{complaint.subject}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>
                        <div className="text-sm text-gray-500">
                          Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                        </div>
                        {complaint.adminResponse && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                            <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'view-complaint' && selectedComplaint) {
    if (selectedComplaint.isNotification) {
      markNotificationAsRead(selectedComplaint.id);
      loadComplaints();
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setSelectedComplaint(null);
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>← Back to Dashboard</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedComplaint.subject}</h1>
                  <p className="text-blue-100">Complaint ID: #{selectedComplaint.id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)} bg-white`}>
                  {selectedComplaint.status}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-900">{selectedComplaint.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium text-gray-900">{selectedComplaint.category}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className={`font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">{selectedComplaint.description}</p>
                </div>
              </div>

              {selectedComplaint.adminResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Admin Response</span>
                  </h3>
                  <p className="text-blue-800 leading-relaxed">{selectedComplaint.adminResponse}</p>
                  <p className="text-sm text-blue-600 mt-3">
                    Updated: {new Date(selectedComplaint.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {authState.currentStudent.name}
                </h1>
                <p className="text-gray-600">Student ID: {authState.currentStudent.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {notifications.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      if (notifications.length > 0) {
                        setSelectedComplaint(notifications[0]);
                        setCurrentView('view-complaint');
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  >
                    <span className="animate-pulse">New Updates ({notifications.length})</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span>History</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('new-complaint')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Complaint</span>
            </button>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              My Complaints ({filteredComplaints.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No complaints found</p>
              <p className="text-gray-400 mb-6">
                {studentComplaints.length === 0 
                  ? "You haven't filed any complaints yet." 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {studentComplaints.length === 0 && (
                <button
                  onClick={() => setCurrentView('new-complaint')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>File Your First Complaint</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority} Priority
                        </span>
                        {complaint.isNotification && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200">
                            New Update
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Department:</span> {complaint.department}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {complaint.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Submitted:</span> {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                          {complaint.updatedAt !== complaint.createdAt && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Updated:</span> {new Date(complaint.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          ID: #{complaint.id}
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setCurrentView('view-complaint');
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>

                      {complaint.adminResponse && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-1">Latest Update:</p>
                          <p className="text-sm text-blue-800 line-clamp-2">{complaint.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;