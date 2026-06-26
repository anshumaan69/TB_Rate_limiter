import * as rateLimiterRouter from "../services/rateLimiterRouter.js";

/**
 * Middleware to check rate limits and append headers
 */
export const handleRateLimit = async (req, res, next) => {
    try {
        const { clientKey } = req.body;
        if (!clientKey) {
            return res.status(400).json({ error: "Client key is required" });
        }

        const result = await rateLimiterRouter.checkRequest(clientKey);

        // Set response headers
        res.setHeader("X-RateLimit-Limit", result.limit);
        res.setHeader("X-RateLimit-Remaining", result.remaining);
        res.setHeader("X-RateLimit-Reset", result.reset);

        req.rateLimitResult = result;
        next();
    } catch (error) {
        if (error.message && error.message.includes("Client not configured")) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};
