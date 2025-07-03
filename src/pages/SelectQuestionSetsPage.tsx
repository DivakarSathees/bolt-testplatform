// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface QuestionSet {
//   _id: string;
//   name: string;
//   examId: string;
// }

// interface Question {
//   _id: string;
//   question: string;
//   options: { _id: string; text: string; isCorrect: boolean }[];
// }

// const SelectQuestionSetsPage: React.FC = () => {
//   const { id: testId } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
//   const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
//   const [questionsInSet, setQuestionsInSet] = useState<Question[]>([]);
//   const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

//   useEffect(() => {
//     fetchQuestionSets();
//   }, []);

//   const fetchQuestionSets = async () => {
//     try {
//       const res = await axios.get('/questionset/all');
//       setQuestionSets(res.data.questionSets || []);
//     } catch (err) {
//       toast.error('Failed to load question sets');
//     }
//   };

//   const fetchQuestionsForSet = async (setId: string) => {
//     try {
//       const res = await axios.get(`/questions/set/${setId}`);
//       setQuestionsInSet(res.data.questions || []);
//       setSelectedSetId(setId);
//     } catch (err) {
//       toast.error('Failed to load questions for set');
//     }
//   };

//   const toggleQuestionSelect = (questionId: string) => {
//     setSelectedQuestions(prev =>
//       prev.includes(questionId)
//         ? prev.filter(q => q !== questionId)
//         : [...prev, questionId]
//     );
//   };

