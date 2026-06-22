import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../services/api';

// Mock data for development when API is unavailable
const MOCK_DEPARTMENTS = [
  { _id: '1', name: 'Computer Science', code: 'CS', description: 'Computer Science Department' },
  { _id: '2', name: 'Electrical Engineering', code: 'EE', description: 'Electrical Engineering Department' },
  { _id: '3', name: 'Mechanical Engineering', code: 'ME', description: 'Mechanical Engineering Department' }
];

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

export const useDepartments = (): DepartmentHook => {
    const token = localStorage.getItem('token');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE}/departments`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setDepartments(response.data);
                setError(null);
            } catch (apiErr) {
                console.warn('API unavailable, using mock data');
                setDepartments(MOCK_DEPARTMENTS);
                setError(null);
            }
        } catch (err) {
            setError('Error fetching departments');
            console.error('Error fetching departments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [token]);

    const createDepartment = async (data: Omit<Department, '_id'>) => {
        try {
            try {
                await axios.post(`${API_BASE}/departments`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (apiErr) {
                // Mock successful creation with a new ID
                const newDept = { ...data, _id: Date.now().toString() };
                setDepartments([...departments, newDept]);
                return;
            }
            await fetchDepartments();
        } catch (err) {
            setError('Error creating department');
            throw err;
        }
    };

    const updateDepartment = async (id: string, data: Partial<Department>) => {
        try {
            try {
                await axios.put(`${API_BASE}/departments/${id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (apiErr) {
                // Mock update in local state
                setDepartments(departments.map(dept => 
                    dept._id === id ? { ...dept, ...data } : dept
                ));
                return;
            }
            await fetchDepartments();
        } catch (err) {
            setError('Error updating department');
            throw err;
        }
    };

    const deleteDepartment = async (id: string) => {
        try {
            try {
                await axios.delete(`${API_BASE}/departments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (apiErr) {
                // Mock delete in local state
                setDepartments(departments.filter(dept => dept._id !== id));
                return;
            }
            await fetchDepartments();
        } catch (err) {
            setError('Error deleting department');
            throw err;
        }
    };

    return {
        departments,
        loading,
        error,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        refreshDepartments: fetchDepartments
    };
};

export default useDepartments;