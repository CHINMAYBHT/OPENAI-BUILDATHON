-- Function to get user's solved topics with total counts
CREATE OR REPLACE FUNCTION get_user_topics(p_user_id uuid) RETURNS TABLE (
        topic text,
        solved_count bigint,
        total_count bigint
    ) AS $$ BEGIN RETURN QUERY WITH user_solved AS (
        SELECT topic,
            COUNT(*) as solved_count
        FROM (
                -- Expand topics for solved problems
                SELECT jsonb_array_elements_text(p.topics) as topic
                FROM user_problem_status ups
                    JOIN problems p ON p.id = ups.problem_id
                WHERE ups.user_id = p_user_id
                    AND ups.status = 'solved'
            ) t
        GROUP BY topic
        ORDER BY solved_count DESC
    ),
    all_topics AS (
        SELECT jsonb_array_elements_text(topics)::text AS topic,
            COUNT(*)::bigint AS total_count
        FROM problems
        GROUP BY topic
    )
SELECT us.topic,
    us.solved_count::bigint,
    at.total_count
FROM user_solved us
    JOIN all_topics at ON us.topic = at.topic
ORDER BY us.solved_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_topics(uuid) TO authenticated;