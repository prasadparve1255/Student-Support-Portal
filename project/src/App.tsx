// import React from 'react';
// import { useAuth } from './hooks/useAuth';
// import LoginPage from './components/LoginPage';
// import StudentDashboard from './components/StudentDashboard';
// import AdminDashboard from './components/AdminDashboard';

// function App() {
//   const { authState } = useAuth();

//   if (!authState.isAuthenticated) {
//     return <LoginPage />;
//   }

//   if (authState.isAdmin) {
//     return <AdminDashboard />;
//   }

//   return <StudentDashboard />;
// }

// export default App;



import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;