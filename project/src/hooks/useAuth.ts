import { useState, useCallback } from 'react';
import { Student, AuthState, Admin } from '../types/auth';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

const STUDENTS_KEY = 'students';
const ADMINS_KEY = 'admins';
const AUTH_KEY = 'auth_state';

const defaultStudents: Student[] = [
  {
    id: 'CS001',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    department: 'Computer Science & Engineering',
    password: '',
  },
  {
    id: 'EC002',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    department: 'Electronics & Communication',
    password: '',
  },
  {
    id: 'ME003',
    name: 'Mike Johnson',
    email: 'mike.johnson@university.edu',
    department: 'Mechanical Engineering',
    password: '',
  },
];

const defaultAdmins: Admin[] = [
  {
    username: 'admin',
    password: '',
    department: 'All Departments',
    isMainAdmin: true,
  },
  {
    username: 'csadmin',
    password: '',
    department: 'Computer Science & Engineering',
    isMainAdmin: false,
  },
  {
    username: 'ecadmin',
    password: '',
    department: 'Electronics & Communication',
    isMainAdmin: false,
  },
  {
    username: 'meadmin',
    password: '',
    department: 'Mechanical Engineering',
    isMainAdmin: false,
  },
];

const safeParseArray = <T>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
};

const initializeDefaults = () => {
  try {
    if (!localStorage.getItem(STUDENTS_KEY)) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
    }
    if (!localStorage.getItem(ADMINS_KEY)) {
      localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
    }
  } catch {
    // localStorage unavailable
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    initializeDefaults();
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'isAuthenticated' in parsed) {
          return parsed as AuthState;
        }
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    return { isAuthenticated: false, currentStudent: null, currentAdmin: null, isAdmin: false };
  });

  const saveAuthState = useCallback((newState: AuthState) => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(newState));
    } catch {
      // ignore
    }
    setAuthState(newState);
  }, []);

  const loginStudent = useCallback(async (studentId: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API}/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });
      const data = await response.json();
      if (response.ok) {
        const student: Student = {
          id: String(data.student?.studentId || ''),
          name: String(data.student?.name || ''),
          email: String(data.student?.email || ''),
          department: String(data.student?.department || ''),
          password: '',
          _id: String(data.student?.id || ''),
          class: data.student?.class
            ? typeof data.student.class === 'object'
              ? String(data.student.class?.name || '')
              : String(data.student.class)
            : undefined,
        };
        localStorage.setItem('token', String(data.token || ''));
        saveAuthState({ isAuthenticated: true, currentStudent: student, currentAdmin: null, isAdmin: false });
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, [saveAuthState]);

  const loginAdmin = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      if (response.ok) {
        const admin: Admin = {
          username: String(data.admin?.username || ''),
          department: String(data.admin?.department || ''),
          isMainAdmin: Boolean(data.admin?.isMainAdmin),
          password: '',
        };
        localStorage.setItem('token', String(data.token || ''));
        saveAuthState({ isAuthenticated: true, currentStudent: null, currentAdmin: admin, isAdmin: true });
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, [saveAuthState]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
    setAuthState({ isAuthenticated: false, currentStudent: null, currentAdmin: null, isAdmin: false });
  }, []);

  const getStudents = useCallback((): Student[] => {
    return safeParseArray<Student>(STUDENTS_KEY, []);
  }, []);

  const getAdmins = useCallback((): Admin[] => {
    return safeParseArray<Admin>(ADMINS_KEY, []);
  }, []);

  const registerStudent = useCallback(
    async (student: Omit<Student, 'id'>, adminDepartment?: string): Promise<Student> => {
      if (!student.name || !student.email || !student.department || !student.password) {
        throw new Error('All student fields are required');
      }
      const department = adminDepartment || student.department;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) throw new Error('Invalid email format');

      const students = safeParseArray<Student>(STUDENTS_KEY, []);
      if (students.some(s => s.email.toLowerCase() === student.email.toLowerCase())) {
        throw new Error('Email already registered');
      }

      const deptPrefix = department.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
      const deptStudents = students.filter(s => s.department === department);
      const nextId = `${deptPrefix}${(deptStudents.length + 1).toString().padStart(3, '0')}`;
      const newStudent: Student = { ...student, department, id: nextId };

      localStorage.setItem(STUDENTS_KEY, JSON.stringify([...students, newStudent]));

      try {
        const { sendRegistrationEmail, showEmailNotification } = await import('../services/emailService');
        const emailSent = await sendRegistrationEmail({
          name: newStudent.name,
          email: newStudent.email,
          studentId: newStudent.id,
          password: student.password,
          department: newStudent.department,
        });
        if (emailSent) {
          showEmailNotification({
            name: newStudent.name,
            email: newStudent.email,
            studentId: newStudent.id,
            password: student.password,
            department: newStudent.department,
          });
        }
      } catch {
        // Email failure should not block registration
      }

      return newStudent;
    },
    []
  );

  const updateStudent = useCallback((studentId: string, updatedData: Partial<Omit<Student, 'id'>>) => {
    const students = safeParseArray<Student>(STUDENTS_KEY, []);
    const idx = students.findIndex(s => s.id === studentId);
    if (idx === -1) throw new Error('Student not found');

    if (updatedData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updatedData.email)) throw new Error('Invalid email format');
      if (students.some(s => s.id !== studentId && s.email.toLowerCase() === updatedData.email!.toLowerCase())) {
        throw new Error('Email already registered');
      }
    }

    const updated = { ...students[idx], ...updatedData };
    students[idx] = updated;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    return updated;
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    const students = safeParseArray<Student>(STUDENTS_KEY, []);
    const filtered = students.filter(s => s.id !== studentId);
    if (filtered.length === students.length) throw new Error('Student not found');
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(filtered));
    return true;
  }, []);

  return {
    authState,
    loginStudent,
    loginAdmin,
    logout,
    getStudents,
    getAdmins,
    registerStudent,
    updateStudent,
    deleteStudent,
  };
};
