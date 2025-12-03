import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock
} from '@fortawesome/free-solid-svg-icons';

function TestHistory({ tests }) {
  const navigate = useNavigate();
  const filteredTests = tests;

  const handleTestClick = (test) => {
    // Navigate to test review page with test details
    navigate('/test-review', { 
      state: { 
        test: test,
        testId: test.id,
        isViewOnly: true
      } 
    });
  };

  return (
    <div className="space-y-8">
      {/* Tests List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => (
                  <tr key={test.id} onClick={() => handleTestClick(test)} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{test.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{test.topic}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        test.type === 'Coding' ? 'bg-blue-100 text-blue-700' :
                        test.type === 'MCQ' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {test.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {test.company}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(test.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{test.score}
                        <span className="text-xs ml-1text-gray-600">%</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">
                          {test.solved}/{test.questions}
                        </p>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                            style={{ width: `${(test.solved / test.questions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                        {test.duration}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-gray-600 text-lg">No tests found. Try adjusting your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TestHistory;
