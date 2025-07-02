import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  Tag,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';

interface Question {
  _id: string;
  question: string;
  type: 'MCQ' | 'Numerical' | 'True/False';
  options: Array<{ text: string; isCorrect: boolean }>;
  subject: string;
  chapter: string;
  correctAnswer: string;
  explanation: string;
  marks: number;
  negativeMarks: number;
  image?: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionSetId: string;
  isActive: boolean;
  createdBy: any;
  createdAt: string;
}

const Questions: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [questionSetId, setQuestionSetId] = useState('');


  const [formData, setFormData] = useState({
    question: '',
    type: 'MCQ',
    subject: subjectName || 'Physics',
    chapter: chapterName || '',
    // topic: '',
    difficulty: 'Medium',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      // { text: '', isCorrect: false },
      // { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    explanation: '',
    marks: 4,
    negativeMarks: 1,
    tags: ''
  });

  useEffect(() => {
  // This will run every time the route changes
  console.log('Current pathname:', location.pathname);
  
  if (!location.pathname.startsWith('/questions')) {
    localStorage.removeItem('questionMeta');
  }
}, [location.pathname]);


  useEffect(() => {
  const saved = localStorage.getItem('questionMeta');
  if (saved) {
    const { examName, subjectName, chapterName, questionSetId } = JSON.parse(saved);
    // if questionSetId is not there then navigate to /exam
    if (!questionSetId) {
      navigate('/questionsets');
      return;
    }
    console.log('saved questionMeta:', examName, subjectName, chapterName, questionSetId);
    
    setExamName(examName);
    setSubjectName(subjectName);
    setChapterName(chapterName);
    setQuestionSetId(questionSetId);
  } else {
    // if questionSetId is not there then navigate to /exam
    navigate('/questionsets');
    return;
  }
   // if questionsetid in not there in localstorage then navigate to /exam

  
}, []);


  useEffect(() => {
    
    fetchQuestions();
  }, [filterSubject, filterDifficulty, questionSetId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterSubject) params.append('subject', filterSubject);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);
      // pass qestionssetid to enpoint
      
      const response = await axios.get(`/questions/set/${questionSetId}`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      // toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const questionData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        options: formData.options.map(option => ({
          ...option,
          isCorrect: option.text === formData.correctAnswer
        })),
        questionSetId
      };


      if (editingQuestion) {
        await axios.put(`/questions/${editingQuestion._id}`, questionData);
        toast.success('Question updated successfully');
      } else {
        await axios.post('/questions', questionData);
        toast.success('Question created successfully');
      }

      setShowCreateModal(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      console.error('Failed to save question:', error);
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      type: question.type,
      subject: question.subject,
      chapter: question.chapter || '',
      difficulty: question.difficulty,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      tags: question.tags.join(', ')
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`/questions/${questionId}`);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'MCQ',
      subject: 'Physics',
      chapter: '',
      difficulty: 'Medium',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        // { text: '', isCorrect: false },
        // { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      explanation: '',
      marks: 4,
      negativeMarks: 1,
      tags: ''
    });
  };

  const addOption = () => {
  setFormData(prev => ({
    ...prev,
    options: [...prev.options, { text: '', isCorrect: false }]
  }));

};

