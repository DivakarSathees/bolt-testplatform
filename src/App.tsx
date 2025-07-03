import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // ⬅️ Import useAuth
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
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import LoadingSpinner from './components/LoadingSpinner'; // ⬅️ Optional spinner while loading
import Exams from './pages/Exam';
import QuestionSetComponent from './pages/QuestionSet';
import SelectQuestionSetsPage from './pages/SelectQuestionSetsPage';

// ⬇️ This separates the route logic and blocks it while auth is still loading
function AppContent() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner text="Checking session..." />;
  return (
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
                {/* Admin-only routes */}
                <Route path="/questions" element={<ProtectedRoute roles={['superadmin', 'contentadmin']}> <Questions /> </ProtectedRoute> } />
                {/* <Route path="/questions/:examId/:subjectId/:chapterId" element={<Questions />} /> */}
                <Route path="/questionsets" element={<QuestionSetComponent />} />
                <Route path="/users" element={<Users />} />
                <Route path="/centers" element={<Centers />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/courses/:courseId" element={<Courses />} />
                <Route path="/course/:id/details" element={<CourseDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/test/:id/add-questions" element={<AddQuestionsPage />} />
                <Route path="/test/:id/select-sets" element={<SelectQuestionSetsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

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
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
