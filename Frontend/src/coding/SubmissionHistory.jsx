// Create a new component: Frontend/src/components/SubmissionHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SubmissionHistory({ userId }) {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetch(`/api/gemini/submissions/${userId}`)
      .then(res => res.json())
      .then(data => setSubmissions(data.submissions));
  }, [userId]);
  
  return (
    <div className="space-y-4">
      {submissions.map(submission => (
        <div 
          key={submission.id}
          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          onClick={() => navigate(`/submission/${submission.id}`)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{submission.problems.title}</h3>
              <p className="text-sm text-gray-600">
                Status: {submission.final_status} • 
                Tests: {submission.passed_count}/{submission.total_tests}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {new Date(submission.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SubmissionHistory;
