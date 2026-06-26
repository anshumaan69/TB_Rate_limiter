import * as requestLogRepository from "../../repositories/requestLogRepository.js"

export const checkLimit = async (client_key, rate, burst, tx) => {
    const now = new Date() // Fix: new Date() object taaki .getTime() kaam kare
    const windowStart = new Date(now.getTime() - burst * 1000)

    // counting no of active requests in current window
    const requestCount = await requestLogRepository.countInWindow(client_key, windowStart, tx)
    const allowed = requestCount < rate
    const remaining = allowed ? rate - requestCount - 1 : 0

    if (allowed) {
        // Request log add karein aur purane logs prune karein
        await requestLogRepository.add(client_key, tx);
        await requestLogRepository.clearOldLogs(client_key, windowStart, tx);
    }

    // Next slot kab open hoga (Reset time)
    let resetTime = Math.ceil(now.getTime() / 1000);
    const oldestRequest = await tx.request_logs.findFirst({
        where: { client_key: client_key, request_time: { gte: windowStart } },
        orderBy: { request_time: 'asc' }
    });

    if (oldestRequest) {
        resetTime = Math.ceil(new Date(oldestRequest.request_time).getTime() / 1000 + burst);
    }
    return {
        allowed,
        remaining,
        limit: rate,
        reset: resetTime
    };
};
