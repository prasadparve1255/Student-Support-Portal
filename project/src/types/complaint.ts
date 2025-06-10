export interface Complaint {
  id: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  department: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  isNotification?: boolean;
  isArchived?: boolean;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}