import express from 'express';

const router = express.Router();

// Get user's solved problems by topic
router.get('/topics/:user_id', async (req, res) => {
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

        // Get all solved problems with topics
        const { data: solvedProblems, error } = await supabase
            .from('user_problem_status')
            .select('problem_id, problems(topics)')
            .eq('user_id', user_id)
            .eq('status', 'solved');

        if (error) {
            console.error("Error fetching topics:", error);
            return res.status(500).json({ error: "Failed to fetch topics" });
        }

        // Count by topic
        const topicCounts = {};
        solvedProblems?.forEach(item => {
            const topics = item.problems?.topics || [];
            topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        const topicsArray = Object.entries(topicCounts)
            .map(([name, solved]) => ({ name, solved }))
            .sort((a, b) => b.solved - a.solved);

        return res.json({
            success: true,
            topics: topicsArray
        });

    } catch (err) {
        console.error("Get topics error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get user's activity calendar (solved problems by day)
router.get('/activity/:user_id', async (req, res) => {
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

        const { data, error } = await supabase
            .from('user_problem_status')
            .select('solved_at')
            .eq('user_id', user_id)
            .eq('status', 'solved')
            .not('solved_at', 'is', null);

        if (error) {
            console.error("Error fetching activity:", error);
            return res.status(500).json({ error: "Failed to fetch activity" });
        }

        // Group by day
        const activityMap = {};
        data?.forEach(item => {
            if (item.solved_at) {
                const day = item.solved_at.split('T')[0]; // YYYY-MM-DD
                activityMap[day] = (activityMap[day] || 0) + 1;
            }
        });

        return res.json({
            success: true,
            activity: activityMap
        });

    } catch (err) {
        console.error("Get activity error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get user's problem lists (solved, attempted, liked, starred)
router.get('/problems/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { type } = req.query; // 'solved', 'attempted', 'liked', 'starred'

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

        let query = supabase
            .from('user_problem_status')
            .select('problem_id, status, problems(id, problem_number, title, difficulty, acceptance_rate)')
            .eq('user_id', user_id);

        // Apply filters based on type
        if (type === 'solved') {
            query = query.eq('status', 'solved');
        } else if (type === 'attempted') {
            query = query.eq('status', 'attempted');
        } else if (type === 'liked') {
            query = query.eq('liked', true);
        } else if (type === 'starred') {
            query = query.eq('starred', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching problems:", error);
            return res.status(500).json({ error: "Failed to fetch problems" });
        }

        const problems = data?.map(item => ({
            id: item.problems?.id,
            problemNumber: item.problems?.problem_number,
            title: item.problems?.title,
            difficulty: item.problems?.difficulty,
            acceptanceRate: item.problems?.acceptance_rate,
            status: item.status
        })) || [];

        return res.json({
            success: true,
            count: problems.length,
            problems: problems
        });

    } catch (err) {
        console.error("Get problems error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;
