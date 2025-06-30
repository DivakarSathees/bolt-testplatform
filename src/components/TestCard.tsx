import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, FileText, Users, Play, Calendar
} from 'lucide-react';

interface Props {
  test: {
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
  };
  userRole: string;
}

const TestCard: React.FC<Props> = ({ test, userRole }) => {
  const isActive = new Date() >= new Date(test.startDate) && new Date() <= new Date(test.endDate);
  const isUpcoming = new Date() < new Date(test.startDate);
  const isExpired = new Date() > new Date(test.endDate);

  return (
    <div className="card p-6 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium">{test.type}</span>
        </div>
        <div className="flex justify-between">
          <span>Subject:</span>
          <span>{test.subject}</span>
        </div>
        <div className="flex justify-between">
          <span>Duration:</span>
          <span><Clock className="inline h-4 w-4 mr-1" /> {test.duration} mins</span>
        </div>
        <div className="flex justify-between">
          <span>Total Marks:</span>
          <span>{test.totalMarks}</span>
        </div>
        <div className="flex justify-between">
          <span>Questions:</span>
          <span><FileText className="inline h-4 w-4 mr-1" /> {test.questionCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Difficulty:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            test.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>{test.difficulty}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div className="flex justify-between mb-3">
          <span>Start: {new Date(test.startDate).toLocaleDateString()}</span>
          <span>End: {new Date(test.endDate).toLocaleDateString()}</span>
        </div>

        {userRole === 'student' ? (
          <div>
            {isActive && (
              <Link to={`/test/${test._id}`} className="btn btn-primary w-full text-sm">
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </Link>
            )}
            {isUpcoming && (
              <div className="btn btn-secondary w-full opacity-50 cursor-not-allowed">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming
              </div>
            )}
            {isExpired && (
              <div className="btn btn-secondary w-full opacity-50 cursor-not-allowed">
                Test Expired
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to={`/results?testId=${test._id}`} className="btn btn-secondary text-sm flex-1">
              <Users className="h-4 w-4 mr-1" />
              Results
            </Link>
            <Link to={`/test/${test._id}`} className="btn btn-primary text-sm flex-1">
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCard;
