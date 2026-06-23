import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../services/api';

interface Student {
    _id: string;
    name: string;
    email: string;
    studentId: string;
    department: string | { _id: string; name: string; code: string };
    class?: string | { _id: string; name: string } | null;
    createdAt: string;
}

interface StudentRegistrationData {
    name: string;
    email: string;
    studentId?: string;
    department: string;
    password: string;
}

interface StudentHook {
    students: Student[];
    loading: boolean;
    error: string | null;
    registerStudent: (data: StudentRegistrationData) => Promise<void>;
    getStudentsByDepartment: (departmentId: string) => Promise<Student[]>;
    updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    refreshStudents: () => Promise<void>;
    resetStudentPassword: (id: string, password: string) => Promise<void>;
}

export const useStudents = (): StudentHook => {
    const token = localStorage.getItem('token');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            if (!token) {
                // Fallback to localStorage if no token
                const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
                const mappedStudents = localStudents.map((s: any) => ({
                    _id: s.id,
                    name: s.name,
                    email: s.email,
                    studentId: s.id,
                    department: s.department,
                    createdAt: new Date().toISOString()
                }));
                setStudents(mappedStudents);
                setError(null);
                setLoading(false);
                return;
            }
            
            const response = await axios.get(`${API_BASE}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
            setError(null);
        } catch (err: any) {
            // Fallback to localStorage on API error
            console.warn('API failed, falling back to localStorage:', err.message);
            const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
            const mappedStudents = localStudents.map((s: any) => ({
                _id: s.id,
                name: s.name,
                email: s.email,
                studentId: s.id,
                department: s.department,
                createdAt: new Date().toISOString()
            }));
            setStudents(mappedStudents);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [token]);

    const registerStudent = async (data: StudentRegistrationData) => {
        try {
            if (!token) {
                throw new Error('No authentication token');
            }
            const response = await axios.post(`${API_BASE}/students`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudents();
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error registering student';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const getStudentsByDepartment = async (departmentId: string): Promise<Student[]> => {
        try {
            const response = await axios.get(`${API_BASE}/students?departmentId=${departmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (err) {
            setError('Error fetching students by department');
            throw err;
        }
    };

    const updateStudent = async (id: string, data: Partial<Student>) => {
        try {
            const res = await axios.put(`${API_BASE}/students/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update
            setStudents(prev => prev.map(s => s._id === id ? { ...s, ...res.data } : s));
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error updating student';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const resetStudentPassword = async (id: string, password: string) => {
        try {
            await axios.put(`${API_BASE}/students/${id}/reset-password`, { password }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error resetting password';
            throw new Error(errorMsg);
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await axios.delete(`${API_BASE}/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update — lagar UI madhun remove kar
            setStudents(prev => prev.filter(s => s._id !== id));
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error deleting student';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    return {
        students,
        loading,
        error,
        registerStudent,
        getStudentsByDepartment,
        updateStudent,
        deleteStudent,
        refreshStudents: fetchStudents,
        resetStudentPassword
    };
};

export default useStudents;