const removeOption = (index: number) => {
  const newOptions = [...formData.options];
  newOptions.splice(index, 1);
  setFormData({
    ...formData,
    options: newOptions,
    // Reset correct answer if it was the one removed
    correctAnswer:
      formData.correctAnswer === formData.options[index].text
        ? ''
        : formData.correctAnswer
  });
};



  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const filteredQuestions = questions.filter(question =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canCreateQuestion = ['superadmin', 'contentadmin', 'trainer'].includes(user?.role || '');
  const canEditQuestion = ['superadmin', 'contentadmin'].includes(user?.role || '');

  if (loading) return <LoadingSpinner text="Loading questions..." />;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">Manage questions for tests</p>
        </div>
         <div className="flex items-center space-x-4">
    <button
      onClick={() => {
        window.history.back()
        localStorage.removeItem('questionMeta');
      }}
      className="btn btn-secondary"
    >
      ⬅ Back
    </button>
        {canCreateQuestion && (
          <button
            onClick={() => {
              resetForm();
              setEditingQuestion(null);
              setShowCreateModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Question
          </button>
        )}
      </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search questions..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
          </select>
          
          <select
            className="input"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <button
            onClick={() => {
              setFilterSubject('');
              setFilterDifficulty('');
              setSearchTerm('');
            }}
            className="btn btn-secondary"
          >
            <Filter className="h-5 w-5 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {/* total question count from res */}
        <div className="text-sm text-gray-600">
          Total Questions: {filteredQuestions.length}
        </div>
        {filteredQuestions.map((question) => (
          <div key={question._id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    question.subject === 'Physics' ? 'bg-blue-100 text-blue-800' :
                    question.subject === 'Chemistry' ? 'bg-green-100 text-green-800' :
                    question.subject === 'Mathematics' ? 'bg-purple-100 text-purple-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {subjectName || question.subject}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {question.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    {chapterName}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {question.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-sm ${
                        option.text === question.correctAnswer
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option.text}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Marks: +{question.marks}</span>
                  <span>Negative: -{question.negativeMarks}</span>
                  <span>Type: {question.type}</span>
                  {question.tags.length > 0 && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {question.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="mr-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{question.tags.length - 2} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(canEditQuestion || (user?.role === 'trainer' && question.createdBy._id === user.id)) && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(question)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600">
            {searchTerm || filterSubject || filterDifficulty
              ? 'Try adjusting your search or filters'
              : 'No questions have been created yet'}
          </p>
        </div>
      )}

      {/* Create/Edit Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingQuestion ? 'Edit Question' : `Create New Question for ${examName || 'Exam'}`}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingQuestion(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Selector */}

              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="MCQ">MCQ</option>
                  <option value="Numerical">Numerical</option>
                  <option value="True/False">True/False</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Subject</label>
                   <input
                    type="text"
                    className="input"
                    value={subjectName}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    readOnly
                  />
                  {/* <select
                    className="input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    aria-readonly
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select> */}
                </div>

                <div>
                  <label className="label">Difficulty</label>
                  <select
                    className="input"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="label">Chapter</label>
                  <input
                    type="text"
                    className="input"
                    value={chapterName}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="label">Question</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              {/* Conditionally render options */}
              {formData.type === 'True/False' ? (
                <div>
                  <label className="label">Select Correct Answer</label>
                  <div className="flex space-x-4">
                    {['True', 'False'].map((val) => (
                      <label key={val} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="tf"
                          value={val}
                          checked={formData.correctAnswer === val}
                          onChange={() => setFormData({ ...formData, correctAnswer: val,
                            options: [
                                { text: 'True', isCorrect: val === 'True' },
                                { text: 'False', isCorrect: val === 'False' }
                              ]
                           })}
                        />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (

              <div>
                <label className="label">Options</label>
                <div className="space-y-3">
                  {/* {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700 w-8">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        className="input flex-1"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option.text}
                        checked={formData.correctAnswer === option.text}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        className="w-4 h-4 text-primary-600"
                      />
                    </div>
                  ))} */}

                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700 w-8">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        className="input flex-1"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option.text}
                        checked={formData.correctAnswer === option.text}
                        onChange={(e) =>
                          setFormData({ ...formData, correctAnswer: e.target.value })
                        }
                        className="w-4 h-4 text-primary-600"
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove Option"
                        >
                          ×
                        </button>
                      )}
                      {/* {index === formData.options.length - 1  && (
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-blue-500 hover:text-blue-700"
                          title="Add Option"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )} */}
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                          type="button"
                          onClick={addOption}
                          className="text-blue-500 hover:text-blue-700"
                          title="Add Option"
                          style={{ display: 'ruby' }}
                        >
                          <Plus className="h-4 w-4" /> Add Option
                        </button>
                        </div>

                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>
               )}

              <div>
                <label className="label">Explanation (Optional)</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Marks</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="label">Negative Marks</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
                    min="0"
                    step="0.25"
                    required
                  />
                </div>

                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="mechanics, waves, optics"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingQuestion(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;