import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";

// Import pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ConsentPage from "./pages/ConsentPage";
import FirstAidPage from "./pages/FirstAidPage";
import FirstAidDetailPage from "./pages/FirstAidDetailPage";
import MedicinePage from "./pages/MedicinePage";
import MedicineDetailPage from "./pages/MedicineDetailPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import LocatorPage from "./pages/LocatorPage";
import FeedbackPage from "./pages/FeedbackPage";
import EmergencyPage from "./pages/EmergencyPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('otcwise_token');
  if (!token) {
    toast.error('Please login to access this feature');
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('otcwise_token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('otcwise_token', token);
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem('otcwise_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="App">
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/consent" element={<ProtectedRoute><ConsentPage /></ProtectedRoute>} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="/first-aid/:topicId" element={<FirstAidDetailPage />} />
            <Route path="/medicines" element={<MedicinePage />} />
            <Route path="/medicines/:medicineId" element={<MedicineDetailPage />} />
            <Route path="/symptoms" element={<ProtectedRoute><SymptomCheckerPage /></ProtectedRoute>} />
            <Route path="/locator" element={<LocatorPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
export { API };