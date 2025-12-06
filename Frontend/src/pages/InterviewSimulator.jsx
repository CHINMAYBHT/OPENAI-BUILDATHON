import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MicOff, Volume2, Loader2, CheckCircle, X } from 'lucide-react';

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

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

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
          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isAi ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'
          }`}
        >
          <div className="mb-1 text-xs font-semibold opacity-70">
            {isAi ? 'Interviewer' : 'You'}
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Top Navigation (re-using Job Builder header style) */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-gray-800">Job Builder</span>
              <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-semibold">
                Interview Simulator
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left: Setup form */}
          <section className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Candidate & Role Setup
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Provide details about yourself and the target role so the AI can tailor the interview.
            </p>

            {error && (
              <div className="flex items-start space-x-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
                <X className="w-3 h-3 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Alex Kumar"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Target Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Senior React Developer"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Target Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Google, Fintech startup"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Mode</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('technical')}
                    className={`flex-1 px-3 py-2 ${
                      mode === 'technical'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    Technical
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('behavioral')}
                    className={`flex-1 px-3 py-2 ${
                      mode === 'behavioral'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    HR / Behavioral
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-gray-700">Job Description</label>
                  <label className="text-[11px] text-blue-600 cursor-pointer hover:underline">
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
                  <p className="text-[11px] text-gray-500 mb-1">Extracting text from PDF...</p>
                )}
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Paste the full job description here or upload a PDF above..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-gray-700">Resume / CV</label>
                  <label className="text-[11px] text-blue-600 cursor-pointer hover:underline">
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
                  <p className="text-[11px] text-gray-500 mb-1">Extracting text from PDF...</p>
                )}
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Paste your resume or key bullet points here or upload a PDF above..."
                />
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {!hasSpeechSupport && (
                <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                  Browser speech recognition is not available. You can still use the simulator by speaking into your mic on supported browsers or by adjusting your setup.
                </p>
              )}

              <button
                type="button"
                onClick={handleStartInterview}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Starting interview...
                  </>
                ) : (
                  'Start Interview'
                )}
              </button>

              {isSessionActive && (
                <button
                  type="button"
                  onClick={handleEndInterview}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm"
                >
                  End & Generate Report
                </button>
              )}
            </div>
          </section>

          {/* Right: Chat + Controls */}
          <section className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col max-h-[480px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Live Interview</h2>
                  <p className="text-[11px] text-gray-500">
                    Speak your answers and follow the interviewer\'s questions in real time.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-[11px] text-gray-500">
                    <Volume2 className={`w-3 h-3 ${isAiSpeaking ? 'text-blue-600' : ''}`} />
                    <span>{isAiSpeaking ? 'AI speaking' : 'Idle'}</span>
                  </div>

                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full transition-all duration-300 ${
                        isRecording ? 'bg-red-200 opacity-70 scale-110' : 'opacity-0 scale-75'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isRecording ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-1 mb-3 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-gray-400">
                    Start the interview to see the conversation here.
                  </div>
                ) : (
                  messages.map((m, idx) => renderMessage(m, idx))
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-[11px] ${
                      isRecording ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3 h-3" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>Ready</span>
                      </>
                    )}
                  </div>
                  <span>{hasSpeechSupport ? 'Browser mic enabled' : 'Speech recognition not available'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={!isSessionActive || !hasSpeechSupport || isLoading || isAiSpeaking}
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
                    !isSessionActive || !hasSpeechSupport || isLoading || isAiSpeaking
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : isRecording
                        ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3 h-3 mr-1" />
                      Stop Answer
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 mr-1" />
                      Answer
                    </>
                  )}
                </button>
              </div>
            </div>

            {report && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Interview Report Card</h3>
                      <p className="text-[11px] text-gray-500">
                        Overall performance score and key feedback points.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Score</div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(report.score || 0)}/100
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <h4 className="text-[11px] font-semibold text-green-700 mb-1">Positives</h4>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-gray-700">
                      {report.positives && report.positives.length > 0 ? (
                        report.positives.slice(0, 5).map((p, idx) => <li key={idx}>{p}</li>)
                      ) : (
                        <li>No strengths detected.</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-red-700 mb-1">Negatives</h4>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-gray-700">
                      {report.negatives && report.negatives.length > 0 ? (
                        report.negatives.slice(0, 5).map((n, idx) => <li key={idx}>{n}</li>)
                      ) : (
                        <li>No major issues detected.</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-blue-700 mb-1">Areas to Improve</h4>
                    <ul className="space-y-1 list-disc list-inside text-[11px] text-gray-700">
                      {report.improvements && report.improvements.length > 0 ? (
                        report.improvements.slice(0, 5).map((imp, idx) => <li key={idx}>{imp}</li>)
                      ) : (
                        <li>No suggestions available.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default InterviewSimulator;
