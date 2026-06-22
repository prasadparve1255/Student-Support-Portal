import React from 'react';
import { Users, Shield } from 'lucide-react';

interface NavigationProps {
  currentView: 'student' | 'admin';
  onViewChange: (view: 'student' | 'admin') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-900">
              Student Support Portal
            </h1>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange('student')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'student'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'admin'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;