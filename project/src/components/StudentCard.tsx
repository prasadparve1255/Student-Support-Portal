import React, { useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useDepartments } from "../hooks/useDepartments";
import { useClasses } from "../hooks/useClasses";

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: { _id: string; name: string; code: string } | string | null;
  class?: { _id: string; name: string } | string | null;
}

interface StudentCardProps {
  student: Student;
  onEdit?: () => void;
  onDelete?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const deptId =
    student.department && typeof student.department === "object"
      ? student.department._id
      : undefined;

  const currentClassId =
    student.class && typeof student.class === "object"
      ? (student.class as { _id: string; name: string })._id
      : "";

  const [editFormData, setEditFormData] = useState({
    name: student.name,
    email: student.email,
    studentId: student.studentId,
    department: deptId || (student.department as string) || "",
    classId: currentClassId,
    password: "",
  });

  const { updateStudent, deleteStudent, resetStudentPassword } = useStudents();
  const { departments } = useDepartments();
  const { classes } = useClasses(editFormData.department);

  // Display helpers
  const deptName =
    student.department && typeof student.department === "object"
      ? student.department.name
      : student.department || "Not Assigned";

  const className =
    student.class
      ? typeof student.class === "object"
        ? (student.class as { name: string }).name
        : student.class
      : null;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateStudent(student._id, {
        name: editFormData.name,
        email: editFormData.email,
        class: editFormData.classId || null,
      } as any);
      if (editFormData.password) {
        await resetStudentPassword(student._id, editFormData.password);
      }
      setShowEditModal(false);
      if (onEdit) onEdit();
    } catch (error) {
      console.error("Error updating student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteStudent(student._id);
      setShowDeleteModal(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {student.studentId}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          {student.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {student.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {deptName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {className ? (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {className}
            </span>
          ) : (
            <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs border border-amber-200">
              No Class
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded"
              title="Edit Student"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 hover:text-red-800 p-1 rounded"
              title="Delete Student"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Edit Modal */}
      {showEditModal && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleEdit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={editFormData.department}
                      onChange={e => setEditFormData({ ...editFormData, department: e.target.value, classId: "" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Class dropdown — dynamic based on selected department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    {classes.length > 0 ? (
                      <select
                        value={editFormData.classId}
                        onChange={e => setEditFormData({ ...editFormData, classId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select Class --</option>
                        {classes.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        ⚠ या department साठी अजून class तयार केलेली नाही.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-gray-400 font-normal">(रिकामे ठेवल्यास बदलणार नाही)</span>
                    </label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? "Updating..." : "Update Student"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Student</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default StudentCard;
