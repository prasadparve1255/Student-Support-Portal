import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';

// Mock the hooks
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useComplaints');

describe('AdminDashboard', () => {
    const mockAuthState = {
        currentAdmin: {
            isMainAdmin: true,
            department: 'Computer Science & Engineering'
        }
    };

    const mockComplaints = [
        {
            id: '1',
            subject: 'Test Complaint',
            description: 'Test Description',
            status: 'Pending',
            priority: 'High',
            department: 'Computer Science & Engineering',
            studentName: 'John Doe',
            studentEmail: 'john@example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        // Setup mock implementations
        vi.mocked(useAuth).mockReturnValue({
            authState: mockAuthState,
            logout: vi.fn(),
            getStudents: vi.fn(() => []),
            registerStudent: vi.fn()
        });

        vi.mocked(useComplaints).mockReturnValue({
            complaints: mockComplaints,
            updateComplaintStatus: vi.fn(),
            isEmailSending: false
        });
    });

    it('renders without crashing', () => {
        render(<AdminDashboard />);
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });

    it('displays correct number of complaints', () => {
        render(<AdminDashboard />);
        expect(screen.getByText(/Complaints \(1\)/i)).toBeInTheDocument();
    });

    it('filters complaints by search term', () => {
        render(<AdminDashboard />);
        const searchInput = screen.getByPlaceholderText(/Search complaints/i);
        fireEvent.change(searchInput, { target: { value: 'Test' } });
        expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });

    it('allows switching between tabs', () => {
        render(<AdminDashboard />);
        const studentsTab = screen.getByText(/Students/i);
        fireEvent.click(studentsTab);
        expect(screen.getByText(/Total Students/i)).toBeInTheDocument();
    });
});