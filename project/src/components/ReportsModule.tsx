import React, { useState, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, Search, X, Printer } from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';
import { useAuthContext as useAuth } from '../context/AuthContext';
import { useDepartments } from '../hooks/useDepartments';
import { useClasses } from '../hooks/useClasses';
import { Complaint } from '../types/complaint';
import Pagination from './Pagination';

const PER_PAGE = 10;

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-700',
};

const ReportsModule: React.FC = () => {
  const { complaints } = useComplaints();
  const { authState } = useAuth();
  const { departments } = useDepartments();

  // Filters state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch classes only for selected department
  const selectedDept = departments.find(d => d.name === deptFilter);
  const { classes } = useClasses(selectedDept?._id);

  // Reset class filter when department changes
  const handleDeptChange = (val: string) => {
    setDeptFilter(val);
    setClassFilter('all');
    setPage(1);
  };

  // filter बदलल्यावर page reset
  const resetPage = () => setPage(1);

  // Department Admin: only their own department visible
  const isMainAdmin = authState.currentAdmin?.isMainAdmin;
  const adminDept = authState.currentAdmin?.department;

  const filteredData = useMemo(() => {
    return complaints.filter(c => {
      // Department Admin restriction
      if (!isMainAdmin && adminDept && c.department !== adminDept) return false;

      // Date range
      if (fromDate && new Date(c.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(c.createdAt) > new Date(toDate + 'T23:59:59')) return false;

      // Department
      if (deptFilter !== 'all' && c.department !== deptFilter) return false;

      // Class
      if (classFilter !== 'all' && (c as any).class !== classFilter) return false;

      // Status
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Student search — name, ID, email
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matchName = c.studentName.toLowerCase().includes(q);
        const matchId = c.studentId.toLowerCase().includes(q);
        const matchEmail = (c.studentEmail || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchEmail) return false;
      }

      return true;
    });
  }, [complaints, fromDate, toDate, deptFilter, classFilter, statusFilter, studentSearch, isMainAdmin, adminDept]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setDeptFilter('all');
    setClassFilter('all');
    setStudentSearch('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = fromDate || toDate || deptFilter !== 'all' || classFilter !== 'all' || studentSearch || statusFilter !== 'all';

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const rows = filteredData.map(c => ({
      'Complaint ID': c.id,
      'Student ID': c.studentId,
      'Student Name': c.studentName,
      'Student Email': c.studentEmail || '',
      'Department': c.department,
      'Class': (c as any).class || '',
      'Subject': c.subject,
      'Category': c.category,
      'Status': c.status,
      'Admin Response': c.adminResponse || '',
      'Submitted Date': new Date(c.createdAt).toLocaleDateString(),
      'Updated Date': new Date(c.updatedAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Complaints');
    XLSX.writeFile(wb, `complaints-report-${Date.now()}.xlsx`);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Student Support Portal — Complaints Report', 14, 15);
    doc.setFontSize(9);

    const filterSummary = [
      fromDate && `From: ${fromDate}`,
      toDate && `To: ${toDate}`,
      deptFilter !== 'all' && `Dept: ${deptFilter}`,
      classFilter !== 'all' && `Class: ${classFilter}`,
      statusFilter !== 'all' && `Status: ${statusFilter}`,
      studentSearch && `Student: ${studentSearch}`,
    ].filter(Boolean).join('  |  ');

    doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Total: ${filteredData.length}${filterSummary ? `  |  ${filterSummary}` : ''}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['ID', 'Student', 'Dept', 'Class', 'Subject', 'Status', 'Date']],
      body: filteredData.map(c => [
        c.id.slice(-6),
        `${c.studentName} (${c.studentId})`,
        c.department,
        (c as any).class || '—',
        c.subject.slice(0, 25),
        c.status,
        new Date(c.createdAt).toLocaleDateString(),
      ]),
      styles: { fontSize: 7.5 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`complaints-report-${Date.now()}.pdf`);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=650');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Complaints Report</title><style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:20px}
      h2{color:#1e40af;margin-bottom:4px}
      .meta{color:#6b7280;font-size:11px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th{background:#2563eb;color:#fff;padding:8px 10px;text-align:left;font-size:11px}
      td{padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px}
      tr:nth-child(even) td{background:#f9fafb}
      .badge{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}
      .Pending{background:#fed7aa;color:#9a3412}
      .InProgress{background:#bfdbfe;color:#1e40af}
      .Resolved{background:#bbf7d0;color:#14532d}
    </style></head><body>
      <h2>Student Support Portal &mdash; Complaints Report</h2>
      <p class="meta">Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Total: ${filteredData.length}</p>
      <table><thead><tr>
        <th>Student</th><th>Department</th><th>Class</th><th>Subject</th><th>Status</th><th>Date</th>
      </tr></thead><tbody>
        ${filteredData.map(c => `<tr>
          <td>${c.studentName}<br/><span style="color:#9ca3af;font-size:10px">${c.studentId}</span></td>
          <td>${c.department}</td>
          <td>${(c as any).class || '&mdash;'}</td>
          <td>${c.subject}</td>
          <td><span class="badge ${c.status.replace(' ', '')}">${c.status}</span></td>
          <td>${new Date(c.createdAt).toLocaleDateString()}</td>
        </tr>`).join('')}
      </tbody></table>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredData.length} complaint{filteredData.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportExcel}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 1. Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" value={fromDate}
              onChange={e => { setFromDate(e.target.value); resetPage(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input type="date" value={toDate}
              onChange={e => { setToDate(e.target.value); resetPage(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* 3. Department Filter — Main Admin only */}
          {isMainAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <select value={deptFilter}
                onChange={e => handleDeptChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Class Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
            <select value={classFilter}
              onChange={e => { setClassFilter(e.target.value); resetPage(); }}
              disabled={isMainAdmin && deptFilter === 'all'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="all">{isMainAdmin && deptFilter === 'all' ? 'Select dept first' : 'All Classes'}</option>
              {classes.map(c => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 5. Student Search */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={studentSearch}
                onChange={e => { setStudentSearch(e.target.value); resetPage(); }}
                placeholder="Name, ID or Email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {fromDate && <Chip label={`From: ${fromDate}`} onRemove={() => setFromDate('')} />}
          {toDate && <Chip label={`To: ${toDate}`} onRemove={() => setToDate('')} />}
          {deptFilter !== 'all' && <Chip label={`Dept: ${deptFilter}`} onRemove={() => handleDeptChange('all')} />}
          {classFilter !== 'all' && <Chip label={`Class: ${classFilter}`} onRemove={() => setClassFilter('all')} />}
          {statusFilter !== 'all' && <Chip label={`Status: ${statusFilter}`} onRemove={() => setStatusFilter('all')} />}
          {studentSearch && <Chip label={`Student: ${studentSearch}`} onRemove={() => setStudentSearch('')} />}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(['Pending', 'In Progress', 'Resolved', 'Closed'] as const).map(s => {
          const count = filteredData.filter(c => c.status === s).length;
          return (
            <div key={s} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Student', 'Department', 'Class', 'Subject', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Download className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">No complaints match your filters</p>
                </td>
              </tr>
            ) : filteredData.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{c.studentName}</p>
                  <p className="text-xs text-gray-400">{c.studentId}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.department}</td>
                <td className="px-4 py-3 text-gray-600">{(c as any).class || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 max-w-[200px] truncate text-gray-700">{c.subject}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={page} totalItems={filteredData.length} onPageChange={setPage} />
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
    <span>{label}</span>
    <button onClick={onRemove} className="hover:text-blue-900">
      <X className="h-3 w-3" />
    </button>
  </span>
);

export default ReportsModule;
