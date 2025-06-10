import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

interface Student {
    _id: string;
    name: string;
    email: string;
    studentId: string;
    department: string;
    createdAt: string;
}

interface StudentRegistrationData {
    name: string;
    email: string;
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
    const { token } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
            setError(null);
        } catch (err) {
            setError('Error fetching students');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [token]);

    const registerStudent = async (data: StudentRegistrationData) => {
        try {
            await axios.post('/api/students', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudents();
        } catch (err) {
            setError('Error registering student');
            throw err;
        }
    };

    const getStudentsByDepartment = async (departmentId: string): Promise<Student[]> => {
        try {
            const response = await axios.get(`/api/students?departmentId=${departmentId}`, {
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
            await axios.put(`/api/students/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudents();
        } catch (err) {
            setError('Error updating student');
            throw err;
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await axios.delete(`/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudents();
        } catch (err) {
            setError('Error deleting student');
            throw err;
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