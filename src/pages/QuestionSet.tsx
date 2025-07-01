// QuestionSetComponent.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileQuestion } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

interface QuestionSet {
  _id: string;
  name: string;
  examId: string;
  subjectId: string;
  chapterId: string;
  instituteId: string[];
  isActive: boolean;
  createdBy: string;
  lastUpdatedBy?: string;
  createdAt: string;
}

const QuestionSetComponent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [examsData, setExamsData] = useState<Exam[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    examId: '',
    subjectId: '',
    chapterId: '',
  });

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/questionset/all');
      setQuestionSets(res.data.questionSets);
    } catch (err) {
      toast.error('Failed to fetch question sets');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsData = async () => {
    try {
      const res = await axios.get('/exams/subjects-chapters');
      setExamsData(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch exam structure');
    }
  };

  useEffect(() => {
    fetchQuestionSets();
    fetchExamsData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/questionset/create', {
        ...formData,
        createdBy: user?.id,
        instituteId: user?.['instituteId'] ? [user['instituteId']] : [],
      });
      toast.success('Question Set created');
      setFormData({ name: '', examId: '', subjectId: '', chapterId: '' });
      setShowModal(false);
      fetchQuestionSets();
    } catch (err) {
      toast.error('Failed to create question set');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question set?')) return;
    try {
      await axios.delete(`/questionsets/${id}`);
      toast.success('Deleted successfully');
      fetchQuestionSets();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleQuestionSetClick = (qs: QuestionSet) => {
    // navigate('/questions', {
    //   state: {
    //     examId: qs.examId,
    //     subjectId: qs.subjectId,
    //     chapterId: qs.chapterId,
    //     questionSetId: qs._id,
    //   },
    // });
    const examName = getExamName(qs.examId);
    const subjectName = getSubjectName(qs.examId, qs.subjectId);
    const chapterName = getChapterName(qs.examId, qs.subjectId, qs.chapterId);
    const questionSetName = qs.name;
    const questionSetId = qs._id;
    localStorage.setItem('questionMeta', JSON.stringify({ examName, subjectName, chapterName, questionSetId }));


    navigate('/questions');

  };

  const getExamName = (id: string) => examsData.find(e => e._id === id)?.name || id;
  const getSubjectName = (eid: string, sid: string) => examsData.find(e => e._id === eid)?.subjects.find(s => s._id === sid)?.name || sid;
  const getChapterName = (eid: string, sid: string, cid: string) => examsData.find(e => e._id === eid)?.subjects.find(s => s._id === sid)?.chapters.find(c => c._id === cid)?.name || cid;

  const selectedExam = examsData.find((exam) => exam._id === formData.examId);
  const selectedSubject = selectedExam?.subjects.find((sub) => sub._id === formData.subjectId);

  return (
    <div className="p-4 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Question Sets</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-1" /> Add Question Set
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading question sets..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionSets.map((qs) => (
            <div key={qs._id} className="card p-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">{qs.name}</h2>
                <button
                  onClick={() => handleDelete(qs._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Exam: {getExamName(qs.examId)}</p>
              <p className="text-sm text-gray-600">Subject: {getSubjectName(qs.examId, qs.subjectId)}</p>
              <p className="text-sm text-gray-600">Chapter: {getChapterName(qs.examId, qs.subjectId, qs.chapterId)}</p>
              <div className="mt-4 flex justify-end">
                <button className="btn btn-secondary" onClick={() => handleQuestionSetClick(qs)}>
                  <FileQuestion className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-16 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Question Set</h2>
              <button className="text-gray-500" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                className="input"
                placeholder="Question Set Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <select
                className="input"
                value={formData.examId}
                onChange={(e) =>
                  setFormData({ name: formData.name, examId: e.target.value, subjectId: '', chapterId: '' })
                }
                required
              >
                <option value="">Select Exam</option>
                {examsData.map((exam) => (
                  <option key={exam._id} value={exam._id}>{exam.name}</option>
                ))}
              </select>

              <select
                className="input"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value, chapterId: '' })
                }
                required
                disabled={!formData.examId}
              >
                <option value="">Select Subject</option>
                {selectedExam?.subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>

              <select
                className="input"
                value={formData.chapterId}
                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                required
                disabled={!formData.subjectId}
              >
                <option value="">Select Chapter</option>
                {selectedSubject?.chapters.map((chap) => (
                  <option key={chap._id} value={chap._id}>{chap.name}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
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

export default QuestionSetComponent;
