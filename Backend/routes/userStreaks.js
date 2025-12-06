import express from 'express';

const router = express.Router();

// Get user's streak data
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

        // First try to get from user_streaks table
        const { data, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user streaks:", error);
            return res.status(500).json({ error: "Failed to fetch streaks", details: error.message });
        }

        // If no data exists, calculate from actual solved dates
        if (!data) {
            const calculatedStreak = await calculateStreakFromData(supabase, user_id);
            return res.json({
                success: true,
                streak: calculatedStreak
            });
        }

        // Return streak data
        return res.json({
            success: true,
            streak: data
        });

    } catch (err) {
        console.error("Get user streaks error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get calendar data - days when user solved problems
router.get('/:user_id/calendar', async (req, res) => {
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

        // Get all solved dates with counts
        const { data, error } = await supabase
            .from('user_problem_status')
            .select('solved_at')
            .eq('user_id', user_id)
            .eq('status', 'solved')
            .not('solved_at', 'is', null);

        if (error) {
            console.error("Error fetching calendar data:", error);
            return res.status(500).json({ error: "Failed to fetch calendar data" });
        }

        // Group by day and count
        const dayCount = {};
        data?.forEach(item => {
            if (item.solved_at) {
                const day = new Date(item.solved_at).toISOString().split('T')[0];
                dayCount[day] = (dayCount[day] || 0) + 1;
            }
        });

        return res.json({
            success: true,
            calendar: dayCount
        });

    } catch (err) {
        console.error("Get calendar data error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Helper function to calculate streak from actual data
async function calculateStreakFromData(supabase, user_id) {
    const { data, error } = await supabase
        .from('user_problem_status')
        .select('solved_at')
        .eq('user_id', user_id)
        .eq('status', 'solved')
        .not('solved_at', 'is', null)
        .order('solved_at', { ascending: false });

    if (error || !data || data.length === 0) {
        return {
            current_streak: 0,
            longest_streak: 0,
            last_solved_at: null
        };
    }

    // Get unique days
    const uniqueDays = [...new Set(data.map(item =>
        new Date(item.solved_at).toISOString().split('T')[0]
    ))].sort().reverse();

    if (uniqueDays.length === 0) {
        return {
            current_streak: 0,
            longest_streak: 0,
            last_solved_at: null
        };
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    if (uniqueDays[0] === today || uniqueDays[0] === yesterdayStr) {
        let checkDate = new Date(uniqueDays[0]);
        currentStreak = 1;

        for (let i = 1; i < uniqueDays.length; i++) {
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            const prevDateStr = prevDate.toISOString().split('T')[0];

            if (uniqueDays[i] === prevDateStr) {
                currentStreak++;
                checkDate = new Date(uniqueDays[i]);
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
        const currentDate = new Date(uniqueDays[i]);
        const prevDate = new Date(uniqueDays[i - 1]);
        prevDate.setDate(prevDate.getDate() - 1);

        if (currentDate.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_solved_at: uniqueDays[0]
    };
}

// Update user streak (called after successful submission)
router.post('/update', async (req, res) => {
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

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Get existing streak record
        const { data: existingStreak, error: fetchError } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching streak:", fetchError);
            return res.status(500).json({ error: "Failed to fetch streak" });
        }

        let newCurrentStreak = 1;
        let newLongestStreak = 1;

        if (existingStreak) {
            const lastSolvedDate = existingStreak.last_solved_at;

            // If solved today already, don't update
            if (lastSolvedDate === today) {
                return res.json({
                    success: true,
                    streak: existingStreak,
                    message: "Already solved today"
                });
            }

            // Calculate if streak continues
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastSolvedDate === yesterdayStr) {
                // Streak continues
                newCurrentStreak = (existingStreak.current_streak || 0) + 1;
            } else {
                // Streak broken, start new
                newCurrentStreak = 1;
            }

            newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak || 0);
        }

        // Upsert streak record
        const { data, error } = await supabase
            .from('user_streaks')
            .upsert({
                user_id: user_id,
                current_streak: newCurrentStreak,
                longest_streak: newLongestStreak,
                last_solved_at: today
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error("Error updating streak:", error);
            return res.status(500).json({ error: "Failed to update streak" });
        }

        return res.json({
            success: true,
            streak: data
        });

    } catch (err) {
        console.error("Update user streak error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;
