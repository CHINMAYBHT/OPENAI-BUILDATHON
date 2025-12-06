import express from 'express';

const router = express.Router();

// Get user's problem status
router.get('/status/:user_id/:problem_id', async (req, res) => {
    const { user_id, problem_id } = req.params;

    if (!user_id || !problem_id) {
        return res.status(400).json({ error: "Missing user_id or problem_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_ANON_KEY');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .select('*')
            .eq('user_id', user_id)
            .eq('problem_id', problem_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "no rows found" which is normal
            console.error("Error fetching problem status:", error);
            return res.status(500).json({ error: "Failed to fetch status", details: error.message });
        }

        // Return status or default values if not found
        return res.json({
            status: data?.status || 'unsolved',
            starred: data?.starred || false,
            liked: data?.liked || false,
            saved: data?.saved || false,
            times_attempted: data?.times_attempted || 0,
            solved_at: data?.solved_at || null,
            last_attempt_at: data?.last_attempt_at || null
        });

    } catch (err) {
        console.error("Get status error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Update problem status
router.post('/status/:user_id/:problem_id', async (req, res) => {
    const { user_id, problem_id } = req.params;
    const { status, starred, liked, saved } = req.body;

    if (!user_id || !problem_id) {
        return res.status(400).json({ error: "Missing user_id or problem_id" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_ANON_KEY');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const upsertData = {
            user_id,
            problem_id
        };

        if (status) upsertData.status = status;
        if (starred !== undefined) upsertData.starred = starred;
        if (liked !== undefined) upsertData.liked = liked;
        if (saved !== undefined) upsertData.saved = saved;
        if (status === 'attempted') upsertData.last_attempt_at = new Date().toISOString();
        if (status === 'solved') upsertData.solved_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('user_problem_status')
            .upsert(upsertData, {
                onConflict: 'user_id,problem_id'
            })
            .select()
            .single();

        if (error) {
            console.error("Error updating status:", error);
            return res.status(500).json({ error: "Failed to update status", details: error.message });
        }

        // Sync company progress after status update (don't wait for it)
        if (status === 'solved' || status === 'attempted') {
            fetch(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/company-progress/sync-for-problem/${user_id}/${problem_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }).catch(err => {
                console.error('Background sync company progress failed:', err.message);
            });
        }

        return res.json({ success: true, message: 'Status updated', data });

    } catch (err) {
        console.error("Update status error:", err);
        return res.status(500).json({ error: String(err) });
    }
});// Toggle star on problem
router.post('/star/:user_id/:problem_id', async (req, res) => {
    const { user_id, problem_id } = req.params;
    const { starred } = req.body;

    if (!user_id || !problem_id || starred === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_ANON_KEY');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .upsert({
                user_id,
                problem_id,
                starred
            }, {
                onConflict: 'user_id,problem_id'
            })
            .select()
            .single();

        if (error) {
            console.error("Error toggling star - Full error:", JSON.stringify(error, null, 2));
            console.error("Request params - user_id:", user_id, "problem_id:", problem_id, "starred:", starred);
            return res.status(500).json({ error: "Failed to toggle star", details: error.message, code: error.code });
        }

        return res.json({ success: true, starred: data.starred });

    } catch (err) {
        console.error("Toggle star catch error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Toggle like on problem
router.post('/like/:user_id/:problem_id', async (req, res) => {
    const { user_id, problem_id } = req.params;
    const { liked } = req.body;

    if (!user_id || !problem_id || liked === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_ANON_KEY');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .upsert({
                user_id,
                problem_id,
                liked
            }, {
                onConflict: 'user_id,problem_id'
            })
            .select()
            .single();

        if (error) {
            console.error("Error toggling like - Full error:", JSON.stringify(error, null, 2));
            console.error("Request params - user_id:", user_id, "problem_id:", problem_id, "liked:", liked);
            return res.status(500).json({ error: "Failed to toggle like", details: error.message, code: error.code });
        }

        return res.json({ success: true, liked: data.liked });

    } catch (err) {
        console.error("Toggle like catch error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Toggle save problem for later
router.post('/save/:user_id/:problem_id', async (req, res) => {
    const { user_id, problem_id } = req.params;
    const { saved } = req.body;

    if (!user_id || !problem_id || saved === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_ANON_KEY');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('user_problem_status')
            .upsert({
                user_id,
                problem_id,
                saved
            }, {
                onConflict: 'user_id,problem_id'
            })
            .select()
            .single();

        if (error) {
            console.error("Error toggling save:", error);
            return res.status(500).json({ error: "Failed to toggle save", details: error.message });
        }

        return res.json({ success: true, saved: data.saved });

    } catch (err) {
        console.error("Toggle save error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get bulk problem statuses for multiple problems
router.post('/bulk', async (req, res) => {
    const { user_id, problem_ids } = req.body;

    if (!user_id || !problem_ids || !Array.isArray(problem_ids)) {
        return res.status(400).json({ error: "Missing user_id or problem_ids array" });
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
            .select('*')
            .eq('user_id', user_id)
            .in('problem_id', problem_ids);

        if (error) {
            console.error("Error fetching bulk statuses:", error);
            return res.status(500).json({ error: "Failed to fetch statuses", details: error.message });
        }

        return res.json({
            success: true,
            statuses: data || []
        });

    } catch (err) {
        console.error("Bulk status fetch error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;
