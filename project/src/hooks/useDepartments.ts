import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE from '../services/api';

interface Department {
  _id?: string;
  name: string;
  code: string;
  description: string;
  adminName?: string;
  username?: string;
  email?: string;
  password?: string;
}

interface DepartmentHook {
    departments: Department[];
    loading: boolean;
    error: string | null;
    createDepartment: (data: Omit<Department, '_id'>) => Promise<void>;
    updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;
    refreshDepartments: () => Promise<void>;
}

// Module-level cache — component re-mount वर re-fetch होणार नाही
let _cache: Department[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export const useDepartments = (): DepartmentHook => {
    const token = localStorage.getItem('token');
    const [departments, setDepartments] = useState<Department[]>(_cache || []);
    const [loading, setLoading] = useState(_cache === null);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    const fetchDepartments = async (force = false) => {
        // Cache valid असेल तर skip
        if (!force && _cache && Date.now() - _cacheTime < CACHE_TTL) {
            setDepartments(_cache);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/departments`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            _cache = response.data;
            _cacheTime = Date.now();
            if (isMounted.current) {
                setDepartments(response.data);
                setError(null);
            }
        } catch {
            if (isMounted.current) setError('Error fetching departments');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMounted.current = true;
        fetchDepartments();
        return () => { isMounted.current = false; };
    }, [token]);

    const createDepartment = async (data: Omit<Department, '_id'>) => {
        const res = await axios.post(`${API_BASE}/departments`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const newDept = res.data.department || res.data;
        _cache = [...((_cache) || []), newDept];
        _cacheTime = Date.now();
        setDepartments(prev => [...prev, newDept]);
    };

    const updateDepartment = async (id: string, data: Partial<Department>) => {
        const res = await axios.put(`${API_BASE}/departments/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(prev => {
            const updated = prev.map(d => d._id === id ? { ...d, ...res.data } : d);
            _cache = updated;
            return updated;
        });
    };

    const deleteDepartment = async (id: string) => {
        await axios.delete(`${API_BASE}/departments/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(prev => {
            const updated = prev.filter(d => d._id !== id);
            _cache = updated;
            return updated;
        });
    };

    return {
        departments,
        loading,
        error,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        refreshDepartments: () => fetchDepartments(true)
    };
};

export default useDepartments;