import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Search, Filter, Edit, Trash2, BookOpen, Users
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Course {
  _id: string; // Example ID, replace with actual type
  name: string;
  instituteId?: string[];
  testIds: string[];
  enrolledBatch: string[];
  isActive: number;
  createdAt: string;
  updatedAt: string;
}


const Courses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    instituteId: [] as string[],
    enrolledBatch: [] as string[]
  });

  const [availableInstitutes, setAvailableInstitutes] = useState<{ _id: string, name: string }[]>([]);
  const [availableBatches, setAvailableBatches] = useState<{ _id: string, name: string }[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchInstitutes();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // based on role, fetch courses that is, // superadmin - all courses
      // contentadmin - all courses
        // trainer - courses assigned to them
        // student - courses they are enrolled in
        // centeradmin - courses assigned to their center
        // const res = await axios.get('/courses', {
        //     params: {
        //         // role: user?.role,
        //         instituteId: user?.center?._id // Assuming user has instituteId
        //     }
        //     });
    // --- Mock Data ---
    const mockCourses: Course[] = [
      {
        _id: "64ee123456abcdef12345678",
        name: "NEET 2025 Foundation",
        instituteId: ["685c4099c51287779f283c05"],
        testIds: ["64ee223456abcdef22222222", "64ee223456abcdef33333333"],
        enrolledBatch: ["64ee323456abcdef44444444"],
        isActive: 1,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-06-17T10:30:00Z"
      },
    //   {
    //     _id: "64ee123456abcdef87654321",
    //     name: "JEE Advanced Crash Course",
    //     instituteId: ["64ee123456abcdef111"],
    //     testIds: [],
    //     enrolledBatch: [],
    //     isActive: 1,
    //     createdAt: "2025-03-01T00:00:00Z",
    //     updatedAt: "2025-06-20T10:30:00Z"
    //   }
    ];

    setCourses(mockCourses);

    //   setCourses(res.data.courses);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
    //   const res = await axios.get('/institutes');
    const mockInstitutes = [
      {
        _id: "64ee123456abcdef11111111",
        name: "Elite Medical Academy"
      },
      {
        _id: "64ee123456abcdef22222222",
        name: "IIT Star Academy"
      }
    ];
    setAvailableInstitutes(mockInstitutes);
    //   setAvailableInstitutes(res.data.institutes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load institutes');
    }
  };

  const fetchBatches = async () => {
    try {
    //   const res = await axios.get('/batches');
    //   setAvailableBatches(res.data.batches);
     const mockBatches = [
      {
        _id: "64ee323456abcdef44444444",
        name: "2025 NEET Morning Batch"
      },
      {
        _id: "64ee323456abcdef55555555",
        name: "2025 JEE Evening Batch"
      }
    ];
    setAvailableBatches(mockBatches);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batches');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name === 'instituteId' || name === 'enrolledBatch') {
      const selected = [...formData[name]];
      if (checked) {
        selected.push(value);
      } else {
        const index = selected.indexOf(value);
        if (index > -1) selected.splice(index, 1);
      }
      setFormData(prev => ({ ...prev, [name]: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/courses', formData);
      toast.success('Course created successfully');
      setShowCreateModal(false);
      fetchCourses();
      setFormData({ name: '', instituteId: [], enrolledBatch: [] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await axios.delete(`/courses/${courseId}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = ['superadmin', 'trainer'].includes(user?.role || '');
  const canEdit = ['superadmin'].includes(user?.role || '');
  const canManage = ['superadmin', 'trainer', 'centeradmin'].includes(user?.role || '');

  if (loading) return <LoadingSpinner text="Loading courses..." />;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-gray-600">Manage your courses and assignments</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus className="mr-2 h-5 w-5" />
            Create Course
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card p-4 flex items-center gap-4">
        <Search className="text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search courses..."
          className="input flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
          <Filter className="h-4 w-4 mr-2" />
          Clear
        </button>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course._id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold">{course.name}</h2>
              {canEdit && (
                <div className="flex gap-2">
                  <button className="hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteCourse(course._id)} className="hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Institutes:</span>
                <span>{course.instituteId?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Batches:</span>
                <span>{course.enrolledBatch.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tests:</span>
                <span>{course.testIds.length}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to={`/course/${course._id}/details`} className="btn btn-secondary text-sm">
                <BookOpen className="h-4 w-4 mr-1" />
                View
              </Link>
              {canManage && (
              <Link to={`/course/${course._id}/enrollments`} className="btn btn-primary text-sm">
                <Users className="h-4 w-4 mr-1" />
                Manage
              </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <BookOpen className="w-10 h-10 mx-auto mb-2" />
          <p>No courses found</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4 max-h-[80vh] overflow-y-auto">
              <input
                name="name"
                placeholder="Course name"
                className="input w-full"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              {/* Institute Selection */}
              <div>
                <label className="text-sm font-medium">Assign Institutes</label>
                <div className="grid grid-cols-2 gap-2 border p-2 rounded max-h-40 overflow-y-auto">
                  {availableInstitutes.map(i => (
                    <label key={i._id} className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="instituteId"
                        value={i._id}
                        checked={formData.instituteId.includes(i._id)}
                        onChange={handleInputChange}
                      />
                      {i.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Batch Selection */}
              <div>
                <label className="text-sm font-medium">Enroll Batches</label>
                <div className="grid grid-cols-2 gap-2 border p-2 rounded max-h-40 overflow-y-auto">
                  {availableBatches.map(b => (
                    <label key={b._id} className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="enrolledBatch"
                        value={b._id}
                        checked={formData.enrolledBatch.includes(b._id)}
                        onChange={handleInputChange}
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
