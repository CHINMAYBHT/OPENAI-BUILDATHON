import express from 'express';

const router = express.Router();

// Get or create user's progress for a company
router.get('/:user_id/:company_id', async (req, res) => {
    const { user_id, company_id } = req.params;

    if (!user_id || !company_id) {
        return res.status(400).json({ error: "Missing user_id or company_id" });
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

        // First try to get existing progress
        const { data, error } = await supabase
            .from('user_company_progress')
            .select('*')
            .eq('user_id', user_id)
            .eq('company_id', company_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching company progress:", error);
            return res.status(500).json({ error: "Failed to fetch progress", details: error.message });
        }

        // If no progress exists, return default values
        if (!data) {
            return res.json({
                exists: false,
                progress: {
                    solved_total: 0,
                    solved_easy: 0,
                    solved_medium: 0,
                    solved_hard: 0,
                    total_easy: 0,
                    total_medium: 0,
                    total_hard: 0,
                    total_questions: 0
                }
            });
        }

        return res.json({
            exists: true,
            progress: data
        });

    } catch (err) {
        console.error("Get company progress error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Update user's company progress
router.post('/update', async (req, res) => {
    const { user_id, company_id, progress } = req.body;

    if (!user_id || !company_id || !progress) {
        return res.status(400).json({ error: "Missing required fields" });
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

        const { data, error } = await supabase
            .from('user_company_progress')
            .upsert({
                user_id,
                company_id,
                solved_total: progress.solved_total,
                solved_easy: progress.solved_easy,
                solved_medium: progress.solved_medium,
                solved_hard: progress.solved_hard,
                total_easy: progress.total_easy,
                total_medium: progress.total_medium,
                total_hard: progress.total_hard,
                total_questions: progress.total_questions,
                last_updated: new Date().toISOString()
            }, {
                onConflict: 'user_id,company_id'
            })
            .select();

        if (error) {
            console.error("Error updating company progress:", error);
            return res.status(500).json({ error: "Failed to update progress", details: error.message });
        }

        return res.json({
            success: true,
            progress: data[0]
        });

    } catch (err) {
        console.error("Update company progress error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Sync company progress based on user_problem_status
router.post('/sync', async (req, res) => {
    const { user_id, company_id } = req.body;

    if (!user_id || !company_id) {
        return res.status(400).json({ error: "Missing user_id or company_id" });
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

        // Get all problems for this company
        const { data: companyProblems, error: companyError } = await supabase
            .from('company_problems')
            .select('problem_id, problems(id, difficulty)')
            .eq('company_id', company_id);

        if (companyError) {
            console.error("Error fetching company problems:", companyError);
            return res.status(500).json({ error: "Failed to fetch company problems" });
        }

        const problemIds = companyProblems.map(cp => cp.problem_id);

        // Get user's problem statuses for these problems
        const { data: statuses, error: statusError } = await supabase
            .from('user_problem_status')
            .select('problem_id, status')
            .eq('user_id', user_id)
            .in('problem_id', problemIds);

        if (statusError) {
            console.error("Error fetching problem statuses:", statusError);
            return res.status(500).json({ error: "Failed to fetch statuses" });
        }

        // Create a map of problem statuses
        const statusMap = {};
        statuses?.forEach(s => {
            statusMap[s.problem_id] = s.status;
        });

        // Calculate progress
        let solved_total = 0;
        let solved_easy = 0;
        let solved_medium = 0;
        let solved_hard = 0;
        let total_easy = 0;
        let total_medium = 0;
        let total_hard = 0;

        companyProblems.forEach(cp => {
            const difficulty = cp.problems?.difficulty?.toLowerCase();

            // Count totals by difficulty
            if (difficulty === 'easy') total_easy++;
            else if (difficulty === 'medium') total_medium++;
            else if (difficulty === 'hard') total_hard++;

            // Count solved by difficulty
            if (statusMap[cp.problem_id] === 'solved') {
                solved_total++;
                if (difficulty === 'easy') solved_easy++;
                else if (difficulty === 'medium') solved_medium++;
                else if (difficulty === 'hard') solved_hard++;
            }
        });

        // Update or insert progress
        const { data, error } = await supabase
            .from('user_company_progress')
            .upsert({
                user_id,
                company_id,
                solved_total,
                solved_easy,
                solved_medium,
                solved_hard,
                total_easy,
                total_medium,
                total_hard,
                total_questions: companyProblems.length,
                last_updated: new Date().toISOString()
            }, {
                onConflict: 'user_id,company_id'
            })
            .select();

        if (error) {
            console.error("Error syncing company progress:", error);
            return res.status(500).json({ error: "Failed to sync progress", details: error.message });
        }

        return res.json({
            success: true,
            progress: data[0]
        });

    } catch (err) {
        console.error("Sync company progress error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Sync progress for companies associated with a specific problem
router.post('/sync-for-problem/:user_id/:problem_id', async (req, res) => {
    const { user_id, problem_id } = req.params;

    if (!user_id || !problem_id) {
        return res.status(400).json({ error: "Missing user_id or problem_id" });
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

        // Get companies associated with this problem
        const { data: companyLinks, error: linkError } = await supabase
            .from('company_problems')
            .select('company_id')
            .eq('problem_id', problem_id);

        if (linkError || !companyLinks || companyLinks.length === 0) {
            // Problem not associated with any company, return success
            return res.json({ success: true, synced: 0, message: 'Problem not associated with any company' });
        }

        const companyIds = companyLinks.map(link => link.company_id);

        // Get user's solved problems
        const { data: userStatuses, error: statusError } = await supabase
            .from('user_problem_status')
            .select('problem_id, status')
            .eq('user_id', user_id);

        const statusMap = {};
        if (!statusError && userStatuses) {
            userStatuses.forEach(s => {
                statusMap[s.problem_id] = s.status;
            });
        }

        // Process each company this problem belongs to
        const progressRecords = [];

        for (const companyId of companyIds) {
            // Get all problems for this company
            const { data: companyProblems, error: cpError } = await supabase
                .from('company_problems')
                .select('problem_id, problems(difficulty)')
                .eq('company_id', companyId);

            if (cpError) continue;

            let solved_total = 0, solved_easy = 0, solved_medium = 0, solved_hard = 0;
            let total_easy = 0, total_medium = 0, total_hard = 0;

            companyProblems.forEach(cp => {
                const difficulty = cp.problems?.difficulty?.toLowerCase();

                // Count totals by difficulty
                if (difficulty === 'easy') total_easy++;
                else if (difficulty === 'medium') total_medium++;
                else if (difficulty === 'hard') total_hard++;

                // Count solved by difficulty
                if (statusMap[cp.problem_id] === 'solved') {
                    solved_total++;
                    if (difficulty === 'easy') solved_easy++;
                    else if (difficulty === 'medium') solved_medium++;
                    else if (difficulty === 'hard') solved_hard++;
                }
            });

            progressRecords.push({
                user_id,
                company_id: companyId,
                solved_total,
                solved_easy,
                solved_medium,
                solved_hard,
                total_easy,
                total_medium,
                total_hard,
                total_questions: companyProblems.length,
                last_updated: new Date().toISOString()
            });
        }

        // Upsert progress records
        const { data, error } = await supabase
            .from('user_company_progress')
            .upsert(progressRecords, {
                onConflict: 'user_id,company_id'
            })
            .select();

        if (error) {
            console.error("Error syncing company progress for problem:", error);
            return res.status(500).json({ error: "Failed to sync progress", details: error.message });
        }

        return res.json({
            success: true,
            synced: data.length,
            companies: companyIds
        });

    } catch (err) {
        console.error("Sync company progress for problem error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Sync progress for ALL companies for a user
router.post('/sync-all/:user_id', async (req, res) => {
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

        // Get all companies
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id');

        if (companiesError) {
            console.error("Error fetching companies:", companiesError);
            return res.status(500).json({ error: "Failed to fetch companies" });
        }

        // Get user's solved problems
        const { data: userStatuses, error: statusError } = await supabase
            .from('user_problem_status')
            .select('problem_id, status')
            .eq('user_id', user_id);

        const statusMap = {};
        if (!statusError && userStatuses) {
            userStatuses.forEach(s => {
                statusMap[s.problem_id] = s.status;
            });
        }

        // Process each company
        const progressRecords = [];

        for (const company of companies) {
            // Get all problems for this company
            const { data: companyProblems, error: cpError } = await supabase
                .from('company_problems')
                .select('problem_id, problems(difficulty)')
                .eq('company_id', company.id);

            if (cpError) continue;

            let solved_total = 0, solved_easy = 0, solved_medium = 0, solved_hard = 0;
            let total_easy = 0, total_medium = 0, total_hard = 0;

            companyProblems.forEach(cp => {
                const difficulty = cp.problems?.difficulty?.toLowerCase();

                // Count totals by difficulty
                if (difficulty === 'easy') total_easy++;
                else if (difficulty === 'medium') total_medium++;
                else if (difficulty === 'hard') total_hard++;

                // Count solved by difficulty
                if (statusMap[cp.problem_id] === 'solved') {
                    solved_total++;
                    if (difficulty === 'easy') solved_easy++;
                    else if (difficulty === 'medium') solved_medium++;
                    else if (difficulty === 'hard') solved_hard++;
                }
            });

            progressRecords.push({
                user_id,
                company_id: company.id,
                solved_total,
                solved_easy,
                solved_medium,
                solved_hard,
                total_easy,
                total_medium,
                total_hard,
                total_questions: companyProblems.length,
                last_updated: new Date().toISOString()
            });
        }

        // Bulk upsert all progress records
        const { data, error } = await supabase
            .from('user_company_progress')
            .upsert(progressRecords, {
                onConflict: 'user_id,company_id'
            })
            .select();

        if (error) {
            console.error("Error syncing all company progress:", error);
            return res.status(500).json({ error: "Failed to sync all progress", details: error.message });
        }

        return res.json({
            success: true,
            synced: data.length,
            progress: data
        });

    } catch (err) {
        console.error("Sync all company progress error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;

