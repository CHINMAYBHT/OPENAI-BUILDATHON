import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MicOff, Volume2, Loader2, CheckCircle, X, Home, Play, Square, FileText, Upload, AlertTriangle } from 'lucide-react';

function InterviewSimulator() {
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [mode, setMode] = useState('technical'); // 'technical' | 'behavioral'

  const [sessionStart, setSessionStart] = useState(null);
  const [isUploadingJD, setIsUploadingJD] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [messages, setMessages] = useState([]); // { sender: 'ai' | 'user', text, timestamp }
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const [report, setReport] = useState(null); // { score, positives, negatives, improvements }

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserAnswer(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsAiSpeaking(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const playAudioFromBase64 = (audioBase64) => {
    try {
      stopAudio();
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audioRef.current = audio;
      setIsAiSpeaking(true);
      audio.onended = () => {
        setIsAiSpeaking(false);
      };
      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
        setIsAiSpeaking(false);
      });
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsAiSpeaking(false);
    }
  };

  const speakWithBrowserTts = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      stopAudio();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Browser TTS error:', err);
      setIsAiSpeaking(false);
    }
  };

  const handlePdfUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file for this field.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    if (type === 'jd') setIsUploadingJD(true);
    if (type === 'resume') setIsUploadingResume(true);
    setError('');

    try {
      const response = await fetch(`${apiBase}/api/interview/extract-pdf-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to extract text from PDF: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (type === 'jd') {
        setJobDescription(data.text || '');
      } else {
        setResume(data.text || '');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to extract text from PDF.');
    } finally {
      if (type === 'jd') setIsUploadingJD(false);
      if (type === 'resume') setIsUploadingResume(false);
      // reset the input so the same file can be selected again if needed
      event.target.value = '';
    }
  };

  const validateInputs = () => {
    if (!name || !jobTitle || !company || !jobDescription || !resume) {
      setError('Please fill in all fields before starting the interview.');
      return false;
    }
    setError('');
    return true;
  };

  const handleStartInterview = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setReport(null);
    setMessages([]);

    const startTime = new Date().toISOString();

    try {
      const response = await fetch(`${apiBase}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: {
            name,
            targetJobTitle: jobTitle,
            targetCompany: company,
          },
          context: {
            jobDescription,
            resume,
          },
          mode,
          sessionStart: startTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start interview: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const questionText = data.questionText || 'Can you briefly introduce yourself?';

      setSessionStart(data.sessionStart || startTime);
      setIsSessionActive(true);
      setMessages([
        {
          sender: 'ai',
          text: questionText,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (data.audioBase64) {
        playAudioFromBase64(data.audioBase64);
      } else if (data.useLocalTts) {
        speakWithBrowserTts(questionText);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to start interview.');
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecording = () => {
    if (!hasSpeechSupport) return;
    // Do not allow mic while AI interviewer is speaking
    if (isAiSpeaking) return;

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setError('');
      recognition.start();
    }
  };

  const handleUserAnswer = async (answerText) => {
    if (!answerText || !answerText.trim()) return;

    const trimmed = answerText.trim();
    const now = new Date().toISOString();

    // Build updated messages and history in a functional way so we never lose previous turns
    let historyForBackend = [];
    setMessages((prev) => {
      const updated = [
        ...prev,
        {
          sender: 'user',
          text: trimmed,
          timestamp: now,
        },
      ];

      historyForBackend = updated.map((m) => ({
        role: m.sender === 'ai' ? 'interviewer' : 'candidate',
        text: m.text,
      }));

      return updated;
    });

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/interview/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: {
            name,
            targetJobTitle: jobTitle,
            targetCompany: company,
          },
          context: {
            jobDescription,
            resume,
          },
          mode,
          sessionStart,
          interviewHistory: historyForBackend,
          userAnswer: answerText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send answer: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const replyText = data.replyText || 'Thank you. Can you tell me more about that?';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (data.audioBase64) {
        playAudioFromBase64(data.audioBase64);
      } else if (data.useLocalTts) {
        speakWithBrowserTts(replyText);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to process answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildTranscriptForBackend = () => {
    return messages.map((m) => ({
      role: m.sender === 'ai' ? 'interviewer' : 'candidate',
      text: m.text,
    }));
  };

  const handleEndInterview = async () => {
    stopAudio();
    setIsSessionActive(false);

    try {
      setIsLoading(true);
      const response = await fetch(`${apiBase}/api/interview/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: {
            name,
            targetJobTitle: jobTitle,
            targetCompany: company,
          },
          context: {
            jobDescription,
            resume,
          },
          mode,
          interviewHistory: buildTranscriptForBackend(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReport({
        score: typeof data.score === 'number' ? data.score : 0,
        positives: Array.isArray(data.positives) ? data.positives : [],
        negatives: Array.isArray(data.negatives) ? data.negatives : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate report.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (msg, idx) => {
    const isAi = msg.sender === 'ai';
    return (
      <div
        key={idx}
        className={`flex mb-3 ${isAi ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 text-lg shadow-sm ${isAi ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'
            }`}
        >
          <div className="mb-1 text-base font-semibold opacity-70">
            {isAi ? 'Interviewer' : 'You'}
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-800">Job Builder</span>
            </div>

            {/* Right side navigation */}
            <div className="flex items-center space-x-6">
              {/* Home Button */}
              <Link
                to="/"
                className="flex items-center space-x-2 text-lg text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 mt-5">
        <div className="w-full max-w-4xl mx-auto">
          {/* Conditional Layout */}
          {report ? (
            /* Report Display */
            <section className="w-full">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Interview <span className="gradient-text">Report</span>
                  </h1>
                  <button
                    onClick={() => {
                      setReport(null);
                      setIsSessionActive(false);
                      setMessages([]);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
                  >
                    New Interview
                  </button>
                </div>

                {/* Score Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Performance Score</h2>
                  <div className="text-4xl font-bold text-blue-600">{report.score}/100</div>
                  <p className="text-sm text-gray-600 mt-2">
                    {report.score >= 80 && "Excellent performance! You demonstrated strong skills and communication."}
                    {report.score >= 60 && report.score < 80 && "Good performance! With some practice, you can improve further."}
                    {report.score >= 40 && report.score < 60 && "Fair performance. Focus on the areas for improvement below."}
                    {report.score < 40 && "Areas identified for improvement. Review the feedback and practice more."}
                  </p>
                </div>

                {/* Three Column Layout */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Positives */}
                  {report.positives && report.positives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {report.positives.map((positive, idx) => (
                          <li key={idx} className="flex gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{positive}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Negatives */}
                  {report.negatives && report.negatives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {report.negatives.map((negative, idx) => (
                          <li key={idx} className="flex gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-gray-700">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{negative}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {report.improvements && report.improvements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {report.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : !isSessionActive ? (
            /* Setup Interview - Full Width */
            <section className="w-full">
              {/* Setup Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ">
                <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
                  Setup <span className="gradient-text ">Interview</span>
                </h1>


                {error && (
                  <div className="flex items-start space-x-2 text-base text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Alex Kumar"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Senior React Dev"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Google"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-base font-semibold text-gray-700 mb-1">Interview Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMode('technical')}
                        className={`px-3 py-2 rounded-lg font-medium text-base transition ${mode === 'technical'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Technical
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('behavioral')}
                        className={`px-3 py-2 rounded-lg font-medium text-base transition ${mode === 'behavioral'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Behavioral
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-base font-semibold text-gray-700">Job Description</label>
                      <label className="text-base text-blue-600 cursor-pointer hover:text-blue-700 font-semibold flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handlePdfUpload(e, 'jd')}
                        />
                      </label>
                    </div>
                    {isUploadingJD && (
                      <p className="text-base text-blue-600 mb-1 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Extracting text...
                      </p>
                    )}
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical overflow-hidden"
                      placeholder="Paste job description or upload PDF..."
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-base font-semibold text-gray-700">Resume / CV</label>
                      <label className="text-base text-blue-600 cursor-pointer hover:text-blue-700 font-semibold flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handlePdfUpload(e, 'resume')}
                        />
                      </label>
                    </div>
                    {isUploadingResume && (
                      <p className="text-base text-blue-600 mb-1 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Extracting text...
                      </p>
                    )}
                    <textarea
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical overflow-hidden"
                      placeholder="Paste your resume or upload PDF..."
                    />
                  </div>

                  <div className="col-span-3 mt-4">
                    {!hasSpeechSupport && (
                      <div className="text-base text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-3 h-3" />
                        Browser speech recognition not available
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleStartInterview}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center text-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Interview
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>


            </section>
          ) : (
            /* Live Interview - Full Width */
            <section className="w-full space-y-6">
              {/* Chat Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">Live Interview</h2>
                      <p className="text-base text-gray-600 mt-1">Real-time AI interaction</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Volume2 className={`w-5 h-5 ${isAiSpeaking ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
                        <span className="text-base font-medium text-gray-700">{isAiSpeaking ? 'Speaking' : 'Idle'}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-gray-500">
                      <div>
                        <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="font-medium text-xl">Ready to start</p>
                        <p className="text-lg text-gray-400 mt-1">Click "Start Interview" to begin</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m, idx) => renderMessage(m, idx))
                  )}
                </div>

                {/* Controls */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-base font-semibold ${isRecording
                        ? 'bg-red-100 text-red-600 border border-red-200'
                        : 'bg-green-100 text-green-600 border border-green-200'
                        }`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                        <span>{isRecording ? 'Recording' : 'Ready'}</span>
                      </div>
                      <span className="text-base text-gray-600 flex items-center gap-1">
                        {hasSpeechSupport ? (
                          <>
                            <Mic className="w-3 h-3" />
                            Mic ready
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            No speech
                          </>
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      disabled={!isSessionActive || !hasSpeechSupport || isLoading || isAiSpeaking}
                      className={`px-4 py-2 rounded-lg font-semibold text-base transition flex items-center gap-2 ${!isSessionActive || !hasSpeechSupport || isLoading || isAiSpeaking
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isRecording
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Answer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* End Interview Button */}
              <button
                type="button"
                onClick={handleEndInterview}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 font-semibold rounded-lg border border-red-200 transition flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    End & Report
                  </>
                )}
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default InterviewSimulator;