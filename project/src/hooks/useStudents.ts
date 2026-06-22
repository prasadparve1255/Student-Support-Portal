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
            if (!token || token.startsWith('demo-token')) {
                // Fallback to localStorage
                const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
                const studentIndex = localStudents.findIndex((s: any) => s.id === id);
                if (studentIndex !== -1) {
                    localStudents[studentIndex] = { ...localStudents[studentIndex], ...data };
                    localStorage.setItem('students', JSON.stringify(localStudents));
                }
                await fetchStudents();
                return;
            }
            
            await axios.put(`${API_BASE}/students/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudents();
        } catch (err: any) {
            // Fallback to localStorage on API error
            console.warn('API update failed, falling back to localStorage:', err.message);
            const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
            const studentIndex = localStudents.findIndex((s: any) => s.id === id);
            if (studentIndex !== -1) {
                localStudents[studentIndex] = { ...localStudents[studentIndex], ...data };
                localStorage.setItem('students', JSON.stringify(localStudents));
            }
            await fetchStudents();
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            if (!token || token.startsWith('demo-token')) {
                // Fallback to localStorage
                const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
                const filteredStudents = localStudents.filter((s: any) => s.id !== id);
                localStorage.setItem('students', JSON.stringify(filteredStudents));
                await fetchStudents();
                return;
            }
            
            await axios.delete(`${API_BASE}/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudents();
        } catch (err: any) {
            // Fallback to localStorage on API error
            console.warn('API delete failed, falling back to localStorage:', err.message);
            const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
            const filteredStudents = localStudents.filter((s: any) => s.id !== id);
            localStorage.setItem('students', JSON.stringify(filteredStudents));
            await fetchStudents();
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
        refreshStudents: fetchStudents
    };
};

export default useStudents;