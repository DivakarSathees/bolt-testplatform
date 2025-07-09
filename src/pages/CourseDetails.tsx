// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { useAuth } from '../contexts/AuthContext';
// import toast from 'react-hot-toast';
// import TestCard from '../components/TestCard';
// import {
//   Plus, Search, Filter, Clock, FileText, Users,
//   Calendar, Edit, Trash2, Play
// } from 'lucide-react';

// interface Test {
//   _id: string;
//   title: string;
//   description: string;
//   type: string;
//   subject: string;
//   difficulty: string;
//   duration: number;
//   totalMarks: number;
//   questionCount: number;
//   startDate: string;
//   endDate: string;
// }

// const CourseDetails: React.FC = () => {
//   const { user } = useAuth();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('');
//   const [filterSubject, setFilterSubject] = useState('');

//   const [courseName, setCourseName] = useState('');
//   const [tests, setTests] = useState<Test[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchCourseTests();
//   }, [id, filterType, filterSubject]);

// //   useEffect(() => {
// //       fetchCourseTests();
// //         // fetchCenters(); // fetch centers too
  
// //     }, [filterType, filterSubject]);
  

//   const fetchCourseTests = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       console.log(params);

//         if (filterType) params.append('type', filterType);
//       if (filterSubject) params.append('subject', filterSubject);
// // axios get here....

//       // Replace with actual API call
//       const mockCourse = {
//         name: 'NEET 2025 Foundation',
//         testIds: ['6862d6977bc71b348de27e34', 'test2']
//       };

//       const mockTests: Test[] = [
//         {
//           _id: '6862d6977bc71b348de27e34',
//           title: 'NEET Full Mock Test 1',
//           description: 'Full syllabus mock test',
//           type: 'NEET',
//           subject: 'Biology',
//           difficulty: 'Medium',
//           duration: 180,
//           totalMarks: 720,
//           questionCount: 180,
//           startDate: '2025-06-01T08:00:00Z',
//           endDate: '2025-07-31T23:59:00Z'
//         },
//         {
//           _id: 'test2',
//           title: 'Physics Practice Set',
//           description: 'Chapter-wise Physics questions',
//           type: 'Practice',
//           subject: 'Physics',
//           difficulty: 'Easy',
//           duration: 60,
//           totalMarks: 100,
//           questionCount: 45,
//           startDate: '2025-06-15T08:00:00Z',
//           endDate: '2025-07-15T23:59:00Z'
//         }
//       ];

//       setCourseName(mockCourse.name);
//       setTests(mockTests.filter(t => mockCourse.testIds.includes(t._id)));

//     } catch (err) {
//       toast.error('Failed to fetch course details');
//       navigate('/courses');
//     } finally {
//       setLoading(false);
//     }
//   };

//     const filteredTests = tests.filter(test =>
//     test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     test.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) return <LoadingSpinner text="Loading course tests..." />;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       <h1 className="text-2xl font-bold mb-2">{courseName}</h1>
//       <p className="text-gray-600 mb-6">Tests assigned to this course</p>

//       {/* Filters */}
//             <div className="card p-6">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                   <input
//                     type="text"
//                     placeholder="Search tests..."
//                     className="input pl-10"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
//                   <option value="">All Types</option>
//                   <option value="JEE">JEE</option>
//                   <option value="NEET">NEET</option>
//                   <option value="Mock">Mock</option>
//                   <option value="Practice">Practice</option>
//                 </select>
//                 <select className="input" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
//                   <option value="">All Subjects</option>
//                   <option value="Physics">Physics</option>
//                   <option value="Chemistry">Chemistry</option>
//                   <option value="Mathematics">Mathematics</option>
//                   <option value="Biology">Biology</option>
//                   <option value="Mixed">Mixed</option>
//                 </select>
//                 <button onClick={() => {
//                   setFilterType('');
//                   setFilterSubject('');
//                   setSearchTerm('');
//                 }} className="btn btn-secondary">
//                   <Filter className="h-5 w-5 mr-2" />
//                   Clear Filters
//                 </button>
//               </div>
//             </div>
//             <div className="mt-6 mb-4 flex items-center justify-between"></div>

//       {filteredTests.length === 0 ? (
//         <div className="text-center text-gray-500 py-12">
//           No tests assigned to this course.
//         </div>
//       ) : (
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredTests.map(test => (
//             <TestCard key={test._id} test={test} userRole={user?.role || ''} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CourseDetails;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, Clock, FileText, Users,
  Calendar, Edit, Trash2, Play
} from 'lucide-react';

interface Test {
  _id: string;
  name: string; // mapped from title
  examName: string; // mapped from type
  description: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalMarks?: number;
  questionCount: number;
  startDate?: string;
  endDate?: string;
}

const CourseDetails: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [tests, setTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseTests();
  }, [id, filterType, filterSubject]);

  const fetchCourseTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterType) params.append('type', filterType);
      if (filterSubject) params.append('subject', filterSubject);

      // Mock API simulation
      const mockCourse = {
        name: 'NEET 2025 Foundation',
        testIds: ['6862d6977bc71b348de27e34', 'test2']
      };

      const mockTests = [
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

      const transformedTests: Test[] = mockTests
        .filter(t => mockCourse.testIds.includes(t._id))
        .map(t => ({
          _id: t._id,
          name: t.title,
          examName: t.type,
          description: t.description,
          subject: t.subject,
          difficulty: t.difficulty,
          duration: t.duration,
          totalMarks: t.totalMarks,
          questionCount: t.questionCount,
          startDate: t.startDate,
          endDate: t.endDate,
        }));

      setCourseName(mockCourse.name);
      setTests(transformedTests);
    } catch (err) {
      toast.error('Failed to fetch course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(test =>
    (!filterType || test.examName === filterType) &&
    (!filterSubject || test.subject === filterSubject)
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.length === 0 ? (
          <div className="text-center col-span-full text-gray-500 py-12">
            No tests assigned to this course.
          </div>
        ) : (
          filteredTests.map(test => (
            <div key={test._id} className="card p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.examName === 'JEE' ? 'bg-blue-100 text-blue-800' :
                    test.examName === 'NEET' ? 'bg-green-100 text-green-800' :
                    test.examName === 'Mock' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{test.examName}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{test.subject}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{test.duration} mins</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Questions:</span>
                  <span className="flex items-center"><FileText className="h-4 w-4 mr-1" />{test.questionCount}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{test.difficulty}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link to={`/test/${test._id}`} className="w-full btn btn-primary text-center">
                  <Play className="h-4 w-4 mr-2" />
                  {user?.role === 'student' ? 'Start Test' : 'Preview'}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
