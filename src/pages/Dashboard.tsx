import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  FileText,
  BarChart3,
  Trophy,
  Clock,
  TrendingUp,
  BookOpen,
  Target
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
  totalUsers?: number;
  totalTests?: number;
  totalQuestions?: number;
  totalResults?: number;
  recentTests?: any[];
  recentResults?: any[];
  upcomingTests?: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch different data based on user role
      const promises = [];
      
      if (['superadmin', 'centeradmin'].includes(user?.role || '')) {
        promises.push(axios.get('/users?limit=5'));
      }
      
      promises.push(axios.get('/tests?limit=5'));
      
      if (user?.role === 'student') {
        promises.push(axios.get(`/results/student/${user.id}?limit=5`));
      } else {
        promises.push(axios.get('/results?limit=5'));
      }

      const responses = await Promise.all(promises);
      
      let dashboardData: DashboardStats = {};
      
      if (['superadmin', 'centeradmin'].includes(user?.role || '')) {
        dashboardData.totalUsers = responses[0].data.total;
        dashboardData.totalTests = responses[1].data.total;
        dashboardData.recentTests = responses[1].data.tests;
        dashboardData.recentResults = responses[2].data.results;
      } else {
        dashboardData.totalTests = responses[0].data.total;
        dashboardData.recentTests = responses[0].data.tests;
        dashboardData.recentResults = responses[1].data.results;
      }
      
      setStats(dashboardData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Ready to ace your next test?</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Target Exam</p>
          <p className="text-lg font-semibold text-primary-600">
            {user?.studentDetails?.targetExam || 'Not Set'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentResults?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.recentResults?.length ? 
                  Math.round(stats.recentResults.reduce((acc: number, result: any) => acc + result.score.percentage, 0) / stats.recentResults.length) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tests and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Tests</h3>
          <div className="space-y-3">
            {stats.recentTests?.slice(0, 5).map((test: any) => (
              <div key={test._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{test.title}</p>
                  <p className="text-sm text-gray-600">{test.subject} • {test.duration} mins</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-600">{test.type}</p>
                  <p className="text-xs text-gray-500">{test.totalMarks} marks</p>
                </div>
              </div>
            ))}
            {(!stats.recentTests || stats.recentTests.length === 0) && (
              <p className="text-gray-500 text-center py-4">No tests available</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
          <div className="space-y-3">
            {stats.recentResults?.slice(0, 5).map((result: any) => (
              <div key={result._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{result.test?.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    result.score.percentage >= 80 ? 'text-green-600' :
                    result.score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.score.percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.score.correct}/{result.score.correct + result.score.incorrect + result.score.unattempted}
                  </p>
                </div>
              </div>
            ))}
            {(!stats.recentResults || stats.recentResults.length === 0) && (
              <p className="text-gray-500 text-center py-4">No results yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Test Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentResults?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.recentResults?.length ? 
                  Math.round(stats.recentResults.filter((r: any) => r.score.percentage >= 60).length / stats.recentResults.length * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tests</h3>
          <div className="space-y-3">
            {stats.recentTests?.slice(0, 5).map((test: any) => (
              <div key={test._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{test.title}</p>
                  <p className="text-sm text-gray-600">{test.subject} • {test.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-600">{test.duration} mins</p>
                  <p className="text-xs text-gray-500">{test.totalMarks} marks</p>
                </div>
              </div>
            ))}
            {(!stats.recentTests || stats.recentTests.length === 0) && (
              <p className="text-gray-500 text-center py-4">No tests created yet</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
          <div className="space-y-3">
            {stats.recentResults?.slice(0, 5).map((result: any) => (
              <div key={result._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{result.student?.name}</p>
                  <p className="text-sm text-gray-600">{result.test?.title}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    result.score.percentage >= 80 ? 'text-green-600' :
                    result.score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.score.percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!stats.recentResults || stats.recentResults.length === 0) && (
              <p className="text-gray-500 text-center py-4">No results yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      {user?.role === 'student' ? renderStudentDashboard() : renderAdminDashboard()}
    </div>
  );
};

export default Dashboard;