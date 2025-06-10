import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, AuthState, Admin } from '../types/auth';

const STUDENTS_KEY = 'students';
const ADMINS_KEY = 'admins';
const AUTH_KEY = 'auth_state';

// Demo students data
const defaultStudents: Student[] = [
  {
    id: 'CS001',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    department: 'Computer Science & Engineering',
    password: 'password123',
  },
  {
    id: 'EC002',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    department: 'Electronics & Communication',
    password: 'password123',
  },
  {
    id: 'ME003',
    name: 'Mike Johnson',
    email: 'mike.johnson@university.edu',
    department: 'Mechanical Engineering',
    password: 'password123',
  },
];

// Default admins data
const defaultAdmins: Admin[] = [
  {
    username: 'admin',
    password: 'admin123',
    department: 'All Departments',
    isMainAdmin: true,
  },
  {
    username: 'csadmin',
    password: 'admin123',
    department: 'Computer Science & Engineering',
    isMainAdmin: false,
  },
  {
    username: 'ecadmin',
    password: 'admin123',
    department: 'Electronics & Communication',
    isMainAdmin: false,
  },
  {
    username: 'meadmin',
    password: 'admin123',
    department: 'Mechanical Engineering',
    isMainAdmin: false,
  },
];

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        // Validate parsed data structure
        if (typeof parsed === 'object' && 'isAuthenticated' in parsed) {
          return parsed as AuthState;
        }
      }
    } catch (error) {
      console.error('Failed to parse stored auth state:', error);
    }
    return {
      isAuthenticated: false,
      currentStudent: null,
      currentAdmin: null,
      isAdmin: false,
    };
  });

  // Initialize default data only if not present
  const initializeData = useCallback(() => {
    try {
      if (!localStorage.getItem(STUDENTS_KEY)) {
        localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
      }
      if (!localStorage.getItem(ADMINS_KEY)) {
        localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
      }
    } catch (error) {
      console.error('Failed to initialize default data:', error);
    }
  }, []);

  // Save auth state to localStorage
  const saveAuthState = useCallback((newState: AuthState) => {
    try {
      setAuthState(newState);
      localStorage.setItem(AUTH_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    initializeData();
    const { isAuthenticated, isAdmin } = authState;
    const currentPath = window.location.pathname;

    if (!isAuthenticated && currentPath !== '/') {
      navigate('/', { replace: true });
    } else if (isAuthenticated) {
      if (isAdmin && currentPath !== '/admin-dashboard') {
        navigate('/admin-dashboard', { replace: true });
      } else if (!isAdmin && currentPath !== '/student-dashboard') {
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [authState, navigate, initializeData]);

  const loginStudent = useCallback((studentId: string, password: string): boolean => {
    try {
      const students: Student[] = JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]');
      const student = students.find(
        (s: Student) => s.id.toLowerCase() === studentId.toLowerCase() && s.password === password
      );

      if (student) {
        saveAuthState({
          isAuthenticated: true,
          currentStudent: student,
          currentAdmin: null,
          isAdmin: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Student login failed:', error);
      return false;
    }
  }, [saveAuthState]);

  const loginAdmin = useCallback((username: string, password: string): boolean => {
    try {
      const admins: Admin[] = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
      const admin = admins.find(
        (a: Admin) => a.username.toLowerCase() === username.toLowerCase() && a.password === password
      );

      if (admin) {
        saveAuthState({
          isAuthenticated: true,
          currentStudent: null,
          currentAdmin: admin,
          isAdmin: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  }, [saveAuthState]);

  const logout = useCallback(() => {
    try {
      saveAuthState({
        isAuthenticated: false,
        currentStudent: null,
        currentAdmin: null,
        isAdmin: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [saveAuthState]);

  const getStudents = useCallback((): Student[] => {
    try {
      const students = JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]');
      if (Array.isArray(students)) {
        return students as Student[];
      }
      return [];
    } catch (error) {
      console.error('Failed to get students:', error);
      return [];
    }
  }, []);

  const getAdmins = useCallback((): Admin[] => {
    try {
      const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
      if (Array.isArray(admins)) {
        return admins as Admin[];
      }
      return [];
    } catch (error) {
      console.error('Failed to get admins:', error);
      return [];
    }
  }, []);

  const registerStudent = useCallback(
    (student: Omit<Student, 'id'>, adminDepartment?: string): Student => {
      try {
        if (!student.name || !student.email || !student.department || !student.password) {
          throw new Error('All student fields are required');
        }

        const students = getStudents();
        const department = adminDepartment || student.department;
        if (!department) {
          throw new Error('Department is required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(student.email)) {
          throw new Error('Invalid email format');
        }

        // Check for duplicate email
        if (students.some((s: Student) => s.email.toLowerCase() === student.email.toLowerCase())) {
          throw new Error('Email already registered');
        }

        const deptPrefix = department
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        const deptStudents = students.filter((s: Student) => s.department === department);
        const nextId = `${deptPrefix}${(deptStudents.length + 1).toString().padStart(3, '0')}`;

        const newStudent: Student = {
          ...student,
          department,
          id: nextId,
        };

        localStorage.setItem(STUDENTS_KEY, JSON.stringify([...students, newStudent]));
        return newStudent;
      } catch (error) {
        console.error('Failed to register student:', error);
        throw error; // Re-throw to allow calling code to handle
      }
    },
    [getStudents]
  );

  return {
    authState,
    loginStudent,
    loginAdmin,
    logout,
    getStudents,
    getAdmins,
    registerStudent,
  };
};