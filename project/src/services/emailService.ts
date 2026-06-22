// Email service for frontend
export interface StudentRegistrationData {
  name: string;
  email: string;
  studentId: string;
  password: string;
  department: string;
}

export const sendRegistrationEmail = async (studentData: StudentRegistrationData): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/send-registration-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        student: {
          name: studentData.name,
          email: studentData.email,
          studentId: studentData.studentId,
          department: studentData.department
          // password intentionally omitted from request body
        }
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send registration email:', error);
    return false;
  }
};

export const showEmailNotification = (_studentData: StudentRegistrationData) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Registration Successful', {
      body: 'Registration email has been sent successfully.',
      icon: '/favicon.ico'
    });
  }
  // No alert() - avoid reflecting user data into DOM/dialogs
};