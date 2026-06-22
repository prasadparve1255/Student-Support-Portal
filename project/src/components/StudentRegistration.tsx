import React, { useState } from "react";
import { useDepartments } from "../hooks/useDepartments";
import { X } from "lucide-react";

interface StudentRegistrationProps {
  onClose: () => void;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  onClose,
}) => {
  const { departments } = useDepartments();
  // const [formData, setFormData] = useState({
  //     name: '',
  //     email: '',
  //     studentId: '',
  //     department: '',
  //     password: ''
  // });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setMessage({ type: '', text: '' });

  //     try {
  //         if (!formData.name || !formData.email || !formData.department || !formData.password) {
  //             setMessage({ type: 'error', text: 'Please fill all required fields' });
  //             return;
  //         }

  //         console.log('Submitting registration:', formData);

  //         const response = await fetch('/api/students', {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json'
  //             },
  //             body: JSON.stringify(formData)
  //         });

  //         const result = await response.json();
  //         console.log('Registration response:', result);

  //         if (response.ok) {
  //             setMessage({
  //                 type: 'success',
  //                 text: `Student registered successfully with ID: ${result.studentId}`
  //             });
  //             setFormData({
  //                 name: '',
  //                 email: '',
  //                 studentId: '',
  //                 department: '',
  //                 password: ''
  //             });
  //             setTimeout(() => {
  //                 onClose();
  //             }, 2000);
  //         } else {
  //             setMessage({
  //                 type: 'error',
  //                 text: result.message || 'Error registering student'
  //             });
  //         }
  //     } catch (error: any) {
  //         console.error('Registration error:', error);
  //         setMessage({
  //             type: 'error',
  //             text: `Registration failed: ${error.message}`
  //         });
  //     }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      // Required fields validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.department ||
        !formData.password
      ) {
        setMessage({
          type: "error",
          text: "Please fill all required fields",
        });
        return;
      }

      // Name validation
      const nameRegex = /^[A-Za-z\s]+$/;

      if (!nameRegex.test(formData.name.trim())) {
        setMessage({
          type: "error",
          text: "Name should contain only letters and spaces",
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        setMessage({
          type: "error",
          text: "Please enter a valid email address",
        });
        return;
      }

      // Password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      if (!passwordRegex.test(formData.password)) {
        setMessage({
          type: "error",
          text: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
        });
        return;
      }

      console.log("Submitting registration:", formData);

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log("Registration response:", result);

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Student registered successfully with ID: ${result.studentId}`,
        });

        setFormData({
          name: "",
          email: "",
          studentId: "",
          department: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error registering student",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      setMessage({
        type: "error",
        text: `Registration failed: ${error.message}`,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Register New Student
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID (Optional - will be auto-generated if empty)
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g., CS2024001 (leave empty for auto-generation)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {message.text && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Register Student
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
