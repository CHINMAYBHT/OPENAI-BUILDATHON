-- Function to get user's solved topics with total counts
CREATE OR REPLACE FUNCTION get_user_topics(p_user_id uuid) RETURNS TABLE (
        topic text,
        solved_count bigint,
        total_count bigint
    ) AS $$ BEGIN RETURN QUERY WITH user_solved AS (
        SELECT t.topic,
            COUNT(DISTINCT ups.problem_id)::bigint as solved_count
        FROM user_problem_status ups
            JOIN problems p ON p.id = ups.problem_id
            CROSS JOIN jsonb_array_elements_text(p.topics) as t(topic)
        WHERE ups.user_id = p_user_id
            AND ups.status = 'solved'
        GROUP BY t.topic
    ),
    all_topics AS (
        SELECT jsonb_array_elements_text(topics)::text AS topic,
            COUNT(*)::bigint AS total_count
        FROM problems
        GROUP BY topic
    )
SELECT COALESCE(us.topic, at.topic) as topic,
    COALESCE(us.solved_count, 0) as solved_count,
    at.total_count
FROM all_topics at
    LEFT JOIN user_solved us ON us.topic = at.topic
WHERE us.solved_count > 0
    OR us.topic IS NOT NULL
ORDER BY solved_count DESC,
    total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_topics(uuid) TO authenticated;