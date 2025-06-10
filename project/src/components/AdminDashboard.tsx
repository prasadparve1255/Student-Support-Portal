// import React, { useState, useMemo } from 'react';
// import {
//   Search,
//   Filter,
//   Clock,
//   CheckCircle,
//   Users,
//   TrendingUp,
//   Calendar,
//   MessageSquare,
//   MoreHorizontal,
//   Mail,
//   Send,
//   LogOut,
//   GraduationCap
// } from 'lucide-react';
// import { useComplaints } from '../hooks/useComplaints';
// import { useAuth } from '../hooks/useAuth';
// import { Complaint, ComplaintStats } from '../types/complaint';
// import DepartmentManagement from './DepartmentManagement';

// const AdminDashboard: React.FC = () => {
//   const { complaints, updateComplaintStatus, isEmailSending, loadComplaints } = useComplaints();
//   const { authState, logout, getStudents, registerStudent } = useAuth();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [departmentFilter, setDepartmentFilter] = useState<string>(
//     authState.currentAdmin?.isMainAdmin ? 'all' : (authState.currentAdmin?.department || 'all')
//   );
//   const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
//   const [adminResponse, setAdminResponse] = useState('');
//   const [showRegisterModal, setShowRegisterModal] = useState(false);
//   const [newStudent, setNewStudent] = useState({
//     name: '',
//     email: '',
//     department: authState.currentAdmin?.department || '',
//     password: ''
//   });
//   const [registrationSuccess, setRegistrationSuccess] = useState('');
//   const [activeTab, setActiveTab] = useState<'complaints' | 'students' | 'departments'>('complaints');

//   const stats: ComplaintStats = useMemo(() => {
//     return {
//       total: complaints.length,
//       pending: complaints.filter(c => c.status === 'Pending').length,
//       inProgress: complaints.filter(c => c.status === 'In Progress').length,
//       resolved: complaints.filter(c => c.status === 'Resolved').length,
//     };
//   }, [complaints]);

//   const studentStats = useMemo(() => {
//     const students = getStudents();
//     const departmentCounts: Record<string, number> = {};

//     // Count students by department
//     students.forEach(student => {
//       if (authState.currentAdmin && !authState.currentAdmin.isMainAdmin &&
//           student.department !== authState.currentAdmin.department) {
//         return;
//       }

//       if (!departmentCounts[student.department]) {
//         departmentCounts[student.department] = 0;
//       }
//       departmentCounts[student.department]++;
//     });

//     return {
//       total: students.filter(s =>
//         authState.currentAdmin?.isMainAdmin || s.department === authState.currentAdmin?.department
//       ).length,
//       byDepartment: departmentCounts
//     };
//   }, [getStudents, authState.currentAdmin]);

//   const filteredComplaints = useMemo(() => {
//     return complaints.filter(complaint => {
//       const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
//       const matchesDepartment = departmentFilter === 'all' || complaint.department === departmentFilter;

//       // Department admin can only see complaints from their department
//       const adminDepartmentFilter = authState.currentAdmin && !authState.currentAdmin.isMainAdmin
//         ? complaint.department === authState.currentAdmin.department
//         : true;

//       return matchesSearch && matchesStatus && matchesDepartment && adminDepartmentFilter;
//     }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }, [complaints, searchTerm, statusFilter, departmentFilter, authState.currentAdmin]);

//   const filteredStudents = useMemo(() => {
//     const students = getStudents();
//     return students.filter(student => {
//       const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            student.email.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;

//       // Department admin can only see students from their department
//       const adminDepartmentFilter = authState.currentAdmin && !authState.currentAdmin.isMainAdmin
//         ? student.department === authState.currentAdmin.department
//         : true;

//       return matchesSearch && matchesDepartment && adminDepartmentFilter;
//     });
//   }, [getStudents, searchTerm, departmentFilter, authState.currentAdmin]);

//   const uniqueDepartments = useMemo(() => {
//     const departments = [
//       'Computer Science & Engineering',
//       'Electronics & Communication',
//       'Mechanical Engineering',
//       'Civil Engineering',
//       'Electrical Engineering',
//       'Information Technology',
//       'Chemical Engineering'
//     ];
//     return departments;
//   }, []);

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

//   const handleStatusUpdate = async (complaint: Complaint, newStatus: Complaint['status']) => {
//     await updateComplaintStatus(complaint.id, newStatus, adminResponse);
//     // Reload complaints to refresh the UI
//     loadComplaints();
//     setSelectedComplaint(null);
//     setAdminResponse('');
//   };

