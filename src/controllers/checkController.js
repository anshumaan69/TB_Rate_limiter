/**
 * Controller to handle client request checks
 */
export const check = async (req, res) => {
    const result = req.rateLimitResult;
    if (!result) {
        return res.status(500).json({ error: "Rate limit result not found in request" });
    }

    if (!result.allowed) {
        return res.status(429).json({
            allowed: false,
            remaining: result.remaining
        });
    }

    return res.status(200).json({
        allowed: true,
        remaining: result.remaining
    });
};
