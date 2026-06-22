import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
      const res = await axios.get(`/api/classes${params}`, {
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
    const res = await axios.post('/api/classes', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchClasses();
    return res.data;
  };

  const updateClass = async (id: string, data: { name?: string; description?: string }) => {
    await axios.put(`/api/classes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchClasses();
  };

  const deleteClass = async (id: string) => {
    await axios.delete(`/api/classes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchClasses();
  };

  return { classes, loading, error, fetchClasses, createClass, updateClass, deleteClass };
};
