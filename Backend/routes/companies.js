import express from 'express';

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("Error fetching companies:", error);
            return res.status(500).json({ error: "Failed to fetch companies", details: error.message });
        }

        return res.json({ success: true, companies: data });

    } catch (err) {
        console.error("Get companies error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

// Get company by ID with its problems
router.get('/:companyId', async (req, res) => {
    const { companyId } = req.params;

    if (!companyId) {
        return res.status(400).json({ error: "Missing company ID" });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration');
            return res.status(500).json({ error: "Database configuration missing" });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get company details
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

        if (companyError) {
            console.error("Error fetching company:", companyError);
            return res.status(500).json({ error: "Failed to fetch company", details: companyError.message });
        }

        // Get problems for this company
        const { data: companyProblems, error: problemsError } = await supabase
            .from('company_problems')
            .select(`
                frequency,
                problem_id,
                problems (
                    id,
                    problem_number,
                    slug,
                    title,
                    difficulty,
                    topics,
                    acceptance_rate
                )
            `)
            .eq('company_id', companyId)
            .order('frequency', { ascending: false });

        if (problemsError) {
            console.error("Error fetching company problems:", problemsError);
            return res.status(500).json({ error: "Failed to fetch company problems", details: problemsError.message });
        }

        // Format the response
        const problems = (companyProblems || []).map(cp => ({
            id: cp.problems.id,
            problemNumber: cp.problems.problem_number,
            slug: cp.problems.slug,
            title: cp.problems.title,
            difficulty: cp.problems.difficulty,
            topics: Array.isArray(cp.problems.topics) ? cp.problems.topics : (cp.problems.topics ? JSON.parse(cp.problems.topics) : []),
            acceptanceRate: cp.problems.acceptance_rate,
            frequency: cp.frequency
        }));

        return res.json({
            success: true,
            company: {
                ...company,
                difficulty: typeof company.difficulty === 'string' ? JSON.parse(company.difficulty) : company.difficulty,
                popular_topics: typeof company.popular_topics === 'string' ? JSON.parse(company.popular_topics) : company.popular_topics
            },
            problems
        });

    } catch (err) {
        console.error("Get company details error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

export default router;
