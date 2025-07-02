// // This component manages Exams, Subjects, and Chapters with role-based permissions and styled course-like cards
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { Plus, Edit, BookOpen, Users } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { Link } from 'react-router-dom';

// // Define types for Exam, Subject, and Chapter
// type Chapter = {
//   _id: string;
//   name: string;
// };

// type Subject = {
//   _id: string;
//   name: string;
//   chapters: Chapter[];
// };

// type Exam = {
//   _id: string;
//   name: string;
//   subjects: Subject[];
//   instituteId?: string[];
// };

// const ExamManager = () => {
//   const { user } = useAuth();
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showExamModal, setShowExamModal] = useState(false);
//   const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
//   const [newExamName, setNewExamName] = useState('');
//   const [newSubject, setNewSubject] = useState('');
//   const [newChapter, setNewChapter] = useState('');
//   const [selectedSubjectId, setSelectedSubjectId] = useState('');

//   useEffect(() => {
//     fetchExams();
//   }, []);

//   const fetchExams = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get('/exams/subjects-chapters');
//       setExams(res.data.data);
//     } catch (err) {
//       toast.error('Failed to load exams');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateExam = async () => {
//     if (!newExamName.trim()) return;
//     try {
//       await axios.post('/exam/create', {
//         name: newExamName,
//         createdBy: user?.id,
//         instituteId: user?.['instituteId'] ? [user['instituteId']] : []
//       });
//       toast.success('Exam created');
//       setNewExamName('');
//       fetchExams();
//     } catch (err) {
//       toast.error('Failed to create exam');
//     }
//   };

//   const handleAddSubject = async () => {
//     if (!selectedExam || !newSubject.trim()) return;
//     try {
//       await axios.post('/subject/create', {
//         name: newSubject,
//         examId: selectedExam._id,
//         instituteId: selectedExam.instituteId,
//         createdBy: user?.id
//       });
//       toast.success('Subject added');
//       setNewSubject('');
//       await refreshSelectedExam();
//     } catch (err) {
//       toast.error('Failed to add subject');
//     }
//   };

//   const handleAddChapter = async () => {
//     if (!selectedExam || !selectedSubjectId || !newChapter.trim()) return;
//     try {
//       await axios.post('/chapter/create', {
//         name: newChapter,
//         examId: selectedExam._id,
//         subjectId: selectedSubjectId,
//         instituteId: selectedExam.instituteId,
//         createdBy: user?.id
//       });
//       toast.success('Chapter added');
//       setNewChapter('');
//       await refreshSelectedExam();
//     } catch (err) {
//       toast.error('Failed to add chapter');
//     }
//   };

//   const refreshSelectedExam = async () => {
//     try {
//       const res = await axios.get('/exams/subjects-chapters');
//       const updatedExams = res.data.data;
//       setExams(updatedExams);
//       const updated = updatedExams.find(e => e._id === selectedExam?._id);
//       setSelectedExam(updated);
//     } catch (err) {
//       console.error('Failed to refresh selected exam', err);
//     }
//   };

//   const canManage = ['superadmin', 'centeradmin'].includes(user?.role || '');
//   const canView = ['trainer', 'student'].includes(user?.role || '');

