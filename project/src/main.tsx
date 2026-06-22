import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './styles/responsive.css';

axios.defaults.baseURL = 'http://localhost:5000';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
