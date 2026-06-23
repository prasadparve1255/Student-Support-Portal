import { useState, useEffect, useCallback } from 'react';
import { Complaint } from '../types/complaint';
import API_BASE from '../services/api';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isEmailSending, setIsEmailSending] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const authRaw = localStorage.getItem('auth_state');
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const isAdmin = auth?.isAdmin;

      if (!token) return;

      let url = `${API_BASE}/complaints/all`;
      if (!isAdmin && auth?.currentStudent?.id) {
        url = `${API_BASE}/complaints/student/${auth.currentStudent.id}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Map backend fields to frontend Complaint type
        const mapped: Complaint[] = data.map((c: any) => ({
          id: c._id || c.id,
          studentId: c.studentId,
          studentName: c.studentName,
          studentEmail: c.studentEmail || '',
          department: c.department,
          subject: c.subject,
          description: c.description,
          category: c.category || 'General',
          status: c.status || 'Pending',
          adminResponse: c.adminResponse || '',
          attachments: c.attachments || [],
          class: c.class || '',
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          isNotification: c.isNotification || false,
          isArchived: c.isArchived || false,
        }));
        setComplaints(mapped);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const addComplaint = useCallback(async (complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>, files?: File[]) => {
    const token = localStorage.getItem('token');

    let body: FormData | string;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (files && files.length > 0) {
      const formData = new FormData();
      Object.entries(complaint).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      files.forEach(f => formData.append('attachments', f));
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(complaint);
    }

    const res = await fetch(`${API_BASE}/complaints/submit`, {
      method: 'POST',
      headers,
      body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit complaint');
    }
    await loadComplaints();
    return await res.json();
  }, [loadComplaints]);

  const updateComplaintStatus = useCallback(async (id: string, status: Complaint['status'], adminResponse?: string) => {
    // Optimistic update — UI taabdtob update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, adminResponse: adminResponse || c.adminResponse } : c));
    setIsEmailSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status, adminResponse }),
      });
      if (!res.ok) {
        // rollback
        await loadComplaints();
        throw new Error('Failed to update status');
      }
    } finally {
      setIsEmailSending(false);
    }
  }, [loadComplaints]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, isNotification: false, isArchived: true } : c));
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/complaints/${id}/read`, {
      method: 'PUT',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
  }, []);

  const deleteComplaint = useCallback(async (id: string) => {
    // Optimistic update
    setComplaints(prev => prev.filter(c => c.id !== id));
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'DELETE',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    if (!res.ok) {
      await loadComplaints(); // rollback
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete complaint');
    }
  }, [loadComplaints]);

  return {
    complaints,
    loadComplaints,
    addComplaint,
    updateComplaintStatus,
    markNotificationAsRead,
    deleteComplaint,
    isEmailSending,
  };
};
