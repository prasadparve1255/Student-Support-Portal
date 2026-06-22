import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE from '../services/api';

export interface ClassItem {
  _id: string;
  name: string;
  department: { _id: string; name: string; code: string } | string;
  description?: string;
}

export const useClasses = (departmentId?: string) => {
  const token = localStorage.getItem('token');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = departmentId ? `?department=${departmentId}` : '';
      const res = await axios.get(`${API_BASE}/classes${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching classes');
    } finally {
      setLoading(false);
    }
  }, [token, departmentId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const createClass = async (data: { name: string; description?: string }) => {
    const res = await axios.post(`${API_BASE}/classes`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Optimistic add
    setClasses(prev => [...prev, res.data]);
    return res.data;
  };

  const updateClass = async (id: string, data: { name?: string; description?: string }) => {
    const res = await axios.put(`${API_BASE}/classes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Optimistic update
    setClasses(prev => prev.map(c => c._id === id ? { ...c, ...res.data } : c));
  };

  const deleteClass = async (id: string) => {
    await axios.delete(`${API_BASE}/classes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Optimistic remove
    setClasses(prev => prev.filter(c => c._id !== id));
  };

  return { classes, loading, error, fetchClasses, createClass, updateClass, deleteClass };
};
