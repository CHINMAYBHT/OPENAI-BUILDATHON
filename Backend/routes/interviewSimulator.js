import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

const router = express.Router();
const upload = multer();

// ElevenLabs TTS helper
// Uses env:
// - ELEVENLABS_API_KEY (required)
// - ELEVENLABS_VOICE_ID (optional, defaults to a standard voice)
// - ELEVENLABS_MODEL_ID (optional, defaults to eleven_multilingual_v2)
// Returns: { audioBase64: string|null, useLocalTts: boolean }
async function synthesizeToBase64(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // No ElevenLabs key configured: fall back to browser TTS on frontend.
    return { audioBase64: null, useLocalTts: true };
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // default ElevenLabs voice
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    const response = await axios.post(
      url,
      {
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    const buffer = Buffer.from(response.data);
    return { audioBase64: buffer.toString('base64'), useLocalTts: false };
  } catch (err) {
    let useLocalTts = false;

    // Decode and log ElevenLabs error details for debugging
    try {
      if (err.response?.data) {
        const raw = err.response.data;
        let bodyText;
        if (Buffer.isBuffer(raw)) {
          bodyText = raw.toString('utf8');
        } else if (typeof raw === 'string') {
          bodyText = raw;
        } else {
          bodyText = JSON.stringify(raw);
        }
        console.error('ElevenLabs TTS error response:', bodyText);

        // Try to detect quota_exceeded specifically
        try {
          const parsed = JSON.parse(bodyText);
          const status = parsed?.detail?.status || parsed?.status;
          if (status === 'quota_exceeded') {
            useLocalTts = true;
          }
        } catch (parseErr) {
          // ignore JSON parse errors, we already logged the body text
        }
      }
    } catch (decodeErr) {
      console.error('Failed to decode ElevenLabs error response:', decodeErr);
    }

    console.error('ElevenLabs TTS error:', err.message || err);

    // If quota is exceeded (or no key), tell frontend to use browser TTS.
    return { audioBase64: null, useLocalTts };
  }
}

function buildInterviewerSystemPrompt(candidateProfile = {}, mode = 'technical') {
  const { name, targetJobTitle, targetCompany } = candidateProfile;
  const safeName = name || 'Candidate';

  const modeDescription =
    mode === 'behavioral'
      ? 'You are an HR / behavioral interviewer. Focus on soft skills, culture fit, and situational questions (STAR method: Situation, Task, Action, Result).'
      : 'You are a technical interviewer. Focus on role-specific technical depth, problem solving, and system design appropriate for the role seniority.';

  return `You are an AI interviewer conducting a realistic mock interview.

Candidate profile:
- Name: ${safeName}
- Target Job Title: ${targetJobTitle || 'Unknown role'}
- Target Company: ${targetCompany || 'the company'}

${modeDescription}

Guidelines:
- Maintain professional, respectful tone.
- Ask one clear question at a time.
- Keep questions concise but realistic.
- Adapt to the candidate's level and previous answers.
- Always greet the candidate using their actual name ${safeName} and NEVER use placeholders like [Your User Name] or similar.
- If you introduce yourself, always say you are the AI Interviewer (for example: "I am your AI Interviewer for this session") and NEVER use placeholders like [Your Interviewer] or similar.
- Do not reveal model or system details.
- Do not speak as a chatbot; act as a professional AI interviewer.`;
}

function formatHistory(interviewHistory = []) {
  if (!Array.isArray(interviewHistory)) return '';
  return interviewHistory
    .map((turn) => {
      const speaker = turn.role === 'candidate' ? 'Candidate' : 'Interviewer';
      return `${speaker}: ${turn.text}`;
    })
    .join('\n');
}

function getElapsedMinutes(sessionStart) {
  if (!sessionStart) return 0;
  const start = new Date(sessionStart).getTime();
  if (Number.isNaN(start)) return 0;
  const now = Date.now();
  return Math.max(0, (now - start) / 60000);
}

router.post('/start', async (req, res) => {
  const { candidateProfile, context, mode = 'technical', sessionStart } = req.body || {};

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = buildInterviewerSystemPrompt(candidateProfile, mode);

    const jobDescription = context?.jobDescription || '';
    const resume = context?.resume || '';

    const userPrompt = `You are starting a new mock interview.

Job Description:
${jobDescription}

Resume:
${resume}

Task:
Introduce yourself briefly as an interviewer for ${candidateProfile?.targetCompany || 'the company'
      } and ask the very first question.

Rules:
- Ask exactly ONE question.
- Do not give feedback yet.
- Keep it short and natural.`;

    const result = await model.generateContent({
      systemInstruction,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    });

    const questionText = result?.response?.text() || 'Can you briefly introduce yourself?';

    const { audioBase64, useLocalTts } = await synthesizeToBase64(questionText);

    return res.json({
      questionText,
      audioBase64,
      useLocalTts: !!useLocalTts,
      sessionStart: sessionStart || new Date().toISOString(),
    });
  } catch (err) {
    console.error('Interview start error:', err);
    return res.status(500).json({ error: String(err) });
  }
});

