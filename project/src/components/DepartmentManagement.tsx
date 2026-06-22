import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Building2, UserCog, Eye, EyeOff } from "lucide-react";
import { useDepartments } from "../hooks/useDepartments";
import Pagination from "./Pagination";

const PER_PAGE = 6;

interface Department {
  _id?: string;
  name: string;
  code: string;
  description: string;
}

const DEPT_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
  "from-indigo-500 to-indigo-600",
  "from-red-500 to-red-600",
];

const DepartmentManagement: React.FC = () => {
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<(Department & { _id: string }) | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "", code: "", description: "",
    adminName: "", username: "", email: "", password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, formData);
        setMessage({ type: "success", text: "Department updated successfully!" });
      } else {
        await createDepartment(formData);
        setMessage({ type: "success", text: "Department & Admin created successfully!" });
        setPage(1);
      }
      resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch {
      setMessage({ type: "error", text: `Error ${editingDepartment ? "updating" : "creating"} department` });
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
        setMessage({ type: "success", text: "Department deleted successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch {
        setMessage({ type: "error", text: "Error deleting department" });
      }
    }
  };

  const handleEdit = (department: Department) => {
    if (!department._id) return;
    setEditingDepartment({ ...department, _id: department._id });
    setFormData({ name: department.name, code: department.code, description: department.description, adminName: "", username: "", email: "", password: "" });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "", adminName: "", username: "", email: "", password: "" });
    setEditingDepartment(null);
    setShowModal(false);
    setShowPassword(false);
  };

  const pagedDepts = departments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage departments and their administrators</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add Department</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`flex items-center justify-between p-4 mb-6 rounded-xl border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: "", text: "" })}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 mb-6 flex items-center space-x-3">
        <Building2 className="h-5 w-5 text-blue-600" />
        <span className="text-blue-800 font-medium">Total Departments: <span className="text-blue-600 font-bold">{departments.length}</span></span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow border border-gray-100 h-44 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : departments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Building2 className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No departments yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Department" to create your first one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedDepts.map((dept, idx) => (
            <div key={dept._id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Card top color bar */}
              <div className={`h-2 bg-gradient-to-r ${DEPT_COLORS[idx % DEPT_COLORS.length]}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${DEPT_COLORS[idx % DEPT_COLORS.length]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {dept.code?.slice(0, 2)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{dept.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-mono">{dept.code}</span>
                {dept.description && (
                  <p className="text-gray-500 text-sm mt-3 line-clamp-2">{dept.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalItems={departments.length} perPage={PER_PAGE} onPageChange={setPage} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingDepartment ? "Edit Department" : "Add New Department"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {editingDepartment ? "Update department details" : "Fill in department & admin details"}
                  </p>
                </div>
              </div>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Section 1: Department Info */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Department Info</span>
                </div>
                <div className="space-y-4 bg-blue-50 rounded-xl p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const code = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || "").join("");
                        setFormData({ ...formData, name, code });
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g. Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      placeholder="e.g. CS"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      placeholder="Short description about this department"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Admin Info — only on create */}
              {!editingDepartment && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <UserCog className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Department Admin Account</span>
                  </div>
                  <div className="space-y-4 bg-purple-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="e.g. Prof. Sharma"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="e.g. csadmin"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="admin@college.edu"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Min 6 characters"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-purple-500 bg-purple-100 rounded-lg px-3 py-2">
                      💡 Admin will receive a welcome email with login credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-md"
                >
                  {editingDepartment ? "Update Department" : "Create Department & Admin"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