//   return (
//     <div className="p-4 space-y-6 fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Exams</h1>
//           <p className="text-gray-600">Manage your exams and syllabus structure</p>
//         </div>
//         {canManage && (
//           <div className="flex gap-2">
//             <input
//               className="input"
//               placeholder="Exam name"
//               value={newExamName}
//               onChange={(e) => setNewExamName(e.target.value)}
//             />
//             <button className="btn btn-primary" onClick={handleCreateExam}>
//               <Plus className="h-4 w-4" />
//               Create Exam
//             </button>
//           </div>
//         )}
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {exams.map((exam) => (
//             <div key={exam._id} className="card p-6">
//               <div className="flex items-start justify-between mb-3">
//                 <h2 className="text-lg font-semibold">{exam.name}</h2>
//                 {canManage && (
//                   <button onClick={() => {
//                     setSelectedExam(exam);
//                     setShowExamModal(true);
//                   }} className="hover:text-blue-600">
//                     <Edit className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>
//               <div className="text-sm text-gray-600 space-y-2">
//                 <div className="flex justify-between">
//                   <span>Subjects:</span>
//                   <span>{exam.subjects.length}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Chapters:</span>
//                   <span>{exam?.subjects.reduce((sum, s) => sum + s.chapters.length, 0)}</span>
//                 </div>
//               </div>
//               {canView && (
//               <div className="mt-4 flex gap-2" style={{ direction: 'rtl'}}>
//                 <button
//                   onClick={() => {
//                     setSelectedExam(exam);
//                     setShowExamModal(true);
//                   }}
//                   className="btn btn-secondary text-sm"
//                 >
//                   <BookOpen className="h-4 w-4 mr-1" />
//                 </button>
//                 {/* {canManage && (
//                   <Link to={`/exam/${exam._id}/manage`} className="btn btn-primary text-sm">
//                     <Users className="h-4 w-4 mr-1" /> Manage
//                   </Link>
//                 )} */}
//               </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {showExamModal && selectedExam && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-16 z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">{selectedExam.name}</h2>
//               <button className="text-gray-500" onClick={() => setShowExamModal(false)}>
//                 ✕
//               </button>
//             </div>

//             <div>
//               {selectedExam.subjects.map((subj) => (
//                 <div key={subj._id} className="mb-4">
//                   <h3 className="font-semibold text-md text-blue-700">{subj.name}</h3>
//                   <ul className="list-disc ml-5 text-sm text-gray-700">
//                     {subj.chapters.map((chap) => (
//                       <li key={chap._id}>{chap.name}</li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>

//             {canManage && (
//               <>
//                 <div className="mt-6">
//                   <label className="block text-sm font-medium">Add Subject</label>
//                   <div className="flex gap-2 mt-1">
//                     <input
//                       className="input"
//                       placeholder="Subject name"
//                       value={newSubject}
//                       onChange={(e) => setNewSubject(e.target.value)}
//                     />
//                     <button className="btn btn-primary" onClick={handleAddSubject}>
//                       <Plus className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <label className="block text-sm font-medium">Add Chapter</label>
//                   <select
//                     className="input mt-1 mb-1"
//                     value={selectedSubjectId}
//                     onChange={(e) => setSelectedSubjectId(e.target.value)}
//                   >
//                     <option value="">Select subject</option>
//                     {selectedExam.subjects.map((s) => (
//                       <option key={s._id} value={s._id}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="flex gap-2">
//                     <input
//                       className="input"
//                       placeholder="Chapter name"
//                       value={newChapter}
//                       onChange={(e) => setNewChapter(e.target.value)}
//                     />
//                     <button className="btn btn-primary" onClick={handleAddChapter}>
//                       <BookOpen className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExamManager;

// This component manages Exams, Subjects, and Chapters with role-based permissions and styled course-like cards
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { set } from 'mongoose';

// Define types for Exam, Subject, and Chapter
type Chapter = {
  _id: string;
  name: string;
};

type Subject = {
  _id: string;
  name: string;
  chapters: Chapter[];
};

type Exam = {
  _id: string;
  name: string;
  subjects: Subject[];
  instituteId?: string[];
};

const ExamManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [newExamName, setNewExamName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [showQuestionSetModal, setShowQuestionSetModal] = useState(false);
  const [qsExamId, setQsExamId] = useState('');
  const [qsSubjectId, setQsSubjectId] = useState('');
  const [qsChapterId, setQsChapterId] = useState('');
  const [institutes, setInstitutes] = useState([]);
  const [instituteId, setInstituteId] = useState<string | null>(null);
  const [questionSet, setQuestionSet] = useState<any>(null);
  const [qsTitle, setQsTitle] = useState('');
  const [qsDescription, setQsDescription] = useState('');

  useEffect(() => {
    // check in localstorage by getting that user key has json string of user with instituteId is null or not
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.instituteId) {
        setInstituteId(user.instituteId);
      }
    }
    fetchExams();
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const res = await axios.get('/centers');
      setInstitutes(res.data.centers);
      // Handle institutes if needed
    } catch (err) {
      toast.error('Failed to load institutes');
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/exams/subjects-chapters');
      setExams(res.data.data);
    } catch (err) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    if (!newExamName.trim()) return;
    try {
      await axios.post('/exam/create', {
        name: newExamName,
        createdBy: user?.id,
        instituteId: user?.['instituteId'] ? [user['instituteId']] : []
      });
      toast.success('Exam created');
      setNewExamName('');
      fetchExams();
    } catch (err) {
      toast.error('Failed to create exam');
    }
  };

  const handleAddSubject = async () => {
    if (!selectedExam || !newSubject.trim()) return;
    try {
      await axios.post('/subject/create', {
        name: newSubject,
        examId: selectedExam._id,
        instituteId: selectedExam.instituteId,
        createdBy: user?.id
      });
      toast.success('Subject added');
      setNewSubject('');
      await refreshSelectedExam();
    } catch (err) {
      toast.error('Failed to add subject');
    }
  };

  const handleAddChapter = async () => {
    if (!selectedExam || !selectedSubjectId || !newChapter.trim()) return;
    try {
      await axios.post('/chapter/create', {
        name: newChapter,
        examId: selectedExam._id,
        subjectId: selectedSubjectId,
        instituteId: selectedExam.instituteId,
        createdBy: user?.id
      });
      toast.success('Chapter added');
      setNewChapter('');
      await refreshSelectedExam();
    } catch (err) {
      toast.error('Failed to add chapter');
    }
  };

  const handleCreateQuestionSet = async () => {
    if (!qsTitle.trim()) return;
    try {
      const res = await axios.post('/questionset/create', {
        name: qsTitle,
        description: qsDescription,
        examId: qsExamId,
        subjectId: qsSubjectId,
        chapterId: qsChapterId,
        createdBy: user?.id,
        instituteId: instituteId || (user?.['instituteId'] ? [user['instituteId']] : [])
      });

       const createdQsId = res.data.questionSetId;

      toast.success('Question Set created');
      setShowQuestionSetModal(false);
      setQsTitle('');
      setQsDescription('');

      // Prepare and save metadata in localStorage
    const examName = getExamName(qsExamId);
    const subjectName = getSubjectName(qsExamId, qsSubjectId);
    const chapterName = getChapterName(qsExamId, qsSubjectId, qsChapterId);
    const questionSetId = createdQsId;

    localStorage.setItem(
      'questionMeta',
      JSON.stringify({ examName, subjectName, chapterName, questionSetId })
    );

    // Navigate to /questions
    navigate('/questions');
    } catch (err) {
      toast.error('Failed to create question set');
    }
  };

  const fetchQuestionSetsByChapter = async (chapterId: string) => {
    try {
      const res = await axios.get(`/questionSets/chapter/${chapterId}`);
      if (res.data.length === 0) {
        setQuestionSet(null);
        toast.error('No question sets found for this chapter');
      } else {
        setQuestionSet(res.data);
        // You can handle the fetched question sets here if needed
      }
    } catch (err) {
      toast.error('Failed to fetch question sets');
    }
  };

    const getExamName = (id: string) => exams.find(e => e._id === id)?.name || id;
  const getSubjectName = (eid: string, sid: string) => exams.find(e => e._id === eid)?.subjects.find(s => s._id === sid)?.name || sid;
  const getChapterName = (eid: string, sid: string, cid: string) => exams.find(e => e._id === eid)?.subjects.find(s => s._id === sid)?.chapters.find(c => c._id === cid)?.name || cid;


  const refreshSelectedExam = async () => {
    try {
      const res = await axios.get('/exams/subjects-chapters');
      const updatedExams = res.data.data;
      setExams(updatedExams);
      const updated = updatedExams.find(e => e._id === selectedExam?._id);
      setSelectedExam(updated || null);
    } catch (err) {
      console.error('Failed to refresh selected exam', err);
    }
  };

  const openQuestionSetModal = (examId: string, subjectId: string, chapterId: string) => {
    fetchQuestionSetsByChapter(chapterId);
    setQsExamId(examId);
    setQsSubjectId(subjectId);
    setQsChapterId(chapterId);
    setShowQuestionSetModal(true);
  };

  const canManage = ['superadmin', 'centeradmin'].includes(user?.role || '');
  const canView = ['trainer', 'student'].includes(user?.role || '');

  return (
    <div className="p-4 space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exams</h1>
          <p className="text-gray-600">Manage your exams and syllabus structure</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Exam name"
              value={newExamName}
              onChange={(e) => setNewExamName(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleCreateExam}>
              <Plus className="h-4 w-4" />
              Create Exam
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam._id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold">{exam.name}</h2>
                {canManage && (
                  <button onClick={() => {
                    setSelectedExam(exam);
                    setShowExamModal(true);
                  }} className="hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Subjects:</span>
                  <span>{exam.subjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chapters:</span>
                  <span>{exam.subjects.reduce((sum, s) => sum + s.chapters.length, 0)}</span>
                </div>
              </div>
              {canView && (
                <div className="mt-4 flex gap-2" style={{ direction: 'rtl'}}>
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowExamModal(true);
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-16 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedExam.name}</h2>
              <button className="text-gray-500" onClick={() => setShowExamModal(false)}>
                ✕
              </button>
            </div>

            <div>
              {selectedExam.subjects.map((subj) => (
                <div key={subj._id} className="mb-4">
                  <h3 className="font-semibold text-md text-blue-700">{subj.name}</h3>
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {canManage && subj.chapters.map((chap) => (
                      <li
                        key={chap._id}
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => openQuestionSetModal(selectedExam._id, subj._id, chap._id)}
                      >
                        {chap.name}
                      </li>
                    ))}
                    {canView && subj.chapters.map((chap) => (
                      <li
                        key={chap._id}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {chap.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {canManage && (
              <>
                <div className="mt-6">
                  <label className="block text-sm font-medium">Add Subject</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      className="input"
                      placeholder="Subject name"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddSubject}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">Add Chapter</label>
                  <select
                    className="input mt-1 mb-1"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                  >
                    <option value="">Select subject</option>
                    {selectedExam.subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder="Chapter name"
                      value={newChapter}
                      onChange={(e) => setNewChapter(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddChapter}>
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showQuestionSetModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Question Set</h2>
              <button className="text-gray-500" onClick={() => setShowQuestionSetModal(false)}>✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateQuestionSet();
              }}
              className="space-y-4"
            >
              {/* include subject name in this modal */}
              <div>
                {/* <label className="block text-sm font-medium">Exam</label> */}
                <span style={{ display: 'flex', justifyContent: 'space-between'}}>
                  {qsExamId ? selectedExam?.name : 'Select an exam'} &rarr; {/*include arrow*/} 
                  {qsSubjectId ? selectedExam?.subjects.find(s => s._id === qsSubjectId)?.name : 'Select a subject'} &rarr; 
                  {qsChapterId ? selectedExam?.subjects.find(s => s.chapters.some(c => c._id === qsChapterId))?.chapters.find(c => c._id === qsChapterId)?.name : 'Select a chapter'}
                </span>
              </div>
              <div>
                {/* <label className="block text-sm font-medium">Question Set Name</label> */}
                <input
                  className="input w-full"
                  placeholder="Question set Name"
                  value={qsTitle}
                  onChange={(e) => setQsTitle(e.target.value)}
                />
              </div>
              {/* display all institude with dropdown if institude id is null else display readonly input with institude name */}
              <div>
                <label className="block text-sm font-medium">Institute</label>
                {instituteId ? (
                  <input
                    className="input w-full"
                    value={institutes.find(i => i['_id'] === instituteId)?.['name'] || 'Unknown Institute'}
                    readOnly
                  />
                ) : (
                  <select
                    className="input w-full"
                    value={instituteId || ''}
                    onChange={(e) => setInstituteId(e.target.value)}
                  >
                    <option value="">Select Institute</option>
                    {institutes.map((inst) => (
                      <option key={inst['_id']} value={inst['_id']}>
                        {inst['name']}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuestionSetModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" onClick={() => setQuestionSet(null)}>Create</button>
              </div>
            </form>
             {/* display questionsets & onclicking the questionset navigate to /questions */}
            {questionSet && questionSet.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Existing Question Sets</h3>
                <ul className="list-disc ml-5 space-y-1">
                  {questionSet.map((qs: any) => (
                    <li key={qs._id} className="cursor-pointer hover:text-blue-600" onClick={() => {
                      setQuestionSet(null);
                      // fetchQuestionSetsByChapter(qs.chapterId);
                      localStorage.setItem('questionMeta', JSON.stringify({
                        examName: getExamName(qsExamId),
                        subjectName: getSubjectName(qsExamId, qsSubjectId),
                        chapterName: getChapterName(qsExamId, qsSubjectId, qsChapterId),
                        questionSetId: qs._id
                      }));
                      navigate('/questions?questionSetId=' + qs._id);
                    }}>
                      {qs.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
              
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManager;