//   const handleRegisterStudent = () => {
//     if (!newStudent.name || !newStudent.email || !newStudent.department || !newStudent.password) {
//       setRegistrationSuccess('Please fill all fields');
//       return;
//     }

//     // Only main admin can register students
//     if (!authState.currentAdmin?.isMainAdmin) {
//       setRegistrationSuccess('Only main admin can register students');
//       return;
//     }

//     const registeredStudent = registerStudent(newStudent);
//     setRegistrationSuccess(`Student registered successfully with ID: ${registeredStudent.id}`);
//     setNewStudent({
//       name: '',
//       email: '',
//       department: '',
//       password: ''
//     });

//     // Clear success message after 3 seconds
//     setTimeout(() => {
//       setRegistrationSuccess('');
//     }, 3000);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               {authState.currentAdmin?.isMainAdmin ? 'Main Admin Dashboard' : `${authState.currentAdmin?.department} Admin Dashboard`}
//             </h1>
//             <p className="text-gray-600">
//               {authState.currentAdmin?.isMainAdmin
//                 ? 'Manage and track all student complaints with automated email notifications'
//                 : `Manage ${authState.currentAdmin?.department} department complaints`}
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             {authState.currentAdmin?.isMainAdmin && (
//               <button
//                 onClick={() => setShowRegisterModal(true)}
//                 className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
//               >
//                 <Users className="h-4 w-4" />
//                 <span>Register Student</span>
//               </button>
//             )}
//             <button
//               onClick={logout}
//               className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//             >
//               <LogOut className="h-4 w-4" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>

//         {/* Email Status Indicator */}
//         {isEmailSending && (
//           <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <div className="flex items-center space-x-3">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//               <Mail className="h-4 w-4 text-blue-600" />
//               <span className="text-blue-800 font-medium">Sending email notification to student...</span>
//             </div>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           {activeTab === 'complaints' ? (
//             <>
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Complaints</p>
//                     <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//                   </div>
//                   <Users className="h-8 w-8 text-blue-600" />
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Pending</p>
//                     <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
//                   </div>
//                   <Clock className="h-8 w-8 text-orange-600" />
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">In Progress</p>
//                     <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
//                   </div>
//                   <TrendingUp className="h-8 w-8 text-blue-600" />
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Resolved</p>
//                     <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
//                   </div>
//                   <CheckCircle className="h-8 w-8 text-green-600" />
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Students</p>
//                     <p className="text-2xl font-bold text-gray-900">{studentStats.total}</p>
//                   </div>
//                   <Users className="h-8 w-8 text-blue-600" />
//                 </div>
//               </div>

//               {Object.entries(studentStats.byDepartment).slice(0, 3).map(([dept, count]) => (
//                 <div key={dept} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">{dept.split(' ')[0]}</p>
//                       <p className="text-2xl font-bold text-purple-600">{count}</p>
//                     </div>
//                     <GraduationCap className="h-8 w-8 text-purple-600" />
//                   </div>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>

//         {/* Tab Navigation */}
//         <div className="bg-white rounded-xl shadow-lg p-4 mb-8 border border-gray-100">
//           <div className="flex space-x-4">
//             <button
//               onClick={() => setActiveTab('complaints')}
//               className={`px-4 py-2 font-medium rounded-lg transition-colors ${
//                 activeTab === 'complaints'
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Complaints
//             </button>
//             <button
//               onClick={() => setActiveTab('students')}
//               className={`px-4 py-2 font-medium rounded-lg transition-colors ${
//                 activeTab === 'students'
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Students
//             </button>
//             <button
//               onClick={() => setActiveTab('departments')}
//               className={`px-4 py-2 font-medium rounded-lg transition-colors ${
//                 activeTab === 'departments'
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Departments
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder={activeTab === 'complaints' ? "Search complaints..." : "Search students..."}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {activeTab === 'complaints' && (
//               <div className="relative">
//                 <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="Pending">Pending</option>
//                   <option value="In Progress">In Progress</option>
//                   <option value="Resolved">Resolved</option>
//                 </select>
//               </div>
//             )}

//             <div className="relative">
//               <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <select
//                 value={departmentFilter}
//                 onChange={(e) => setDepartmentFilter(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//               >
//                 <option value="all">All Departments</option>
//                 {uniqueDepartments.map(dept => (
//                   <option key={dept} value={dept}>{dept}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Content Based on Active Tab */}
//         {activeTab === 'complaints' ? (
//           /* Complaints List */
//           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-xl font-semibold text-gray-900">
//               Complaints ({filteredComplaints.length})
//             </h2>
//           </div>

//           {filteredComplaints.length === 0 ? (
//             <div className="p-12 text-center">
//               <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg">No complaints found</p>
//               <p className="text-gray-400">Try adjusting your filters or search terms</p>
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
//                             <span className="font-medium"><b>Student:</b></span> {complaint.studentName} ({complaint.studentId})
//                           </p>
//                           <p className="text-sm text-gray-600 flex items-center space-x-1">
//                             <Mail className="h-3 w-3" />
//                             <span className="font-medium"><b>Email</b>:</span>
//                             <span>{complaint.studentEmail}</span>
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium"><b>Department:</b></span> {complaint.department}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium"><b>Category:</b></span> {complaint.category}
//                           </p>
//                         </div>
//                       </div>

//                       <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>

//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4 text-sm text-gray-500">
//                           <span className="flex items-center space-x-1">
//                             <Calendar className="h-4 w-4" />
//                             <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
//                           </span>
//                           {complaint.updatedAt !== complaint.createdAt && (
//                             <span className="flex items-center space-x-1">
//                               <Clock className="h-4 w-4" />
//                               <span>Updated: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
//                             </span>
//                           )}
//                         </div>

//                         <button
//                           onClick={() => setSelectedComplaint(complaint)}
//                           className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
//                         >
//                           <MoreHorizontal className="h-4 w-4" />
//                           <span>Manage</span>
//                         </button>
//                       </div>

//                       {complaint.adminResponse && (
//                         <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                           <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
//                           <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         ) : activeTab === 'students' ? (
//           /* Students List */
//           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Students ({filteredStudents.length})
//               </h2>
//             </div>

//             {filteredStudents.length === 0 ? (
//               <div className="p-12 text-center">
//                 <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500 text-lg">No students found</p>
//                 <p className="text-gray-400">Try adjusting your filters or search terms</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredStudents.map((student) => (
//                       <tr key={student.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.password}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ) : (
//           /* Departments Management */
//           <DepartmentManagement />
//         )}

//         {/* Complaint Management Modal */}
//         {selectedComplaint && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
//               <div className="p-6 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-900">Manage Complaint</h2>
//                 <p className="text-gray-600">ID: {selectedComplaint.id}</p>
//                 <div className="flex items-center space-x-2 mt-2">
//                   <Mail className="h-4 w-4 text-gray-500" />
//                   <span className="text-sm text-gray-600">Student will be notified via email: {selectedComplaint.studentEmail}</span>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <div className="mb-6">
//                   <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
//                   <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)}`}>
//                     {selectedComplaint.status}
//                   </span>
//                 </div>

//                 <div className="mb-6">
//                   <h3 className="font-semibold text-gray-900 mb-2">Complaint Details</h3>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <p className="text-sm text-gray-700">{selectedComplaint.description}</p>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Admin Response
//                   </label>
//                   <textarea
//                     value={adminResponse}
//                     onChange={(e) => setAdminResponse(e.target.value)}
//                     rows={4}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Add a response to the student (this will be included in the email notification)..."
//                   />
//                 </div>

//                 <div className="bg-blue-50 p-4 rounded-lg mb-6">
//                   <div className="flex items-center space-x-2 mb-2">
//                     <Send className="h-4 w-4 text-blue-600" />
//                     <span className="text-sm font-medium text-blue-800">Email Notification</span>
//                   </div>
//                   <p className="text-sm text-blue-700">
//                     Updating the status will automatically send an email notification to the student with the new status and your response.
//                   </p>
//                 </div>

//                 <div className="flex space-x-3">
//                   {selectedComplaint.status !== 'In Progress' && (
//                     <button
//                       onClick={() => handleStatusUpdate(selectedComplaint, 'In Progress')}
//                       disabled={isEmailSending}
//                       className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Mark In Progress
//                     </button>
//                   )}
//                   {selectedComplaint.status !== 'Resolved' && (
//                     <button
//                       onClick={() => handleStatusUpdate(selectedComplaint, 'Resolved')}
//                       disabled={isEmailSending}
//                       className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Mark Resolved
//                     </button>
//                   )}
//                   <button
//                     onClick={() => {
//                       setSelectedComplaint(null);
//                       setAdminResponse('');
//                     }}
//                     className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-150"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Student Registration Modal */}
//         {showRegisterModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//               <div className="p-6 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-900">Register New Student</h2>
//                 <p className="text-gray-600">Students will be assigned department-specific IDs</p>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                     <input
//                       type="text"
//                       value={newStudent.name}
//                       onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter student's full name"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                     <input
//                       type="email"
//                       value={newStudent.email}
//                       onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter student's email"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//                     <select
//                       value={newStudent.department}
//                       onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Department</option>
//                       {uniqueDepartments.map(dept => (
//                         <option key={dept} value={dept}>{dept}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                     <input
//                       type="password"
//                       value={newStudent.password}
//                       onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter password"
//                     />
//                   </div>
//                 </div>

//                 {registrationSuccess && (
//                   <div className={`mt-4 p-3 rounded-lg ${registrationSuccess.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
//                     {registrationSuccess}
//                   </div>
//                 )}

//                 <div className="mt-6 flex space-x-3">
//                   <button
//                     onClick={handleRegisterStudent}
//                     className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150"
//                   >
//                     Register Student
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowRegisterModal(false);
//                       setRegistrationSuccess('');
//                       setNewStudent({
//                         name: '',
//                         email: '',
//                         department: '',
//                         password: ''
//                       });
//                     }}
//                     className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-150"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Mail,
  Send,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "../hooks/useComplaints";
import { useAuth } from "../hooks/useAuth";
import { Complaint, ComplaintStats } from "../types/complaint";
import DepartmentManagement from "./DepartmentManagement";

const AdminDashboard: React.FC = () => {
  const { complaints, updateComplaintStatus, isEmailSending, loadComplaints } =
    useComplaints();
  const { authState, logout, getStudents, registerStudent } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>(
    authState.currentAdmin?.isMainAdmin
      ? "all"
      : authState.currentAdmin?.department || "all"
  );
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [adminResponse, setAdminResponse] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    department: authState.currentAdmin?.department || "",
    password: "",
  });
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<
    "complaints" | "students" | "departments"
  >("complaints");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated or not an admin
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.isAdmin) {
      navigate("/");
    }
  }, [authState, navigate]);

  // Load complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        await loadComplaints();
      } catch (error) {
        console.error("Failed to load complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [loadComplaints]);

  const stats: ComplaintStats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    };
  }, [complaints]);

  const studentStats = useMemo(() => {
    const students = getStudents();
    const departmentCounts: Record<string, number> = {};

    students.forEach((student) => {
      if (
        authState.currentAdmin &&
        !authState.currentAdmin.isMainAdmin &&
        student.department !== authState.currentAdmin.department
      ) {
        return;
      }

      departmentCounts[student.department] =
        (departmentCounts[student.department] || 0) + 1;
    });

    return {
      total: students.filter(
        (s) =>
          authState.currentAdmin?.isMainAdmin ||
          s.department === authState.currentAdmin?.department
      ).length,
      byDepartment: departmentCounts,
    };
  }, [getStudents, authState.currentAdmin]);

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((complaint) => {
        const matchesSearch =
          complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          complaint.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || complaint.status === statusFilter;
        const matchesDepartment =
          departmentFilter === "all" ||
          complaint.department === departmentFilter;
        const adminDepartmentFilter =
          authState.currentAdmin && !authState.currentAdmin.isMainAdmin
            ? complaint.department === authState.currentAdmin.department
            : true;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDepartment &&
          adminDepartmentFilter
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [
    complaints,
    searchTerm,
    statusFilter,
    departmentFilter,
    authState.currentAdmin,
  ]);

  const filteredStudents = useMemo(() => {
    const students = getStudents();
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" || student.department === departmentFilter;
      const adminDepartmentFilter =
        authState.currentAdmin && !authState.currentAdmin.isMainAdmin
          ? student.department === authState.currentAdmin.department
          : true;

      return matchesSearch && matchesDepartment && adminDepartmentFilter;
    });
  }, [getStudents, searchTerm, departmentFilter, authState.currentAdmin]);

  const uniqueDepartments = useMemo(() => {
    return [
      "Computer Science & Engineering",
      "Electronics & Communication",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Information Technology",
      "Chemical Engineering",
    ];
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleStatusUpdate = async (
    complaint: Complaint,
    newStatus: Complaint["status"]
  ) => {
    setIsLoading(true);
    try {
      await updateComplaintStatus(complaint.id, newStatus, adminResponse);
      await loadComplaints();
      setSelectedComplaint(null);
      setAdminResponse("");
    } catch (error) {
      console.error("Failed to update complaint status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStudent = () => {
    if (
      !newStudent.name ||
      !newStudent.email ||
      !newStudent.department ||
      !newStudent.password
    ) {
      setRegistrationSuccess("Please fill all fields");
      return;
    }

    if (!authState.currentAdmin?.isMainAdmin) {
      setRegistrationSuccess("Only main admin can register students");
      return;
    }

    try {
      const registeredStudent = registerStudent(newStudent);
      setRegistrationSuccess(
        `Student registered successfully with ID: ${registeredStudent.id}`
      );
      setNewStudent({
        name: "",
        email: "",
        department: authState.currentAdmin?.department || "",
        password: "",
      });
      setTimeout(() => setRegistrationSuccess(""), 3000);
    } catch (error) {
      setRegistrationSuccess("Failed to register student");
      setTimeout(() => setRegistrationSuccess(""), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!authState.currentAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <p className="text-red-600">
          Error: Admin data not found. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {authState.currentAdmin.isMainAdmin
                ? "Main Admin Dashboard"
                : `${authState.currentAdmin.department} Admin Dashboard`}
            </h1>
            <p className="text-gray-600">
              {authState.currentAdmin.isMainAdmin
                ? "Manage and track all student complaints with automated email notifications"
                : `Manage ${authState.currentAdmin.department} department complaints`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {authState.currentAdmin.isMainAdmin && (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <Users className="h-4 w-4" />
                <span>Register Student</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Email Status Indicator */}
        {isEmailSending && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Sending email notification to student...
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {activeTab === "complaints" ? (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Complaints
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.inProgress}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Resolved
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.resolved}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {studentStats.total}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {Object.entries(studentStats.byDepartment)
                .slice(0, 3)
                .map(([dept, count]) => (
                  <div
                    key={dept}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {dept.split(" ")[0]}
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {count}
                        </p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8 border border-gray-100">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === "complaints"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Complaints
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === "students"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === "departments"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Departments
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "complaints"
                    ? "Search complaints..."
                    : "Search students..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {activeTab === "complaints" && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                disabled={!authState.currentAdmin?.isMainAdmin}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:opacity-50"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === "complaints" ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Complaints ({filteredComplaints.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading complaints...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No complaints found</p>
                <p className="text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {complaint.subject}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority} Priority
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Student:</span>{" "}
                              {complaint.studentName} ({complaint.studentId})
                            </p>
                            <p className="text-sm text-gray-600 flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="font-medium">Email:</span>{" "}
                              {complaint.studentEmail}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Department:</span>{" "}
                              {complaint.department}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Category:</span>{" "}
                              {complaint.category}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {complaint.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Created:{" "}
                                {new Date(
                                  complaint.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </span>
                            {complaint.updatedAt !== complaint.createdAt && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Updated:{" "}
                                  {new Date(
                                    complaint.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span>Manage</span>
                          </button>
                        </div>

                        {complaint.adminResponse && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Admin Response:
                            </p>
                            <p className="text-sm text-blue-800">
                              {complaint.adminResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "students" ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Students ({filteredStudents.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students found</p>
                <p className="text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.password}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <DepartmentManagement />
        )}

        {/* Complaint Management Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage Complaint
                </h2>
                <p className="text-gray-600">ID: {selectedComplaint.id}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Student will be notified via email:{" "}
                    {selectedComplaint.studentEmail}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Current Status
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedComplaint.status
                    )}`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Complaint Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {selectedComplaint.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Response
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a response to the student (this will be included in the email notification)..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Email Notification
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Updating the status will automatically send an email
                    notification to the student with the new status and your
                    response.
                  </p>
                </div>

                <div className="flex space-x-3">
                  {selectedComplaint.status !== "In Progress" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedComplaint, "In Progress")
                      }
                      disabled={isLoading || isEmailSending}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Updating..." : "Mark In Progress"}
                    </button>
                  )}
                  {selectedComplaint.status !== "Resolved" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedComplaint, "Resolved")
                      }
                      disabled={isLoading || isEmailSending}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Updating..." : "Mark Resolved"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedComplaint(null);
                      setAdminResponse("");
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Registration Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Register New Student
                </h2>
                <p className="text-gray-600">
                  Students will be assigned department-specific IDs
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student's email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={newStudent.department}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newStudent.password}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                {registrationSuccess && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      registrationSuccess.includes("successfully")
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {registrationSuccess}
                  </div>
                )}

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleRegisterStudent}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                  >
                    Register Student
                  </button>
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setRegistrationSuccess("");
                      setNewStudent({
                        name: "",
                        email: "",
                        department: authState.currentAdmin?.department || "",
                        password: "",
                      });
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
