import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tests from './pages/Tests';
import TestTaking from './pages/TestTaking';
import Results from './pages/Results';
import Questions from './pages/Questions';
import Users from './pages/Users';
import Centers from './pages/Centers';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AddQuestionsPage from './pages/AddQuestionsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tests" element={<Tests />} />
                      <Route path="/test/:id" element={<TestTaking />} />
                      <Route path="/results" element={<Results />} />
                      <Route path="/questions" element={<Questions />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/centers" element={<Centers />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/test/:id/add-questions" element={<AddQuestionsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;