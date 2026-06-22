import React, { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useDepartments } from "../hooks/useDepartments";
import Pagination from "./Pagination";

const PER_PAGE = 10;

interface Department {
  _id?: string;
  name: string;
  code: string;
  description: string;
}

const DepartmentManagement: React.FC = () => {
  const {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<(Department & { _id: string }) | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",

    adminName: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, formData);
        setMessage({ type: "success", text: "Department updated successfully" });
      } else {
        await createDepartment(formData);
        setMessage({ type: "success", text: "Department created successfully" });
        setPage(1);
      }
      resetForm();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error ${editingDepartment ? "updating" : "creating"} department`,
      });
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
        setMessage({
          type: "success",
          text: "Department deleted successfully",
        });
      } catch (error) {
        setMessage({ type: "error", text: "Error deleting department" });
      }
    }
  };

  const handleEdit = (department: Department) => {
    if (!department._id) return;
    setEditingDepartment({ ...department, _id: department._id });

    setFormData({
      name: department.name,
      code: department.code,
      description: department.description,

      adminName: "",
      username: "",
      email: "",
      password: "",
    });

    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",

      adminName: "",
      username: "",
      email: "",
      password: "",
    });

    setEditingDepartment(null);
    setShowModal(false);
  };

  const pagedDepts = departments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Department Management
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Loading departments...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-red-500"
                >
                  {error}
                </td>
              </tr>
            ) : Array.isArray(departments) && departments.length > 0 ? (
              pagedDepts.map((department) => (
                <tr key={department._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {department.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {department.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {department.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(department)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(department._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalItems={departments.length} onPageChange={p => setPage(p)} />

      {/* Department Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDepartment ? "Edit Department" : "Add Department"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const code = name
                        .trim()
                        .split(/\s+/)
                        .map((w) => w[0]?.toUpperCase() || "")
                        .join("");
                      setFormData({ ...formData, name, code });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <hr className="my-4" />

              <h4 className="text-lg font-semibold text-gray-900">
                Department Admin Details
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name
                </label>

                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adminName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required={!editingDepartment}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>

                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required={!editingDepartment}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required={!editingDepartment}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required={!editingDepartment}
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  {editingDepartment ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
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
