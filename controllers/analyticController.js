const pool = require('../config/database'); // Assuming you have a database connection pool

exports.getUserActivity = async (req, res) => {
    try {
        const uniqueVisitorsQuery = 'SELECT COUNT(DISTINCT "ipaddress") AS "uniqueVisitors" FROM lookups';
        const searchesPerDayQuery = `
            SELECT 
                DATE("added_at") AS "date",
                COUNT(*) AS "searchCount"
            FROM words
            GROUP BY DATE("added_at")
            ORDER BY "date" ASC`;

        const popularSearchTermsQuery = `
            SELECT 
                term,
                COUNT(*) AS "count"
            FROM words
            GROUP BY term
            ORDER BY COUNT(term) DESC
            LIMIT 10`;

        const uniqueVisitorsResult = await pool.query(uniqueVisitorsQuery);
        const searchesPerDayResult = await pool.query(searchesPerDayQuery);
        const popularSearchTermsResult = await pool.query(popularSearchTermsQuery);

        res.status(200).json({
            uniqueVisitors: uniqueVisitorsResult.rows[0].uniqueVisitors,
            searchesPerDay: searchesPerDayResult.rows,
            popularSearchTerms: popularSearchTermsResult.rows,
        });
    } catch (error) {
        console.error('Error fetching user activity analytics:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getWordAnalytics = async (req, res) => {
    try {
        const totalWordsQuery = 'SELECT COUNT(*) AS "totalWords" FROM words';
        const activeWordsQuery = 'SELECT COUNT(*) AS "activeWords" FROM words WHERE status = \'Active\'';
        const pendingWordsQuery = 'SELECT COUNT(*) AS "pendingWords" FROM words WHERE status = \'Pending\'';
        const newWordsPerDayQuery = `
            SELECT 
                DATE("added_at") AS "date",
                COUNT(*) AS "wordCount"
            FROM words
            GROUP BY DATE("added_at")
            ORDER BY "date" ASC`;

        const wordUpdatesPerDayQuery = `
            SELECT 
                DATE("updated_at") AS "date",
                COUNT(*) AS "updateCount"
            FROM words
            GROUP BY DATE("updated_at")
            ORDER BY "date" ASC`;

        const frequentlyLookedUpWordsQuery = `
            SELECT 
                term,
                search_count
            FROM words
            ORDER BY search_count DESC
            LIMIT 10`;

        const totalWordsResult = await pool.query(totalWordsQuery);
        const activeWordsResult = await pool.query(activeWordsQuery);
        const pendingWordsResult = await pool.query(pendingWordsQuery);
        const newWordsPerDayResult = await pool.query(newWordsPerDayQuery);
        const wordUpdatesPerDayResult = await pool.query(wordUpdatesPerDayQuery);
        const frequentlyLookedUpWordsResult = await pool.query(frequentlyLookedUpWordsQuery);

        res.status(200).json({
            totalWords: totalWordsResult.rows[0].totalWords,
            activeWords: activeWordsResult.rows[0].activeWords,
            pendingWords: pendingWordsResult.rows[0].pendingWords,
            newWordsPerDay: newWordsPerDayResult.rows,
            wordUpdatesPerDay: wordUpdatesPerDayResult.rows,
            frequentlyLookedUpWords: frequentlyLookedUpWordsResult.rows,
        });
    } catch (error) {
        console.error('Error fetching word analytics:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUserRequestAnalytics = async (req, res) => {
    try {
        const totalRequestsQuery = 'SELECT COUNT(*) AS "totalRequests" FROM user_request';
        const openRequestsQuery = 'SELECT COUNT(*) AS "openRequests" FROM user_request WHERE status = \'Open\'';
        const resolvedRequestsQuery = 'SELECT COUNT(*) AS "resolvedRequests" FROM user_request WHERE status = \'Resolved\'';
        const newRequestsPerDayQuery = `
            SELECT 
                DATE("createdat") AS "date",
                COUNT(*) AS "requestCount"
            FROM user_request
            GROUP BY DATE("createdat")
            ORDER BY "date" ASC`;

        const averageTimeToResolveQuery = `
            SELECT 
                AVG(EXTRACT(EPOCH FROM ("approved_at" - "requested_at"))) AS "averageTime"
            FROM user_request
            WHERE status = 'Resolved'AND approved_at IS NOT NULL AND requested_at IS NOT NULL`;

        // const requestsByTypeQuery = `
        //     SELECT 
        //         "type",
        //         COUNT(*) AS "count"
        //     FROM user_request
        //     GROUP BY "type"`;

        // Execute all queries concurrently
        const [
            totalRequestsResult,
            openRequestsResult,
            resolvedRequestsResult,
            newRequestsPerDayResult,
            averageTimeToResolveResult,
            // requestsByTypeResult
        ] = await Promise.all([
            pool.query(totalRequestsQuery),
            pool.query(openRequestsQuery),
            pool.query(resolvedRequestsQuery),
            pool.query(newRequestsPerDayQuery),
            pool.query(averageTimeToResolveQuery),
            // pool.query(requestsByTypeQuery)
        ]);

        // Prepare response object with aggregated data
        const analyticsData = {
            totalRequests: totalRequestsResult.rows[0].totalRequests,
            openRequests: openRequestsResult.rows[0].openRequests,
            resolvedRequests: resolvedRequestsResult.rows[0].resolvedRequests,
            newRequestsPerDay: newRequestsPerDayResult.rows,
            averageTimeToResolve: averageTimeToResolveResult.rows[0].averageTime,
            // requestsByType: requestsByTypeResult.rows
        };

        res.status(200).json(analyticsData);
    } catch (error) {
        console.error('Error fetching user request analytics:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
