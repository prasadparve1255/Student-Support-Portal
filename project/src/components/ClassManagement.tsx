import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, GraduationCap, Users } from 'lucide-react';
import { useClasses } from '../hooks/useClasses';
import { useStudents } from '../hooks/useStudents';
import { useDepartments } from '../hooks/useDepartments';
import { useAuthContext as useAuth } from '../context/AuthContext';
import Pagination from './Pagination';

const PER_PAGE = 10;

const ClassManagement: React.FC = () => {
  const { authState } = useAuth();
  const { departments } = useDepartments();
  const isMainAdmin = authState.currentAdmin?.isMainAdmin;

  // Main Admin: selected dept for viewing/creating classes
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  const deptIdForFetch = isMainAdmin ? (selectedDeptId || undefined) : undefined;
  const { classes, loading, error, createClass, updateClass, deleteClass } = useClasses(deptIdForFetch);
  const { students } = useStudents();

  const getStudentCount = (className: string) =>
    students.filter(s => {
      const sc = typeof (s as any).class === 'object' ? (s as any).class?.name : (s as any).class;
      return sc === className;
    }).length;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ _id: string; name: string; description?: string } | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const showMsg = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (c: { _id: string; name: string; description?: string }) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (isMainAdmin && !editing && !selectedDeptId) {
      showMsg('error', 'Please select a department first');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateClass(editing._id, form);
        showMsg('success', 'Class updated successfully');
      } else {
        // Pass departmentId for Main Admin
        const payload: any = { ...form };
        if (isMainAdmin) payload.departmentId = selectedDeptId;
        await createClass(payload);
        showMsg('success', 'Class created successfully');
        setPage(1);
      }
      setShowModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error saving class';
      showMsg('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete class "${name}"?`)) return;
    try {
      await deleteClass(id);
      showMsg('success', 'Class deleted successfully');
    } catch {
      showMsg('error', 'Error deleting class');
    }
  };

  const pagedClasses = classes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <span>Class Management</span>
          {!loading && (
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {classes.length}
            </span>
          )}
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center font-medium space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Main Admin — department selector */}
      {isMainAdmin && (
        <div className="mb-4 font-medium">
          <select
            value={selectedDeptId}
            onChange={e => { setSelectedDeptId(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      {message.text && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SR.No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Students</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">No classes yet. Add your first class.</p>
                </td>
              </tr>
            ) : pagedClasses.map((c, i) => (
              <tr key={c._id} className="hover:bg-[#B3CFE5]">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.description || '—'}</td>
                <td className="px-6 py-4 font-medium text-center">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    <Users className="h-3.5 w-3.5" />
                    <span>{getStudentCount(c.name)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(c._id, c.name)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalItems={classes.length} onPageChange={p => setPage(p)} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Main Admin — show selected dept info */}
              {isMainAdmin && !editing && (
                <div className="p-3 bg-purple-50 rounded-lg text-sm text-purple-700">
                  <span className="font-medium">Department: </span>
                  {selectedDeptId
                    ? departments.find(d => d._id === selectedDeptId)?.name || selectedDeptId
                    : <span className="text-red-500">No department selected — go back and select one</span>
                  }
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g. FY BSc CS, SY BCA, MSc Part I"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Short description"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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

export default ClassManagement;
