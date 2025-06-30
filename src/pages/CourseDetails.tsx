import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import TestCard from '../components/TestCard';
import {
  Plus, Search, Filter, Clock, FileText, Users,
  Calendar, Edit, Trash2, Play
} from 'lucide-react';

interface Test {
  _id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  startDate: string;
  endDate: string;
}

const CourseDetails: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const [courseName, setCourseName] = useState('');
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseTests();
  }, [id, filterType, filterSubject]);

//   useEffect(() => {
//       fetchCourseTests();
//         // fetchCenters(); // fetch centers too
  
//     }, [filterType, filterSubject]);
  

  const fetchCourseTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      console.log(params);

        if (filterType) params.append('type', filterType);
      if (filterSubject) params.append('subject', filterSubject);
// axios get here....

      // Replace with actual API call
      const mockCourse = {
        name: 'NEET 2025 Foundation',
        testIds: ['6862d6977bc71b348de27e34', 'test2']
      };

      const mockTests: Test[] = [
        {
          _id: '6862d6977bc71b348de27e34',
          title: 'NEET Full Mock Test 1',
          description: 'Full syllabus mock test',
          type: 'NEET',
          subject: 'Biology',
          difficulty: 'Medium',
          duration: 180,
          totalMarks: 720,
          questionCount: 180,
          startDate: '2025-06-01T08:00:00Z',
          endDate: '2025-07-31T23:59:00Z'
        },
        {
          _id: 'test2',
          title: 'Physics Practice Set',
          description: 'Chapter-wise Physics questions',
          type: 'Practice',
          subject: 'Physics',
          difficulty: 'Easy',
          duration: 60,
          totalMarks: 100,
          questionCount: 45,
          startDate: '2025-06-15T08:00:00Z',
          endDate: '2025-07-15T23:59:00Z'
        }
      ];

      setCourseName(mockCourse.name);
      setTests(mockTests.filter(t => mockCourse.testIds.includes(t._id)));

    } catch (err) {
      toast.error('Failed to fetch course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

    const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading course tests..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">{courseName}</h1>
      <p className="text-gray-600 mb-6">Tests assigned to this course</p>

      {/* Filters */}
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="Mock">Mock</option>
                  <option value="Practice">Practice</option>
                </select>
                <select className="input" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                  <option value="">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Mixed">Mixed</option>
                </select>
                <button onClick={() => {
                  setFilterType('');
                  setFilterSubject('');
                  setSearchTerm('');
                }} className="btn btn-secondary">
                  <Filter className="h-5 w-5 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
            <div className="mt-6 mb-4 flex items-center justify-between"></div>

      {filteredTests.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No tests assigned to this course.
        </div>
      ) : (
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <TestCard key={test._id} test={test} userRole={user?.role || ''} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