//   const handleAddToTest = async () => {
//     try {
//       await axios.patch(`/tests/${testId}/add-questions`, {
//         questionIds: selectedQuestions,
//       });
//       toast.success('Questions added to test');
//       navigate('/tests');
//     } catch (err) {
//       toast.error('Failed to add questions');
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Select Question Sets</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         {questionSets.map((qs) => (
//           <button
//             key={qs._id}
//             onClick={() => fetchQuestionsForSet(qs._id)}
//             className={`p-4 rounded-lg border shadow-sm text-left ${
//               selectedSetId === qs._id
//                 ? 'bg-blue-100 border-blue-500'
//                 : 'bg-white hover:bg-gray-50'
//             }`}
//           >
//             <h2 className="text-lg font-semibold">{qs.name}</h2>
//             <p className="text-sm text-gray-600">Exam: {qs.examId}</p>
//           </button>
//         ))}
//       </div>

//       {selectedSetId && (
//         <div className="border-t pt-6">
//           <h2 className="text-xl font-bold mb-4">Questions in Selected Set</h2>
//           {questionsInSet.length === 0 ? (
//             <p>No questions in this set</p>
//           ) : (
//             <div className="grid grid-cols-1 gap-4">
//               {questionsInSet.map((q) => (
//                 <div
//                   key={q._id}
//                   className={`p-4 border rounded-lg shadow-sm cursor-pointer ${
//                     selectedQuestions.includes(q._id)
//                       ? 'bg-blue-50 border-blue-500'
//                       : 'border-gray-200'
//                   }`}
//                   onClick={() => toggleQuestionSelect(q._id)}
//                 >
//                   <p className="font-medium mb-2">{q.question}</p>
//                   <ul className="list-disc list-inside text-sm mb-2">
//                     {q.options.map((opt) => (
//                       <li key={opt._id}>
//                         {opt.text}{' '}
//                         {opt.isCorrect && (
//                           <span className="text-green-600 font-semibold">
//                             (Correct)
//                           </span>
//                         )}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mt-6 flex justify-end">
//             <button
//               className="btn btn-primary"
//               disabled={selectedQuestions.length === 0}
//               onClick={handleAddToTest}
//             >
//               Add {selectedQuestions.length} Question(s) to Test
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SelectQuestionSetsPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

interface QuestionSet {
  _id: string;
  name: string;
}

interface Question {
  _id: string;
  question: string;
  options: { _id: string; text: string; isCorrect: boolean }[];
  questionSetId?: { _id: string; name: string }; // ✅ Add this
}


const SelectQuestionSetsPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalSetId, setModalSetId] = useState('');
  const [modalQuestions, setModalQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  useEffect(() => {
  fetchQuestionSets();
  if (testId) {
    fetchTestQuestions(testId);
  }
}, []);

const fetchTestQuestions = async (testId: string) => {
  try {
    const res = await axios.get(`/tests/${testId}/questions`);
    const questionsWithSets = res.data.questions || [];
    setSelectedQuestions(questionsWithSets);
  } catch (err) {
    console.error('Failed to fetch test questions', err);
    toast.error('Failed to load test questions');
  }
};


  const fetchQuestionSets = async () => {
    try {
      const res = await axios.get('/questionset/all');
      setQuestionSets(res.data.questionSets || []);
    } catch {
      toast.error('Failed to load question sets');
    }
  };

  const openQuestionSetModal = async (setId: string) => {
    try {
      const res = await axios.get(`/questions/set/${setId}`);
      setModalQuestions(res.data.questions || []);
      setModalSetId(setId);
      setShowModal(true);
    } catch {
      toast.error('Failed to load questions');
    }
  };

  const addToSelectedList = (question: Question) => {
    setSelectedQuestions(prev =>
      prev.some(q => q._id === question._id) ? prev : [...prev, question]
    );
  };

  const removeFromSelectedList = (questionId: string) => {
    setSelectedQuestions(prev => prev.filter(q => q._id !== questionId));
  };

  const handleAddToTest = async () => {
    try {
      await axios.patch(`/tests/${testId}/add-questions`, {
        questionIds: selectedQuestions.map(q => q._id),
      });
      toast.success('Questions added to test');
      navigate('/tests');
    } catch {
      toast.error('Failed to add to test');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT PANEL - Question Sets */}
      <div className="w-1/3 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Question Sets</h2>
        <input
          type="text"
          placeholder="Search sets..."
          className="input w-full mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {questionSets
          .filter(qs => qs.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(qs => (
            <div
              key={qs._id}
              className="p-3 border rounded mb-2 cursor-pointer hover:bg-blue-100"
              onClick={() => openQuestionSetModal(qs._id)}
            >
              {qs.name}
            </div>
          ))}
      </div>

      {/* RIGHT PANEL - Selected Questions */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Selected Questions</h2>
        {selectedQuestions.length === 0 ? (
          <p>No questions selected yet.</p>
        ) : (
          <div className="space-y-4">
            {selectedQuestions.map((q) => (
              <div key={q._id} className="p-4 border rounded shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 italic mb-1">
                        Set: {q['questionSetId']?.name || 'Unknown'}
                        </p>
                    <p className="font-medium">{q.question}</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                      {q.options.map(opt => (
                        <li key={opt._id}>
                          {opt.text}
                          {opt.isCorrect && (
                            <span className="text-green-600 font-semibold ml-1">(Correct)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => removeFromSelectedList(q._id)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="btn btn-primary"
            disabled={selectedQuestions.length === 0}
            onClick={handleAddToTest}
          >
            Add {selectedQuestions.length} Question(s) to Test
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 w-full max-w-4xl rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Questions in Set</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

           {modalQuestions.length === 0 ? (
  <p>No questions in this set.</p>
) : (
  <div className="grid grid-cols-1 gap-4">
    {modalQuestions.map((q) => {
      const isSelected = selectedQuestions.some((sel) => sel._id === q._id);
      return (
        <div
          key={q._id}
          className={`p-4 border rounded-lg shadow-sm cursor-pointer ${
            isSelected ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
          }`}
        //   onClick={() => {
        //     if (isSelected) {
        //         // along with set name
        //       setSelectedQuestions((prev) =>
        //         prev.filter((sel) => sel._id !== q._id)

        //       );
        //     } else {
        //       setSelectedQuestions((prev) => [...prev, q]);
        //     }
        //   }}
        onClick={() => {
            if (isSelected) {
                setSelectedQuestions((prev) =>
                prev.filter((sel) => sel._id !== q._id)
                );
            } else {
                const enrichedQuestion = {
                ...q,
                questionSetId: {
                    _id: modalSetId,
                    name: questionSets.find(set => set._id === modalSetId)?.name || 'Unknown'
                }
                };
                setSelectedQuestions((prev) => [...prev, enrichedQuestion]);
            }
            }}

        >
          <p className="font-medium mb-2">{q.question}</p>
          <ul className="list-disc list-inside text-sm mb-2 text-gray-700">
            {q.options.map((opt) => (
              <li key={opt._id}>
                {opt.text}
                {opt.isCorrect && (
                  <span className="text-green-600 font-semibold ml-1">
                    (Correct)
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="text-right text-sm text-blue-600 font-semibold">
            {isSelected ? 'Selected' : 'Click to Select'}
          </div>
        </div>
      );
    })}
  </div>
)}

          </div>
        </div>
      )}
    </div>
  );
};

export default SelectQuestionSetsPage;
