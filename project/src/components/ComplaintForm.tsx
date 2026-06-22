import React, { useState, useRef } from 'react';
import { Send, AlertCircle, User, Mail, Hash, Building, CheckCircle, ArrowLeft, Paperclip, X } from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';
import { useAuthContext as useAuth } from '../context/AuthContext';

interface ComplaintFormProps {
  onBack?: () => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onBack }) => {
  const { addComplaint, loadComplaints } = useComplaints();
  const { authState } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Academic Issues',
    'Infrastructure Problems',
    'Hostel Issues',
    'Library Services',
    'Laboratory Equipment',
    'Administrative Services',
    'Transportation',
    'Food Services',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.currentStudent) return;

    setIsSubmitting(true);

    const complaintData = {
      ...formData,
      studentName: authState.currentStudent.name,
      studentEmail: authState.currentStudent.email,
      studentId: authState.currentStudent.id,
      department: authState.currentStudent.department,
      class: (authState.currentStudent as any).class || '',
    };

    await addComplaint(complaintData, files);
    loadComplaints();
    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form after showing success message
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        category: '',
        subject: '',
        description: '',
      });
      if (onBack) onBack();
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully!</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Your complaint has been recorded and assigned tracking ID: <span className="font-mono font-semibold text-blue-600">#{Date.now().toString().slice(-6)}</span>
          </p>
          
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4">
            <p className="text-xs sm:text-sm text-blue-800 font-medium">
              You can track the status of your complaint in your dashboard. The admin team will review it shortly.
            </p>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">What's Next?</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Admin team will review your complaint</li>
              <li>• Status updates will be visible in your dashboard</li>
              <li>• You'll receive responses from the admin team</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">File a New Complaint</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Submit your concerns and we'll work to resolve them promptly. All complaints are handled with confidentiality and professionalism.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Complaint Form</h2>
                <p className="text-sm sm:text-base text-blue-100">Filing as: {authState.currentStudent?.name} ({authState.currentStudent?.id})</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8">
            {/* Student Info Display */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{authState.currentStudent?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="font-medium text-gray-900">{authState.currentStudent?.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{authState.currentStudent?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">{authState.currentStudent?.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-medium text-gray-900">{(authState.currentStudent as any).class || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <span>Category</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Star className="h-4 w-4" />
                  <span>Priority Level</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div> */}
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Brief summary of your complaint"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                placeholder="Please provide detailed information about your complaint, including any relevant dates, locations, and circumstances..."
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (optional — images or PDF, max 5MB each)
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to attach screenshot, PDF or evidence photo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }}
                />
              </div>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="h-4 w-4 text-red-400 hover:text-red-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;