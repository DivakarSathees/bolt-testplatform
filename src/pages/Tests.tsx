import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Search, Filter, Clock, FileText, Users,
  Calendar, Edit, Trash2, Play
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Test {
  _id: string;
  name: string;
  // description: string;
  examName: string;
  subject: string;
  difficulty: string;
  duration: number;
  examId: string; // ID of the exam this test belongs to
  subjectId: string;
  // totalMarks: number;
  questions?: any[];
  // startDate: string;
  // endDate: string;
  allowedCenters: string[]; // Array of center IDs
  createdBy: any;
  createdAt: string;
  questionCount: number; // Optional for displaying in UI
}


interface Chapter {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
  chapters: Chapter[];
}

interface Exam {
  _id: string;
  name: string;
  subjects: Subject[];
}

const Tests: React.FC = () => {
  const { user } = useAuth();
    const navigate = useNavigate(); // ✅ initialize navigate
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    // description: '',
    examName: 'JEE',
    subject: 'Physics',
    difficulty: 'Medium',
    duration: 60,
    examId: '', // ID of the exam this test belongs to
    subjectId:'',
    // totalMarks: 100,
    // startDate: '',
    // endDate: '',
    allowedCenters: [] as string[], 
  });
const [availableCenters, setAvailableCenters] = useState<{ _id: string, name: string }[]>([]);

  useEffect(() => {
    fetchTests();
      fetchCenters(); // fetch centers too

  }, [filterType, filterSubject]);

  const fetchCenters = async () => {
  try {
    const res = await axios.get('/centers'); // adjust route if needed
    setAvailableCenters(res.data.centers);
  } catch (err) {
    console.error('Failed to fetch centers:', err);
    toast.error('Failed to load centers');
  }
};

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      console.log(params);
      
      if (filterType) params.append('type', filterType);
      if (filterSubject) params.append('subject', filterSubject);

      const response = await axios.get(`/tests?${params.toString()}`);
      setTests(response.data.tests);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      await axios.delete(`/tests/${testId}`);
      toast.success('Test deleted successfully');
      fetchTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast.error('Failed to delete test');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    // const { name, value } = e.target;
    
    // setFormData(prev => ({
    //   ...prev,
    //   [name]: value
    // }));
    const { name, value, type, checked } = e.target as HTMLInputElement;

  if (name === 'allowedCenters') {
    const selected = [...formData.allowedCenters];
    if (checked) {
      selected.push(value);
    } else {
      const index = selected.indexOf(value);
      if (index > -1) selected.splice(index, 1);
    }
    setFormData(prev => ({ ...prev, allowedCenters: selected }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/exams/subjects-chapters');
      // Assuming the response contains an array of subjects
      setExams(res.data.data);
      // You can set this to state if needed
      // console.log('Fetched subjects:', subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load exams and subjects');
    }
  }

  const handleCreateTest = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const payload = {
      name: formData.name,
      examName: formData.examName,
      subject: formData.subject,
      difficulty: formData.difficulty,
      duration: formData.duration,
      subjectId: formData.subjectId,
      allowedCenters: formData.allowedCenters || []
    };

    // Only include examId if it's a real one
    if (formData.examId === 'Mock' || formData.examId === 'Practice') {
      payload['examId'] = '';
    } else {
      payload['examId'] = formData.examId;
    }
    console.log(payload);
    // return
    

    const response = await axios.post('/tests', payload);

    const newTestId = response.data.test._id;
    toast.success('Test created successfully');

    setShowCreateModal(false);

    // Reset form
    setFormData({
      name: '',
      examName: 'JEE',
      subject: 'Physics',
      difficulty: 'Medium',
      duration: 60,
      examId: '',
      subjectId: '',
      allowedCenters: []
    });

    // Navigate to add questions
    navigate(`/test/${newTestId}/add-questions`);
  } catch (error) {
    console.error('Create test failed:', error);
    toast.error('Failed to create test');
  }
};


  const filteredTests = tests
  // .filter(test =>
  //   // test.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   test?.title.toLowerCase().includes(searchTerm.toLowerCase())
  //   // test.description.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const canCreateTest = ['superadmin', 'contentadmin', 'trainer'].includes(user?.role || '');
  const canEditTest = ['superadmin', 'contentadmin'].includes(user?.role || '');

  if (loading) return <LoadingSpinner text="Loading tests..." />;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tests</h1>
          <p className="text-gray-600 mt-1">Manage and take tests</p>
        </div>
        {canCreateTest && (
          <button
            onClick={() => {
              fetchSubjects();
              setShowCreateModal(true)}
            }
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Test
          </button>
        )}
      </div>

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

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => {
          // const isActive = new Date() >= new Date(test.startDate) && new Date() <= new Date(test.endDate);
          // const isUpcoming = new Date() < new Date(test.startDate);
          // const isExpired = new Date() > new Date(test.endDate);

          return (
            <div key={test._id} className="card p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.name}</h3>
                  {/* <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p> */}
                </div>
                {canEditTest && (
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteTest(test._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
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

                {/* <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{test.totalMarks}</span>
                </div> */}

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
                {/* <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Start: {new Date(test.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(test.endDate).toLocaleDateString()}</span>
                </div> */}

                {user?.role === 'student' ? (
                  <div className="space-y-2">
                    { (
                      <Link to={`/test/${test._id}`} className="w-full btn btn-primary text-center">
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </Link>
                    )}
                    {/* {isUpcoming && (
                      <div className="w-full btn btn-secondary cursor-not-allowed opacity-50">
                        <Calendar className="h-4 w-4 mr-2" />
                        Upcoming
                      </div>
                    )}
                    {isExpired && (
                      <div className="w-full btn btn-secondary cursor-not-allowed opacity-50">
                        Test Expired
                      </div>
                    )} */}
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link to={`/results?testId=${test._id}`} className="flex-1 btn btn-secondary text-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      Results
                    </Link>
                    <Link to={`/test/${test._id}`} className="flex-1 btn btn-primary text-center text-sm">
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType || filterSubject
              ? 'Try adjusting your search or filters'
              : 'No tests have been created yet'}
          </p>
        </div>
      )}

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Test</h2>
            <form onSubmit={handleCreateTest} className="space-y-4 max-h-[80vh] overflow-y-auto">
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="name" className="input w-full" required />
              {/* <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="input w-full" /> */}
              <div className="grid grid-cols-2 gap-4">
                {/* <select name="examName" value={formData.examName} onChange={handleInputChange} className="input">
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="Mock">Mock</option>
                  <option value="Practice">Practice</option>
                </select> */}
                <select
                  className="input"
                  value={formData.examId}
                  onChange={(e) => {
                    const selectedExamId = e.target.value;
                    const selectedExam = exams.find(exam => exam._id === selectedExamId);

                    setFormData(prev => ({
                      ...prev,
                      examId: selectedExamId,
                      examName: selectedExam?.name || selectedExamId,  // Fallback if "Mock" or "Practice"
                      subjectId:''
                    }));
                  }}
                  required
                >
                  <option value="">Select Exam</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>{exam.name}</option>
                  ))}
                  {/* <option value="Mock">Mock</option>
                  <option value="Practice">Practice</option> */}
                </select>



                {/* <select name="subject" value={formData.subject} onChange={handleInputChange} className="input">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Mixed">Mixed</option>
                </select> */}

                <select
                  name="subjectId"
                  value={formData.subjectId}
                  className="input"
                  onChange={(e) => {
                    const selectedSubjectId = e.target.value;
                    const selectedExam = exams.find(exam => exam._id === formData.examId);
                    const selectedSubject = selectedExam?.subjects.find(sub => sub._id === selectedSubjectId);

                    setFormData(prev => ({
                      ...prev,
                      subjectId: selectedSubjectId,
                      subject: selectedSubject?.name || selectedSubjectId
                    }));

                  }}
                  required
                  disabled={!formData.examName}
                  >
                  <option value="">Select Subject</option>
                  {exams.find(exam => exam._id === formData.examId)?.subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                  {/* <option value="Mixed">Mixed</option> */}
                  {/* <option value="Chemistry">Chemistry</option> */}
                  </select>

                 
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="input">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} className="input" placeholder="Duration (minutes)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} className="input" placeholder="Total Marks" />
                <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="input" /> */}
              </div>
              {/* <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="input w-full" /> */}
              <div>
  <label className="font-medium text-sm text-gray-700 mb-1">Assign to Centers</label>
  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
    {availableCenters.map(center => (
      <label key={center._id} className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="allowedCenters"
          value={center._id}
          checked={formData.allowedCenters.includes(center._id)}
          onChange={handleInputChange}
        />
        {center.name}
      </label>
    ))}
  </div>
</div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Tests;
