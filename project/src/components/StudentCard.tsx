import React, { useMemo, useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { useDepartments } from "../hooks/useDepartments";
import { useStudents } from "../hooks/useStudents";

type DepartmentRef = { _id: string; name: string; code: string };
type ClassRef = { _id: string; name: string };

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: DepartmentRef | string | null;
  class?: ClassRef | string | null;
}

interface StudentCardProps {
  student: Student;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface EditFormData {
  name: string;
  email: string;
  department: string;
  classId: string;
  password: string;
}

const tableCellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500";
const secondaryButtonClass =
  "flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300";

const getDepartmentId = (department: Student["department"]) =>
  department && typeof department === "object" ? department._id : department || "";

const getDepartmentName = (department: Student["department"]) =>
  department && typeof department === "object"
    ? department.name
    : department || "Not Assigned";

const getClassId = (studentClass: Student["class"]) =>
  studentClass && typeof studentClass === "object" ? studentClass._id : "";

const getClassName = (studentClass: Student["class"]) =>
  studentClass
    ? typeof studentClass === "object"
      ? studentClass.name
      : studentClass
    : null;

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete }) => {
  const { updateStudent, deleteStudent, resetStudentPassword } = useStudents();
  const { departments } = useDepartments();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>(() => ({
    name: student.name,
    email: student.email,
    department: getDepartmentId(student.department),
    classId: getClassId(student.class),
    password: "",
  }));

  const { classes } = useClasses(editFormData.department);

  const departmentName = useMemo(
    () => getDepartmentName(student.department),
    [student.department],
  );

  const className = useMemo(() => getClassName(student.class), [student.class]);

  const updateFormField = <K extends keyof EditFormData>(
    field: K,
    value: EditFormData[K],
  ) => {
    setEditFormData(current => ({ ...current, [field]: value }));
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await updateStudent(student._id, {
        name: editFormData.name,
        email: editFormData.email,
        class: editFormData.classId || null,
      });

      if (editFormData.password.trim()) {
        await resetStudentPassword(student._id, editFormData.password);
      }

      setShowEditModal(false);
      onEdit?.();
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
      onDelete?.();
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <tr className="transition-colors hover:bg-[#B3CFE5]">
        <td className={`${tableCellClass} font-medium`}>{student.studentId}</td>
        <td className={`${tableCellClass} font-medium`}>{student.name}</td>
        <td className={tableCellClass}>{student.email}</td>
        <td className={tableCellClass}>{departmentName}</td>
        <td className={tableCellClass}>
          {className ? (
            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
              {className}
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-600">
              No Class
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="rounded p-1 text-blue-600 transition-colors hover:text-blue-800"
              title="Edit Student"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="rounded p-1 text-red-600 transition-colors hover:text-red-800"
              title="Delete Student"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {showEditModal && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 transition-colors hover:text-gray-500"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleEdit} className="space-y-4 p-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={event => updateFormField("name", event.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={event => updateFormField("email", event.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <select
                      value={editFormData.department}
                      onChange={event =>
                        setEditFormData(current => ({
                          ...current,
                          department: event.target.value,
                          classId: "",
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select Department</option>
                      {departments.map(department => (
                        <option key={department._id} value={department._id}>
                          {department.name} ({department.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    {classes.length > 0 ? (
                      <select
                        value={editFormData.classId}
                        onChange={event => updateFormField("classId", event.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select Class</option>
                        {classes.map(classItem => (
                          <option key={classItem._id} value={classItem._id}>
                            {classItem.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                        No classes have been created for this department yet.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      New Password{" "}
                      <span className="font-normal text-gray-400">
                        (leave blank to keep current password)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={event => updateFormField("password", event.target.value)}
                      className={inputClass}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Updating..." : "Update Student"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className={secondaryButtonClass}
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

      {showDeleteModal && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Delete Student
                </h3>
                <p className="mb-6 text-gray-600">
                  Are you sure you want to delete <strong>{student.name}</strong>? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className={secondaryButtonClass}
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
