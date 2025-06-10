import { useState, useEffect, useCallback } from 'react';
import { Complaint } from '../types/complaint';

const STORAGE_KEY = 'complaints';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Load complaints from localStorage on initial render
  useEffect(() => {
    loadComplaints();
  }, []);

  // Function to load complaints from localStorage
  const loadComplaints = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setComplaints(JSON.parse(stored));
    }
  }, []);

  // Save complaints to localStorage and update state
  const saveComplaints = useCallback((newComplaints: Complaint[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newComplaints));
    setComplaints(newComplaints);
  }, []);

  const addComplaint = useCallback(async (complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newComplaint: Complaint = {
      ...complaint,
      id: Date.now().toString(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get the latest complaints from localStorage to avoid stale state
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentComplaints = stored ? JSON.parse(stored) : [];
    
    const updatedComplaints = [...currentComplaints, newComplaint];
    saveComplaints(updatedComplaints);
    
    return newComplaint;
  }, [saveComplaints]);

  const updateComplaintStatus = useCallback(async (id: string, status: Complaint['status'], adminResponse?: string) => {
    setIsEmailSending(true);
    
    // Get the latest complaints from localStorage to avoid stale state
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentComplaints = stored ? JSON.parse(stored) : [];
    
    const updated = currentComplaints.map(complaint =>
      complaint.id === id
        ? {
            ...complaint,
            status,
            adminResponse,
            updatedAt: new Date().toISOString(),
            isNotification: true,
          }
        : complaint
    );
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    saveComplaints(updated);
    setIsEmailSending(false);
    
    return updated.find(c => c.id === id);
  }, [saveComplaints]);
  
  const markNotificationAsRead = useCallback((id: string) => {
    // Get the latest complaints from localStorage to avoid stale state
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentComplaints = stored ? JSON.parse(stored) : [];
    
    const updated = currentComplaints.map(complaint =>
      complaint.id === id
        ? {
            ...complaint,
            isNotification: false,
            isArchived: true,
          }
        : complaint
    );
    
    saveComplaints(updated);
    
    return updated.find(c => c.id === id);
  }, [saveComplaints]);

  return {
    complaints,
    loadComplaints,
    addComplaint,
    updateComplaintStatus,
    markNotificationAsRead,
    isEmailSending,
  };
};