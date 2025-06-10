import React, { useState, useMemo, useCallback } from 'react';
import {
    Edit,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    TrendingUp,
    Calendar,
    MessageSquare,
    MoreHorizontal,
    Mail,
    Send,
    LogOut,
    GraduationCap
} from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';
import { useAuth } from '../hooks/useAuth';
import { Complaint, ComplaintStats } from '../types/complaint';
import DepartmentManagement from './DepartmentManagement';

const AdminDashboard: React.FC = () => {
    const { complaints, updateComplaintStatus, isEmailSending } = useComplaints();
    const { authState, logout, getStudents, registerStudent } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [departmentFilter, setDepartmentFilter] = useState<string>(
        authState.currentAdmin?.isMainAdmin ? 'all' : (authState.currentAdmin?.department || 'all')
    );
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        department: authState.currentAdmin?.department || '',
        password: ''
    });
    const [registrationSuccess, setRegistrationSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'complaints' | 'students' | 'departments'>('complaints');
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const stats: ComplaintStats = useMemo(() => {
        return {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'Pending').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length,
        };
    }, [complaints]);
    
    const studentStats = useMemo(() => {
        const students = getStudents();
        const departmentCounts: Record<string, number> = {};
        
        students.forEach(student => {
            if (authState.currentAdmin && !authState.currentAdmin.isMainAdmin && 
                student.department !== authState.currentAdmin.department) {
                return;
            }
            
            if (!departmentCounts[student.department]) {
                departmentCounts[student.department] = 0;
            }
            departmentCounts[student.department]++;
        });
        
        return {
            total: students.filter(s => 
                authState.currentAdmin?.isMainAdmin || s.department === authState.currentAdmin?.department
            ).length,
            byDepartment: departmentCounts
        };
    }, [getStudents, authState.currentAdmin]);

    const filteredComplaints = useMemo(() => {
        return complaints.filter(complaint => {
            const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
            const matchesDepartment = departmentFilter === 'all' || complaint.department === departmentFilter;
            
            // Department admin can only see complaints from their department
            const adminDepartmentFilter = authState.currentAdmin && !authState.currentAdmin.isMainAdmin
                ? complaint.department === authState.currentAdmin.department
                : true;
            
            return matchesSearch && matchesStatus && matchesDepartment && adminDepartmentFilter;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [complaints, searchTerm, statusFilter, departmentFilter, authState.currentAdmin]);
    
    const filteredStudents = useMemo(() => {
        const students = getStudents();
        return students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
            
            // Department admin can only see students from their department
            const adminDepartmentFilter = authState.currentAdmin && !authState.currentAdmin.isMainAdmin
                ? student.department === authState.currentAdmin.department
                : true;
            
            return matchesSearch && matchesDepartment && adminDepartmentFilter;
        });
    }, [getStudents, searchTerm, departmentFilter, authState.currentAdmin]);

    const uniqueDepartments = useMemo(() => {
        return [
            'Computer Science & Engineering',
            'Electronics & Communication',
            'Mechanical Engineering',
            'Civil Engineering',
            'Electrical Engineering',
            'Information Technology',
            'Chemical Engineering'
        ];
    }, []);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }, []);

    const getPriorityColor = useCallback((priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-600';
            case 'Medium': return 'text-yellow-600';
            case 'Low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    }, []);

    const handleStatusUpdate = async (complaint: Complaint, newStatus: Complaint['status']) => {
        try {
            await updateComplaintStatus(complaint.id, newStatus, adminResponse);
            setSelectedComplaint(null);
            setAdminResponse('');
        } catch (error) {
            console.error('Error updating complaint status:', error);
            // TODO: Add error notification
        }
    };
    
