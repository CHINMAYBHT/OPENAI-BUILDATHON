import express from 'express';

const router = express.Router();

// Get user's language statistics
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Always calculate from submissions for real-time accuracy
        const calculatedLanguages = await calculateLanguagesFromSubmissions(supabase, user_id);
        return res.json({
            success: true,
            languages: calculatedLanguages
        });

    } catch (err) {
        console.error("Get user languages error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Helper function to calculate languages from submissions
async function calculateLanguagesFromSubmissions(supabase, user_id) {
    // Get user's submissions with passed status
    const { data: userSubmissions, error: userError } = await supabase
        .from('submissions')
        .select('language, final_status, problem_id')
        .eq('user_id', user_id)
        .eq('final_status', 'passed');

    // Count unique problems solved per language by user
    const userLanguageProblems = {};
    if (!userError && userSubmissions) {
        userSubmissions.forEach(sub => {
            if (!sub.language) return;

            if (!userLanguageProblems[sub.language]) {
                userLanguageProblems[sub.language] = new Set();
            }
            userLanguageProblems[sub.language].add(sub.problem_id);
        });
    }

    // Get ALL distinct languages from submissions table
    const { data: allLanguages, error: langError } = await supabase
        .from('submissions')
        .select('language')
        .not('language', 'is', null);

    // Get unique languages and count total problems per language
    const allLanguageProblems = {};
    if (!langError && allLanguages) {
        allLanguages.forEach(sub => {
            if (sub.language) {
                allLanguageProblems[sub.language] = true;
            }
        });
    }

    // Get total problem count for each language
    const { data: allSubmissions } = await supabase
        .from('submissions')
        .select('language, problem_id, final_status')
        .eq('final_status', 'passed')
        .not('language', 'is', null);

    const totalLanguageProblems = {};
    if (allSubmissions) {
        allSubmissions.forEach(sub => {
            if (!sub.language) return;
            if (!totalLanguageProblems[sub.language]) {
                totalLanguageProblems[sub.language] = new Set();
            }
            totalLanguageProblems[sub.language].add(sub.problem_id);
        });
    }

    // Create array with ALL languages, showing 0 for unused ones
    const languages = Object.keys(allLanguageProblems).map(language => ({
        language,
        solved_count: userLanguageProblems[language] ? userLanguageProblems[language].size : 0,
        total_count: totalLanguageProblems[language] ? totalLanguageProblems[language].size : 0
    })).sort((a, b) => b.solved_count - a.solved_count || b.total_count - a.total_count);

    return languages;
}

// Update language count after successful submission
router.post('/update', async (req, res) => {
    const { user_id, language, is_solved } = req.body;

    if (!user_id || !language) {
        return res.status(400).json({ error: "Missing user_id or language" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get current record if exists
        const { data: existingRecord, error: fetchError } = await supabase
            .from('user_languages')
            .select('*')
            .eq('user_id', user_id)
            .eq('language', language)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching existing language record:", fetchError);
            return res.status(500).json({ error: "Failed to fetch language record" });
        }

        let result;

        if (existingRecord) {
            // Update existing record - only increment if is_solved is true
            const newCount = is_solved ? (existingRecord.solved_count || 0) + 1 : (existingRecord.solved_count || 0);

            const { data, error } = await supabase
                .from('user_languages')
                .update({ solved_count: newCount })
                .eq('user_id', user_id)
                .eq('language', language)
                .select()
                .single();

            if (error) {
                console.error("Error updating language count:", error);
                return res.status(500).json({ error: "Failed to update language count" });
            }
            result = data;
        } else {
            // Insert new record
            const { data, error } = await supabase
                .from('user_languages')
                .insert({
                    user_id: user_id,
                    language: language,
                    solved_count: is_solved ? 1 : 0
                })
                .select()
                .single();

            if (error) {
                console.error("Error inserting language record:", error);
                return res.status(500).json({ error: "Failed to insert language record" });
            }
            result = data;
        }

        return res.json({
            success: true,
            language_record: result
        });

    } catch (err) {
        console.error("Update user language error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Sync all languages from submissions (recalculate from scratch)
router.post('/sync', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get all successful submissions for this user
        const { data: submissions, error: submissionsError } = await supabase
            .from('submissions')
            .select('language, final_status, problem_id')
            .eq('user_id', user_id)
            .eq('final_status', 'passed');

        if (submissionsError) {
            console.error("Error fetching submissions:", submissionsError);
            return res.status(500).json({ error: "Failed to fetch submissions" });
        }

        // Count unique problems solved per language
        const languageProblems = {};
        submissions?.forEach(sub => {
            if (!sub.language) return;

            if (!languageProblems[sub.language]) {
                languageProblems[sub.language] = new Set();
            }
            languageProblems[sub.language].add(sub.problem_id);
        });

        // Convert to counts
        const languageCounts = {};
        Object.entries(languageProblems).forEach(([language, problemSet]) => {
            languageCounts[language] = problemSet.size;
        });

        // Delete existing records and insert new ones
        await supabase
            .from('user_languages')
            .delete()
            .eq('user_id', user_id);

        if (Object.keys(languageCounts).length > 0) {
            const languageRecords = Object.entries(languageCounts).map(([language, count]) => ({
                user_id: user_id,
                language: language,
                solved_count: count
            }));

            const { data, error } = await supabase
                .from('user_languages')
                .insert(languageRecords)
                .select();

            if (error) {
                console.error("Error inserting language records:", error);
                return res.status(500).json({ error: "Failed to sync languages" });
            }

            return res.json({
                success: true,
                languages: data
            });
        }

        return res.json({
            success: true,
            languages: []
        });

    } catch (err) {
        console.error("Sync user languages error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;