router.post('/turn', async (req, res) => {
  const { candidateProfile, context, mode = 'technical', sessionStart, interviewHistory, userAnswer } =
    req.body || {};

  if (!userAnswer || typeof userAnswer !== 'string') {
    return res.status(400).json({ error: 'Missing userAnswer' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = buildInterviewerSystemPrompt(candidateProfile, mode);

    const historyText = formatHistory(interviewHistory);
    const elapsedMinutes = getElapsedMinutes(sessionStart);

    let timeGuidance = '';
    if (elapsedMinutes >= 18) {
      timeGuidance =
        'The interview is almost over (around 20 minutes). Ask a very brief final question or give closing remarks and end the interview.';
    } else if (elapsedMinutes >= 15) {
      timeGuidance =
        'The interview has been going for about 15 minutes. Start moving towards wrap-up with 1-2 final questions.';
    }

    const userPrompt = `You are continuing an ongoing mock interview.

Conversation so far:
${historyText || '(no previous conversation)'}

Latest candidate answer:
${userAnswer}

${timeGuidance}

Rules:
- Respond as the interviewer.
- Either ask the next question or, if wrapping up, give brief feedback and a closing remark.
- Ask at most ONE main question at a time.
- Keep the response under 120 words.
- Do not use bullet points or numbered lists.
- Do not mention that this is a simulation.`;

    const result = await model.generateContent({
      systemInstruction,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.5,
      },
    });

    const replyText = result?.response?.text() || 'Thank you. Can you tell me more about your recent experience?';
    const { audioBase64, useLocalTts } = await synthesizeToBase64(replyText);

    return res.json({
      replyText,
      audioBase64,
      useLocalTts: !!useLocalTts,
    });
  } catch (err) {
    console.error('Interview turn error:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Extract text from an uploaded PDF (used for JD and Resume)
router.post('/extract-pdf-text', upload.single('file'), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  try {
    console.log('PDF Parse function type:', typeof pdfParse);
    console.log('PDF Parse:', pdfParse);
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text || '';
    // Normalize whitespace a bit for better LLM consumption
    const text = rawText.replace(/\s+/g, ' ').trim();

    if (!text) {
      return res.status(400).json({ error: 'Unable to extract text from PDF' });
    }

    return res.json({ text });
  } catch (err) {
    console.error('PDF text extraction error:', err);
    return res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

router.post('/report', async (req, res) => {
  const { candidateProfile, context, mode = 'technical', interviewHistory } = req.body || {};

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { name, targetJobTitle, targetCompany } = candidateProfile || {};
    const jobDescription = context?.jobDescription || '';
    const resume = context?.resume || '';

    const transcriptText = formatHistory(interviewHistory);

    const systemInstruction = `You are an expert interview evaluator.

Your job is to analyze a full mock interview transcript and produce a concise report card.
Return ONLY a JSON object with the following structure and keys:
{
  "score": number between 0 and 100,
  "positives": ["..."],
  "negatives": ["..."],
  "improvements": ["..."]
}
Do not include any extra commentary outside the JSON. Keep all bullet points short and actionable.`;

    const userPrompt = `Candidate profile:
- Name: ${name || 'Candidate'}
- Target Job Title: ${targetJobTitle || 'Unknown role'}
- Target Company: ${targetCompany || 'the company'}
- Mode: ${mode === 'behavioral' ? 'HR / Behavioral' : 'Technical'}

Job Description:
${jobDescription}

Resume:
${resume}

Interview transcript (Interviewer vs Candidate):
${transcriptText || '(no transcript)'}

Now generate the interview report card as specified.`;

    const result = await model.generateContent({
      systemInstruction,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    });

    const responseText = result?.response?.text() || '{}';

    let parsed = {
      score: 0,
      positives: [],
      negatives: [],
      improvements: [],
    };

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse interview report JSON:', parseErr, 'Raw:', responseText);
    }

    const score = typeof parsed.score === 'number' ? parsed.score : 0;

    return res.json({
      score,
      positives: Array.isArray(parsed.positives) ? parsed.positives : [],
      negatives: Array.isArray(parsed.negatives) ? parsed.negatives : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      raw_ai_response: responseText,
    });
  } catch (err) {
    console.error('Interview report error:', err);
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
