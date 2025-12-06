import express from 'express';

const router = express.Router();

// Get user's overall statistics
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

        // Get all solved problems for this user
        const { data: solvedStatuses, error: statusError } = await supabase
            .from('user_problem_status')
            .select('problem_id, status')
            .eq('user_id', user_id)
            .eq('status', 'solved');

        if (statusError) {
            console.error("Error fetching user problem statuses:", statusError);
            return res.status(500).json({ error: "Failed to fetch problem statuses" });
        }

        const solvedProblemIds = solvedStatuses?.map(s => s.problem_id) || [];

        let easySolved = 0;
        let mediumSolved = 0;
        let hardSolved = 0;

        // Get difficulty for each solved problem
        if (solvedProblemIds.length > 0) {
            const { data: problems, error: problemsError } = await supabase
                .from('problems')
                .select('id, difficulty')
                .in('id', solvedProblemIds);

            if (problemsError) {
                console.error("Error fetching problems:", problemsError);
            } else {
                problems?.forEach(problem => {
                    const difficulty = problem.difficulty?.toLowerCase();
                    if (difficulty === 'easy') easySolved++;
                    else if (difficulty === 'medium') mediumSolved++;
                    else if (difficulty === 'hard') hardSolved++;
                });
            }
        }

        // Get total problem counts by difficulty
        const { data: allProblems, error: allProblemsError } = await supabase
            .from('problems')
            .select('difficulty');

        let totalEasy = 0;
        let totalMedium = 0;
        let totalHard = 0;

        if (!allProblemsError && allProblems) {
            allProblems.forEach(problem => {
                const difficulty = problem.difficulty?.toLowerCase();
                if (difficulty === 'easy') totalEasy++;
                else if (difficulty === 'medium') totalMedium++;
                else if (difficulty === 'hard') totalHard++;
            });
        }

        // Get topics with solved counts - direct query
        const { data: topicData, error: topicError } = await supabase
            .from('user_problem_status')
            .select('problem_id, problems(topics)')
            .eq('user_id', user_id)
            .eq('status', 'solved');

        let topics = [];

        // Extract and count solved topics
        const topicCounts = {};
        if (!topicError && topicData) {
            topicData.forEach(item => {
                if (item.problems && item.problems.topics) {
                    const problemTopics = item.problems.topics;
                    problemTopics.forEach(topic => {
                        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                    });
                }
            });
        }

        // Get total counts for ALL topics
        const { data: allProblemsWithTopics } = await supabase
            .from('problems')
            .select('topics');

        const totalTopicCounts = {};
        if (allProblemsWithTopics) {
            allProblemsWithTopics.forEach(problem => {
                if (problem.topics) {
                    problem.topics.forEach(topic => {
                        totalTopicCounts[topic] = (totalTopicCounts[topic] || 0) + 1;
                    });
                }
            });
        }

        // Create array with ALL topics, showing 0 for unsolved
        topics = Object.entries(totalTopicCounts).map(([topic, total_count]) => ({
            topic,
            solved_count: topicCounts[topic] || 0,
            total_count
        })).sort((a, b) => b.solved_count - a.solved_count || b.total_count - a.total_count);

        return res.json({
            success: true,
            stats: {
                totalSolved: solvedProblemIds.length,
                totalProblems: allProblems?.length || 0,
                easy: easySolved,
                medium: mediumSolved,
                hard: hardSolved,
                totalEasy,
                totalMedium,
                totalHard,
                topics
            }
        });

    } catch (err) {
        console.error("Get user stats error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get solved problems with details
router.get('/:user_id/solved', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .select('problem_id, problems(id, title, difficulty, acceptance_rate)')
            .eq('user_id', user_id)
            .eq('status', 'solved');

        if (error) {
            console.error("Error fetching solved problems:", error);
            return res.status(500).json({ error: "Failed to fetch solved problems" });
        }

        const problems = data?.map(item => ({
            id: item.problems.id,
            title: item.problems.title,
            difficulty: item.problems.difficulty,
            acceptanceRate: item.problems.acceptance_rate,
            status: 'solved'
        })) || [];

        return res.json({
            success: true,
            count: problems.length,
            problems
        });

    } catch (err) {
        console.error("Get solved problems error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get attempted problems with details
router.get('/:user_id/attempted', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .select('problem_id, problems(id, title, difficulty, acceptance_rate)')
            .eq('user_id', user_id)
            .eq('status', 'attempted');

        if (error) {
            console.error("Error fetching attempted problems:", error);
            return res.status(500).json({ error: "Failed to fetch attempted problems" });
        }

        const problems = data?.map(item => ({
            id: item.problems.id,
            title: item.problems.title,
            difficulty: item.problems.difficulty,
            acceptanceRate: item.problems.acceptance_rate,
            status: 'attempted'
        })) || [];

        return res.json({
            success: true,
            count: problems.length,
            problems
        });

    } catch (err) {
        console.error("Get attempted problems error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get liked problems with details
router.get('/:user_id/liked', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .select('problem_id, status, problems(id, title, difficulty, acceptance_rate)')
            .eq('user_id', user_id)
            .eq('liked', true);

        if (error) {
            console.error("Error fetching liked problems:", error);
            return res.status(500).json({ error: "Failed to fetch liked problems" });
        }

        const problems = data?.map(item => ({
            id: item.problems.id,
            title: item.problems.title,
            difficulty: item.problems.difficulty,
            acceptanceRate: item.problems.acceptance_rate,
            status: item.status
        })) || [];

        return res.json({
            success: true,
            count: problems.length,
            problems
        });

    } catch (err) {
        console.error("Get liked problems error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get starred problems with details
router.get('/:user_id/starred', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .select('problem_id, status, problems(id, title, difficulty, acceptance_rate)')
            .eq('user_id', user_id)
            .eq('starred', true);

        if (error) {
            console.error("Error fetching starred problems:", error);
            return res.status(500).json({ error: "Failed to fetch starred problems" });
        }

        const problems = data?.map(item => ({
            id: item.problems.id,
            title: item.problems.title,
            difficulty: item.problems.difficulty,
            acceptanceRate: item.problems.acceptance_rate,
            status: item.status
        })) || [];

        return res.json({
            success: true,
            count: problems.length,
            problems
        });

    } catch (err) {
        console.error("Get starred problems error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;
