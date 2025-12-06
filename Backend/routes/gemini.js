import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const router = express.Router();

// Judge0 Public API Configuration (NO API KEY REQUIRED)
const JUDGE0_API_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

// Language ID mappings for Judge0
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  go: 60,
  rust: 73
};

// Helper function to get language ID for Judge0
const getLanguageId = (lang) => {
  return LANGUAGE_IDS[lang.toLowerCase()] || 71; // Default to Python
};

router.post("/assist", async (req, res) => {
  const { code, query, problem, input, output, language, chatHistory } = req.body || {};

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    // ⭐ SYSTEM INSTRUCTIONS (apply to every answer)
    const systemInstruction = `
                You must follow these rules strictly:
                - Use friendly language with emojis if required
                - Do not give full solution hints, but ALWAYS provide a "small" nudge or suggestion.
                - In hints do not give the actual solution path unless user insists.
                - Do not use bold formatting, markdown symbols, asterisks (*), placeholders, or any formatting symbols (****, etc.)
                - NEVER use asterisks (*), placeholders, or any special formatting characters
                - Do not output code under any circumstance.
                - If the user asks for code, say: "I cannot give code, but I can guide you conceptually."
                - Keep every response short, concise, and directly answering the question.
                - Provide only conceptual feedback, explanations, and suggestions.
                - Never wrap text in asterisks or special formatting.
                - Stay focused only on the question asked.
                - You must always give some response. Never stay silent. If unsure, give a tiny conceptual suggestion.
                - Do not greet
                - Do not say "no response"`;
    // Format chat history for context
    let chatContext = '';
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      chatContext = '\n\nRecent conversation history:\n' +
        chatHistory.map(chat => `${chat.isUser ? 'User' : 'Assistant'}: ${chat.text}`).join('\n') +
        '\n\n';
    }

    const userPrompt = `
                Analyze the user's code and problem and respond concisely.${chatContext}
                Problem description:
                ${problem}

                query :
                ${query}
                Input Format:
                ${input}

                Output Format:
                ${output}

                Language: ${language}

                User Code:
                ${code}
                `;

    const result = await model.generateContent({
      systemInstruction,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    });

    const responseText = result?.response?.text() || "No response";

    return res.json({ assistantResponse: responseText });

  } catch (err) {
    console.error("Gemini SDK error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.post('/application-description', async (req, res) => {
  const { description, problemId } = req.body || {};

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const systemInstruction = `
You are an expert at transforming coding problems into real-world application scenarios.
Take the given coding problem and rephrase it as a practical problem that would occur in software development.
Focus on transforming JUST the problem description, keeping the same constraints and technical requirements.
Provide only the transformed description, nothing else.`;

    const userPrompt = `Transform this coding problem into a real-world application scenario:

${description}

Provide only the transformed problem description, maintaining the same technical constraints and requirements.`;

    const result = await model.generateContent({
      systemInstruction,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3
      }
    });

    const responseText = result?.response?.text() || "Unable to transform description";

    // If problemId is provided, save it to the database
    if (problemId && responseText && responseText !== "Unable to transform description") {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase
            .from('problems')
            .update({ app_description: responseText })
            .eq('id', problemId);
        }
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        // Continue anyway - the response is still valid
      }
    }

    return res.json({ applicationDescription: responseText });

  } catch (err) {
    console.error("Gemini application description error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.post('/save-chat', async (req, res) => {
  const { problem_id, role, message, user_id } = req.body || {};

  if (!problem_id || !role || !message || !user_id) {
    return res.status(400).json({ error: "Missing required fields: problem_id, role, message, user_id" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from('problem_ai_chats')
      .insert({
        user_id: user_id,
        problem_id: problem_id,
        role: role,
        message: message
      });

    if (insertError) {
      console.error("Error saving chat:", insertError);
      console.error("Insert details:", { user_id, problem_id, role, message });
      console.error("Database error:", insertError.code, insertError.message);
      return res.status(500).json({ error: "Failed to save chat message", details: insertError.message });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Save chat error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.get('/chats/:problem_id/:user_id', async (req, res) => {
  const { problem_id, user_id } = req.params;

  if (!problem_id || !user_id) {
    return res.status(400).json({ error: "Missing required parameters: problem_id, user_id" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: chats, error: selectError } = await supabase
      .from('problem_ai_chats')
      .select('role, message, created_at')
      .eq('problem_id', problem_id)
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (selectError) {
      console.error("Error loading chats:", selectError);
      return res.status(500).json({ error: "Failed to load chat messages" });
    }

    return res.json({ chats: chats || [] });

  } catch (err) {
    console.error("Load chats error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Save code run (when user clicks RUN)
router.post('/save-run', async (req, res) => {
  const { problem_id, user_id, language, code, run_output } = req.body || {};

  if (!problem_id || !user_id || !language || !code) {
    return res.status(400).json({ error: "Missing required fields: problem_id, user_id, language, code" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error: insertError } = await supabase
      .from('code_runs')
      .insert({
        user_id: user_id,
        problem_id: problem_id,
        language: language,
        code: code,
        run_output: run_output || ''
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving code run:", insertError);
      return res.status(500).json({ error: "Failed to save code run", details: insertError.message });
    }

    return res.json({ success: true, runId: data.id });

  } catch (err) {
    console.error("Save code run error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Save submission (when user clicks SUBMIT)
// Generate AI code review with readability and maintainability scores
router.post('/generate-ai-review', async (req, res) => {
  const { code, problem, testCases, language } = req.body || {};

  if (!code || !problem || !testCases || !Array.isArray(testCases)) {
    return res.status(400).json({ error: "Missing required fields: code, problem, testCases (array), language" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `You are an expert code reviewer evaluating submission code for coding interviews.
Analyze the provided code and return a JSON object with the following structure:

{
  "readability_score": <number 1-10>,
  "readability_justification": "<brief explanation of why you gave this score>",
  "maintainability_score": <number 1-10>,
  "maintainability_justification": "<brief explanation of why you gave this score>",
  "strengths": [<array of 3-5 strings>],
  "weaknesses": [<array of 2-4 areas for improvement>],
  "interview_perspective": [<array of 2-3 strings on interview context>],
  "critical_issues": [<array of 1-3 critical problems, empty if none>],
  "suggestions": "<text with improvement suggestions>"
}

STRICT RULES:
- NEVER use asterisks (*), placeholders, or any formatting symbols (****, etc.)
- NEVER use quotation marks around strings unless they are part of the content
- NEVER add explanatory text outside the JSON structure
- Return ONLY the JSON object, nothing else
- Scores: Whole numbers 1-10 (10 being best)
- Readability: Focus on naming, structure, clarity. Justification should explain variable/function naming quality, code structure, and overall clarity
- Maintainability: Focus on modularity, documentation, future changes. Justification should explain code organization, reusability, and documentation level
- Strengths/weaknesses/interview_perspective: Be specific and actionable
- Critical issues: Only major problems that would fail interviews
- Keep all text concise but helpful`;

    const userPrompt = `
Review this code submission:

PROBLEM:
${problem}

CODE (${language}):
${code}

TEST CASES:
${testCases.map(tc => `Input: ${tc.input}, Expected: ${tc.expectedOutput}`).join('\n')}

Provide comprehensive analysis in the specified JSON format.
`;

    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.3 }
    });

    const responseText = result?.response?.text() || "{}";
    let reviewData;

    try {
      // Try to extract JSON from response (remove markdown if present)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      reviewData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseText);
      // Fallback structure
      reviewData = {
        readability_score: 7,
        readability_justification: "Code structure is clear but variable naming could be more descriptive",
        maintainability_score: 6,
        maintainability_justification: "Code lacks documentation and could benefit from better modularity",
        strengths: ["Code compiles and runs"],
        weaknesses: ["AI analysis failed - manual review needed"],
        interview_perspective: ["Needs technical assessment"],
        critical_issues: [],
        suggestions: "Please review manually due to analysis error"
      };
    }

    return res.json({
      success: true,
      review: reviewData,
      raw_ai_response: responseText
    });

  } catch (err) {
    console.error("Generate AI review error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Save submission with AI review
router.post('/save-submission-with-review', async (req, res) => {
  const { problem_id, user_id, language, code, final_status, passed_count, total_tests, test_results, problem_description, test_cases } = req.body || {};

  if (!problem_id || !user_id || !language || !code || !final_status || !problem_description || !test_cases) {
    return res.status(400).json({ error: "Missing required fields: problem_id, user_id, language, code, final_status, problem_description, test_cases" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate AI review directly
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `You are an expert code reviewer evaluating submission code for coding interviews.
Analyze the provided code and return a JSON object with the following structure:

{
  "readability_score": <number 1-10>,
  "readability_justification": "<brief explanation of why you gave this score>",
  "maintainability_score": <number 1-10>,
  "maintainability_justification": "<brief explanation of why you gave this score>",
  "strengths": [<array of 3-5 strings>],
  "weaknesses": [<array of 2-4 areas for improvement>],
  "interview_perspective": [<array of 2-3 strings on interview context>],
  "critical_issues": [<array of 1-3 critical problems, empty if none>],
  "suggestions": "<text with improvement suggestions>"
}

STRICT RULES:
- NEVER use asterisks (*), placeholders, or any formatting symbols (****, etc.)
- NEVER use quotation marks around strings unless they are part of the content
- NEVER add explanatory text outside the JSON structure
- Return ONLY the JSON object, nothing else
- Scores: Whole numbers 1-10 (10 being best)
- Readability: Focus on naming, structure, clarity. Justification should explain variable/function naming quality, code structure, and overall clarity
- Maintainability: Focus on modularity, documentation, future changes. Justification should explain code organization, reusability, and documentation level
- Strengths/weaknesses/interview_perspective: Be specific and actionable
- Critical issues: Only major problems that would fail interviews
- Keep all text concise but helpful`;

    const userPrompt = `
Review this code submission:

PROBLEM:
${problem_description}

CODE (${language}):
${code}

TEST CASES:
${test_cases.map(tc => `Input: ${tc.input}, Expected: ${tc.expectedOutput}`).join('\n')}

Provide comprehensive analysis in the specified JSON format.
`;

    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.3 }
    });

    const responseText = result?.response?.text() || "{}";
    let aiReview;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      aiReview = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseText);
      aiReview = {
        readability_score: 7,
        readability_justification: "Code structure is clear but variable naming could be more descriptive",
        maintainability_score: 6,
        maintainability_justification: "Code lacks documentation and could benefit from better modularity",
        strengths: ["Code compiles and runs"],
        weaknesses: ["AI analysis failed - manual review needed"],
        interview_perspective: ["Needs technical assessment"],
        critical_issues: [],
        suggestions: "Please review manually due to analysis error"
      };
    }

    // Save AI review to database
    const { data: aiReviewRecord, error: aiReviewError } = await supabase
      .from('ai_code_reviews')
      .insert({
        submission_id: null, // Will link after creating submission
        strengths: aiReview.strengths || [],
        weaknesses: aiReview.weaknesses || [],
        interview_perspective: aiReview.interview_perspective || [],
        critical_issues: aiReview.critical_issues || [],
        suggestions: aiReview.suggestions || '',
        readability_justification: aiReview.readability_justification || '',
        maintainability_justification: aiReview.maintainability_justification || '',
        raw_ai_response: JSON.stringify(aiReview)
      })
      .select()
      .single();

    if (aiReviewError) {
      console.error("Error saving AI review:", aiReviewError);
      return res.status(500).json({ error: "Failed to save AI review", details: aiReviewError.message });
    }

    // Save submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: user_id,
        problem_id: problem_id,
        language: language,
        code: code,
        final_status: final_status,
        total_time_ms: null, // Remove time tracking
        passed_count: passed_count || 0,
        total_tests: total_tests || 0,
        readability_score: aiReview.readability_score || null,
        readability_justification: aiReview.readability_justification || '',
        maintainability_score: aiReview.maintainability_score || null,
        maintainability_justification: aiReview.maintainability_justification || '',
        ai_review_id: aiReviewRecord.id
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error saving submission:", submissionError);
      return res.status(500).json({ error: "Failed to save submission", details: submissionError.message });
    }

    // Update AI review to link to submission
    await supabase
      .from('ai_code_reviews')
      .update({ submission_id: submission.id })
      .eq('id', aiReviewRecord.id);

    // Update user_languages table
    const isSolved = final_status === 'success';
    try {
      const { data: existingLang } = await supabase
        .from('user_languages')
        .select('*')
        .eq('user_id', user_id)
        .eq('language', language)
        .single();

      if (existingLang) {
        // Update existing record - only increment if solved
        const newCount = isSolved ? (existingLang.solved_count || 0) + 1 : (existingLang.solved_count || 0);
        await supabase
          .from('user_languages')
          .update({ solved_count: newCount })
          .eq('user_id', user_id)
          .eq('language', language);
      } else {
        // Insert new record
        await supabase
          .from('user_languages')
          .insert({
            user_id: user_id,
            language: language,
            solved_count: isSolved ? 1 : 0
          });
      }
    } catch (langError) {
      console.error("Error updating user_languages:", langError);
      // Don't fail the submission if language tracking fails
    }

    // Update user streak if submission was successful
    if (isSolved) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data: existingStreak } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user_id)
          .single();

        let newCurrentStreak = 1;
        let newLongestStreak = 1;

        if (existingStreak) {
          const lastSolvedDate = existingStreak.last_solved_at;

          if (lastSolvedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastSolvedDate === yesterdayStr) {
              newCurrentStreak = (existingStreak.current_streak || 0) + 1;
            } else {
              newCurrentStreak = 1;
            }

            newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak || 0);

            await supabase
              .from('user_streaks')
              .upsert({
                user_id: user_id,
                current_streak: newCurrentStreak,
                longest_streak: newLongestStreak,
                last_solved_at: today
              }, { onConflict: 'user_id' });
          }
        } else {
          await supabase
            .from('user_streaks')
            .insert({
              user_id: user_id,
              current_streak: 1,
              longest_streak: 1,
              last_solved_at: today
            });
        }
      } catch (streakError) {
        console.error("Error updating user_streaks:", streakError);
        // Don't fail the submission if streak tracking fails
      }
    }

    // Save test results if provided
    if (test_results && Array.isArray(test_results)) {
      const submissionResults = test_results.map(result => ({
        submission_id: submission.id,
        testcase_id: result.testcase_id || null,
        passed: result.passed || false,
        actual_output: result.actual_output || '',
        expected_output: result.expected_output || '',
        time_ms: result.time_ms || 0
      }));

      const { error: resultsError } = await supabase
        .from('submission_results')
        .insert(submissionResults);

      if (resultsError) {
        console.error("Error saving submission results:", resultsError);
        // Continue anyway - submission is still saved
      }
    }

    return res.json({
      success: true,
      submissionId: submission.id,
      aiReview: aiReview,
      message: `Submission and AI review saved successfully`
    });

  } catch (err) {
    console.error("Save submission with review error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.post('/save-submission', async (req, res) => {
  const { problem_id, user_id, language, code, final_status, total_time_ms, passed_count, total_tests, test_results } = req.body || {};

  if (!problem_id || !user_id || !language || !code || !final_status) {
    return res.status(400).json({ error: "Missing required fields: problem_id, user_id, language, code, final_status" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: user_id,
        problem_id: problem_id,
        language: language,
        code: code,
        final_status: final_status,
        total_time_ms: total_time_ms || 0,
        passed_count: passed_count || 0,
        total_tests: total_tests || 0,
        readability_score: null, // Will be calculated later
        maintainability_score: null, // Will be calculated later
        ai_review_id: null // Will be linked later
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error saving submission:", submissionError);
      return res.status(500).json({ error: "Failed to save submission", details: submissionError.message });
    }

    // Update user_languages table
    const isSolved = final_status === 'success';
    try {
      const { data: existingLang } = await supabase
        .from('user_languages')
        .select('*')
        .eq('user_id', user_id)
        .eq('language', language)
        .single();

      if (existingLang) {
        // Update existing record - only increment if solved
        const newCount = isSolved ? (existingLang.solved_count || 0) + 1 : (existingLang.solved_count || 0);
        await supabase
          .from('user_languages')
          .update({ solved_count: newCount })
          .eq('user_id', user_id)
          .eq('language', language);
      } else {
        // Insert new record
        await supabase
          .from('user_languages')
          .insert({
            user_id: user_id,
            language: language,
            solved_count: isSolved ? 1 : 0
          });
      }
    } catch (langError) {
      console.error("Error updating user_languages:", langError);
      // Don't fail the submission if language tracking fails
    }

    // Update user streak if submission was successful
    if (isSolved) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data: existingStreak } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user_id)
          .single();

        let newCurrentStreak = 1;
        let newLongestStreak = 1;

        if (existingStreak) {
          const lastSolvedDate = existingStreak.last_solved_at;

          if (lastSolvedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastSolvedDate === yesterdayStr) {
              newCurrentStreak = (existingStreak.current_streak || 0) + 1;
            } else {
              newCurrentStreak = 1;
            }

            newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak || 0);

            await supabase
              .from('user_streaks')
              .upsert({
                user_id: user_id,
                current_streak: newCurrentStreak,
                longest_streak: newLongestStreak,
                last_solved_at: today
              }, { onConflict: 'user_id' });
          }
        } else {
          await supabase
            .from('user_streaks')
            .insert({
              user_id: user_id,
              current_streak: 1,
              longest_streak: 1,
              last_solved_at: today
            });
        }
      } catch (streakError) {
        console.error("Error updating user_streaks:", streakError);
        // Don't fail the submission if streak tracking fails
      }
    }

    // If test results provided, save them
    if (test_results && Array.isArray(test_results)) {
      const submissionResults = test_results.map(result => ({
        submission_id: submission.id,
        testcase_id: result.testcase_id || null,
        passed: result.passed || false,
        actual_output: result.actual_output || '',
        expected_output: result.expected_output || '',
        time_ms: result.time_ms || 0
      }));

      const { error: resultsError } = await supabase
        .from('submission_results')
        .insert(submissionResults);

      if (resultsError) {
        console.error("Error saving submission results:", resultsError);
        // Continue anyway - submission is still saved
      }
    }

    return res.json({
      success: true,
      submissionId: submission.id,
      message: `Submission saved with status: ${final_status}`
    });

  } catch (err) {
    console.error("Save submission error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.get('/submissions/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get submissions
    const { data: submissions, error: selectError } = await supabase
      .from('submissions')
      .select('id, final_status, total_time_ms, passed_count, total_tests, readability_score, maintainability_score, created_at, problem_id, language')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (selectError) {
      console.error("Error loading submissions:", selectError);
      return res.status(500).json({ error: "Failed to load submissions", details: selectError.message });
    }

    // If we have submissions, fetch problem titles separately
    if (submissions && submissions.length > 0) {
      const problemIds = [...new Set(submissions.map(s => s.problem_id))];

      const { data: problems, error: problemsError } = await supabase
        .from('problems')
        .select('id, title, slug')
        .in('id', problemIds);

      if (!problemsError && problems) {
        // Map problem titles to submissions
        const enrichedSubmissions = submissions.map(submission => {
          const problem = problems.find(p => p.id === submission.problem_id);
          return {
            ...submission,
            problems: problem ? { title: problem.title, slug: problem.slug } : { title: `Problem ${submission.problem_id}`, slug: '' },
            languages: { name: submission.language || 'Unknown' }
          };
        });

        return res.json({ submissions: enrichedSubmissions });
      }
    }

    // Fallback: return submissions without enriched data
    const fallbackSubmissions = (submissions || []).map(submission => ({
      ...submission,
      problems: { title: `Problem ${submission.problem_id}`, slug: '' },
      languages: { name: submission.language || 'Unknown' }
    }));

    return res.json({ submissions: fallbackSubmissions });

  } catch (err) {
    console.error("Load submissions error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.get('/submission-details/:submission_id', async (req, res) => {
  const { submission_id } = req.params;

  if (!submission_id) {
    return res.status(400).json({ error: "Missing submission_id parameter" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Database configuration missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get submission details with test results
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        problems(title, slug, description),
        submission_results(*)
      `)
      .eq('id', submission_id)
      .single();

    if (submissionError) {
      console.error("Error loading submission details:", submissionError);
      return res.status(500).json({ error: "Failed to load submission details" });
    }

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    return res.json({ submission });

  } catch (err) {
    console.error("Load submission details error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Execute code with Judge0
router.post('/run-code', async (req, res) => {
  const { code, language, testCases } = req.body || {};

  if (!code || !language || !testCases || !Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({
      error: "Missing required fields: code, language, testCases (array with at least one test case)"
    });
  }

  try {
    const languageId = getLanguageId(language);
    const results = [];
    const submissionIds = [];

    // Submit all test cases to Judge0
    console.log(`Submitting ${testCases.length} test cases to Judge0 Public API...`);

    for (const testCase of testCases) {
      try {
        // Convert test case input from JSON object format to stdin format
        let stdin = '';
        if (testCase.input) {
          if (typeof testCase.input === 'object') {
            // If input is already an object (JSON parsed), convert it to stdin lines
            if (testCase.input.nums && testCase.input.target !== undefined) {
              // Two Sum format: {"nums":[...],"target":...}
              stdin = JSON.stringify(testCase.input.nums) + '\n' + JSON.stringify(testCase.input.target);
            } else if (testCase.input.nums) {
              // Maximum Subarray or other problems with just nums array
              stdin = JSON.stringify(testCase.input.nums);
            } else if (Array.isArray(testCase.input) && typeof testCase.input[0] === 'object') {
              // Array of objects format
              stdin = testCase.input.map(obj => {
                if (obj.nums && obj.target !== undefined) {
                  return JSON.stringify(obj.nums) + '\n' + JSON.stringify(obj.target);
                } else if (obj.nums) {
                  return JSON.stringify(obj.nums);
                }
                return JSON.stringify(obj);
              }).join('\n');
            } else {
              // Other JSON formats
              stdin = JSON.stringify(testCase.input);
            }
          } else if (typeof testCase.input === 'string') {
            // If input is already a string, check if it's JSON that needs parsing
            try {
              const parsed = JSON.parse(testCase.input);
              console.log('Parsed JSON:', parsed);
              if (parsed.nums && parsed.target !== undefined) {
                // Two Sum format: {"nums":[...],"target":...}
                stdin = JSON.stringify(parsed.nums) + '\n' + JSON.stringify(parsed.target);
                console.log('Converted to Two Sum format:', stdin);
              } else if (parsed.nums) {
                // Maximum Subarray format: {"nums":[...]}
                stdin = JSON.stringify(parsed.nums);
                console.log('Converted to Maximum Subarray format:', stdin);
              } else {
                // Already proper stdin format
                stdin = testCase.input;
                console.log('Used as-is (no conversion needed):', stdin);
              }
            } catch (parseError) {
              // Not JSON, use as-is
              stdin = testCase.input;
              console.log('Not JSON, used as-is:', stdin);
            }
          }
        }

        console.log(`Processing test case input:`, testCase.input);
        console.log(`Converted to stdin:`, stdin);

        const response = await axios.post(
          JUDGE0_API_URL,
          {
            source_code: code,
            language_id: languageId,
            stdin: stdin,
            expected_output: testCase.expectedOutput || ''
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        const submission = response.data;
        submissionIds.push(submission.token);

        // Process the result
        const testResult = {
          input: stdin,  // Use converted stdin for display
          expectedOutput: testCase.expectedOutput || '',
          actualOutput: submission.stdout || '',
          passed: submission.status?.id === 3, // Status 3 = Accepted
          runtime: submission.time ? `${Math.round(submission.time * 1000)}ms` : 'N/A',
          statusId: submission.status?.id,
          statusDescription: submission.status?.description,
          stderr: submission.stderr || '',
          compilationError: submission.compile_output || ''
        };

        results.push(testResult);
        console.log(`Test case result:`, testResult);
      } catch (testError) {
        console.error('Error submitting test case to Judge0:', testError.message);
        results.push({
          input: typeof testCase.input === 'object' ? JSON.stringify(testCase.input) : testCase.input || '',
          expectedOutput: testCase.expectedOutput || '',
          actualOutput: '',
          passed: false,
          runtime: 'N/A',
          statusDescription: 'Submission Error',
          stderr: testError.message,
          compilationError: testError.message
        });
      }
    }

    // Calculate summary
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    return res.json({
      success: true,
      results: results,
      summary: {
        totalTests: totalCount,
        passedTests: passedCount,
        failedTests: totalCount - passedCount,
        allPassed: passedCount === totalCount
      },
      submissionIds: submissionIds
    });

  } catch (err) {
    console.error("Code execution error:", err);
    return res.status(500).json({
      error: "Failed to execute code",
      details: err.message
    });
  }
});

export default router;
