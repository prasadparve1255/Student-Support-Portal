import React, { useState, useMemo } from "react";
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
  Download,
  LogOut,
  GraduationCap,
  UserCircle,
  Paperclip,
  FileText as FileIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "../hooks/useComplaints";
import { useAuthContext as useAuth } from "../context/AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useDepartments } from "../hooks/useDepartments";
import { useClasses } from "../hooks/useClasses";
import { Complaint, ComplaintStats } from "../types/complaint";
import DepartmentManagement from "./DepartmentManagement";
import StudentCard from "./StudentCard";
import ReportsModule from "./ReportsModule";
import ClassManagement from "./ClassManagement";
import StudentRegistration from "./StudentRegistration";
import Pagination from "./Pagination";

const PER_PAGE = 10;

const AdminDashboard: React.FC = () => {
  const { complaints, updateComplaintStatus, isEmailSending } = useComplaints();
  const { authState, logout } = useAuth();
  const { students, refreshStudents } = useStudents();
  const { departments } = useDepartments();
  const adminDeptId = departments.find(d => d.name === authState.currentAdmin?.department)?._id;
  const { classes } = useClasses(adminDeptId);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "complaints" | "students" | "departments" | "reports" | "classes"
  >("complaints");
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);

  const stats: ComplaintStats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      today: complaints.filter((c) => new Date(c.createdAt).toDateString() === today).length,
    };
  }, [complaints]);

  const studentStats = useMemo(() => {
    const departmentCounts: Record<string, number> = {};
    const classCounts: Record<string, number> = {};

    students.forEach((student) => {
      const deptName =
        typeof student.department === "object"
          ? (student.department as { name: string } | null)?.name || ""
          : student.department || "";
      if (!deptName) return;
      if (
        authState.currentAdmin &&
        !authState.currentAdmin.isMainAdmin &&
        deptName !== authState.currentAdmin.department
      ) {
        return;
      }
      if (!departmentCounts[deptName]) departmentCounts[deptName] = 0;
      departmentCounts[deptName]++;

      const className =
        typeof (student as any).class === "object"
          ? (student as any).class?.name || ""
          : (student as any).class || "";
      if (className) {
        if (!classCounts[className]) classCounts[className] = 0;
        classCounts[className]++;
      }
    });

    return {
      total: students.filter((s) => {
        const deptName =
          typeof s.department === "object"
            ? (s.department as { name: string } | null)?.name || ""
            : s.department || "";
        return (
          authState.currentAdmin?.isMainAdmin ||
          deptName === authState.currentAdmin?.department
        );
      }).length,
      byDepartment: departmentCounts,
      byClass: classCounts,
    };
  }, [students, authState.currentAdmin]);

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
        const complaintDate = new Date(complaint.createdAt);
        const localDate = `${complaintDate.getFullYear()}-${String(complaintDate.getMonth() + 1).padStart(2, '0')}-${String(complaintDate.getDate()).padStart(2, '0')}`;
        const matchesDate = !dateFilter || localDate === dateFilter;
        const matchesClass =
          classFilter === "all" || (complaint as any).class === classFilter;

        // Department admin can only see complaints from their department
        const adminDepartmentFilter =
          authState.currentAdmin && !authState.currentAdmin.isMainAdmin
            ? complaint.department === authState.currentAdmin.department
            : true;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDepartment &&
          matchesDate &&
          matchesClass &&
          adminDepartmentFilter
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [
    complaints,
    searchTerm,
    statusFilter,
    departmentFilter,
    classFilter,
    dateFilter,
    authState.currentAdmin,
  ]);

  React.useEffect(() => { setComplaintsPage(1); }, [searchTerm, statusFilter, departmentFilter, classFilter, dateFilter]);
  React.useEffect(() => { setStudentsPage(1); }, [searchTerm, departmentFilter, classFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const deptName =
        typeof student.department === "object"
          ? (student.department as { name: string } | null)?.name || ""
          : student.department || "";
      const matchesDepartment =
        departmentFilter === "all" ||
        deptName?.toLowerCase() === departmentFilter.toLowerCase();
      const studentClass =
        typeof (student as any).class === "object"
          ? (student as any).class?.name || ""
          : (student as any).class || "";
      const matchesClass =
        classFilter === "all" || studentClass === classFilter;

      const adminDepartmentFilter =
        authState.currentAdmin && !authState.currentAdmin.isMainAdmin
          ? deptName?.toLowerCase() ===
            authState.currentAdmin.department?.toLowerCase()
          : true;

      return matchesSearch && matchesDepartment && matchesClass && adminDepartmentFilter;
    });
  }, [students, searchTerm, departmentFilter, classFilter, authState.currentAdmin]);

  const uniqueDepartments = useMemo(() => {
    return departments.map((d) => d.name);
  }, [departments]);

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

  const handleStatusUpdate = async (
    complaint: Complaint,
    newStatus: Complaint["status"],
  ) => {
    await updateComplaintStatus(complaint.id, newStatus, adminResponse);
    setSelectedComplaint(null);
    setAdminResponse("");
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/backup/download', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Backup failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = res.headers.get('Content-Disposition') || '';
      const filename = disposition.match(/filename="(.+)"$/)?.[1] || `backup-${new Date().toISOString().slice(0,10)}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Backup failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <img src="/logo.svg" alt="logo" className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {authState.currentAdmin?.isMainAdmin
                    ? "Main Admin Dashboard"
                    : `${authState.currentAdmin?.department} Admin Dashboard`}
                </h1>
                <p className="text-xs text-purple-600 font-semibold">Student Support Portal</p>
              </div>
            </div>
            <p className="text-gray-600">
              {authState.currentAdmin?.isMainAdmin
                ? "Manage and track all student complaints with automated email notifications"
                : `Manage ${authState.currentAdmin?.department} department complaints`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {authState.currentAdmin && !authState.currentAdmin.isMainAdmin && (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <Users className="h-4 w-4" />
                <span>Register Student</span>
              </button>
            )}
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isBackingUp ? 'Backing up...' : 'Backup'}</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <UserCircle className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Today
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.today}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </>
          ) : activeTab === "students" ? (
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

              {Object.entries(studentStats.byClass)
                .slice(0, 4)
                .map(([cls, count]) => (
                  <div
                    key={cls}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 truncate max-w-[100px]">
                          {cls}
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
          ) : activeTab === "classes" ? (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Classes</p>
                    <p className="text-2xl font-bold text-purple-600">{classes.length}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              {classes.slice(0, 4).map((c) => (
                <div key={c._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 truncate max-w-[100px]">{c.name}</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {students.filter(s => {
                          const sc = typeof (s as any).class === 'object' ? (s as any).class?.name : (s as any).class;
                          return sc === c.name;
                        }).length}
                      </p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "reports" ? (
            <></>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Departments</p>
                    <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
              </div>
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
            {authState.currentAdmin?.isMainAdmin && (
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
            )}
            {!authState.currentAdmin?.isMainAdmin && (
              <button
                onClick={() => setActiveTab("classes")}
                className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                  activeTab === "classes"
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Classes
              </button>
            )}
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === "reports"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {authState.currentAdmin?.isMainAdmin ? (
                  <>
                    <option value="all">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value={authState.currentAdmin?.department}>
                    {authState.currentAdmin?.department}
                  </option>
                )}
              </select>
            </div>



            {activeTab === "complaints" && (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === "complaints" ? (
          /* Complaints List */
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Complaints ({filteredComplaints.length})
              </h2>
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No complaints found</p>
                <p className="text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
              <div className="divide-y divide-gray-200">
                {filteredComplaints.slice((complaintsPage - 1) * PER_PAGE, complaintsPage * PER_PAGE).map((complaint) => (
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
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}
                          >
                            {complaint.status}
                          </span>
                          {/* <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority} Priority
                        </span> */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Student ID:</span> (
                              {complaint.studentId})
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Category:</span>{" "}
                              {complaint.category}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Department:</span>{" "}
                              {complaint.department}
                            </p>
                            {(complaint as any).class && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Class:</span>{" "}
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  {(complaint as any).class}
                                </span>
                              </p>
                            )}
                            {/* <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span className="font-medium">Email:</span> 
                            <span>{complaint.studentEmail}</span>
                          </p> */}
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
                                  complaint.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </span>
                            {complaint.updatedAt !== complaint.createdAt && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Updated:{" "}
                                  {new Date(
                                    complaint.updatedAt,
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
              <Pagination
                currentPage={complaintsPage}
                totalItems={filteredComplaints.length}
                perPage={PER_PAGE}
                onPageChange={setComplaintsPage}
              />
              </>
            )}
          </div>
        ) : activeTab === "students" ? (
          /* Students List */
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Students ({filteredStudents.length})
              </h2>
            </div>

            {filteredStudents.length === 0 ? (
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
                        Student ID
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
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.slice((studentsPage - 1) * PER_PAGE, studentsPage * PER_PAGE).map((student) => (
                      <StudentCard
                        key={student._id}
                        student={student}
                        onEdit={refreshStudents}
                        onDelete={refreshStudents}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              currentPage={studentsPage}
              totalItems={filteredStudents.length}
              perPage={PER_PAGE}
              onPageChange={setStudentsPage}
            />
          </div>
        ) : activeTab === "reports" ? (
          <ReportsModule />
        ) : activeTab === "classes" ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <ClassManagement />
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
                {/* Student Info */}
                <div className="mb-4 grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div><span className="font-medium text-gray-500">Student:</span> <span className="text-gray-900">{selectedComplaint.studentName} ({selectedComplaint.studentId})</span></div>
                  <div><span className="font-medium text-gray-500">Email:</span> <span className="text-gray-900">{selectedComplaint.studentEmail}</span></div>
                  <div><span className="font-medium text-gray-500">Department:</span> <span className="text-gray-900">{selectedComplaint.department}</span></div>
                  <div><span className="font-medium text-gray-500">Category:</span> <span className="text-gray-900">{selectedComplaint.category}</span></div>
                  {(selectedComplaint as any).class && (
                    <div><span className="font-medium text-gray-500">Class:</span> <span className="text-gray-900">{(selectedComplaint as any).class}</span></div>
                  )}
                  <div><span className="font-medium text-gray-500">Submitted:</span> <span className="text-gray-900">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span></div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Complaint Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedComplaint.description}</p>
                  </div>
                </div>

                {/* Attachments */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Paperclip className="h-4 w-4" />
                      <span>Attachments ({selectedComplaint.attachments.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedComplaint.attachments.map((url, i) => {
                        const isPdf = url.toLowerCase().endsWith('.pdf');
                        return isPdf ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                            <FileIcon className="h-5 w-5 text-red-500 shrink-0" />
                            <span className="text-xs text-red-700 truncate">{url.split('/').pop()}</span>
                          </a>
                        ) : (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`attachment-${i + 1}`}
                              className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                              onError={(e) => {
                                const el = e.target as HTMLImageElement;
                                el.parentElement!.innerHTML = '<div class="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs border">Image not found</div>';
                              }}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                      disabled={isEmailSending}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {selectedComplaint.status !== "Resolved" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedComplaint, "Resolved")
                      }
                      disabled={isEmailSending}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark Resolved
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
          <StudentRegistration
            onClose={() => setShowRegisterModal(false)}
            onSuccess={refreshStudents}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
