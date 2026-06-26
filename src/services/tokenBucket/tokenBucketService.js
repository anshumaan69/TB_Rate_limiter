import * as bucketStateRepository from "../../repositories/bucketStateRepository.js"
export const checkLimit = async (client_key, rate, burst, tx) => {
    const now = new Date();
    //Row lock ke saath current state lelenge 
    let state = await bucketStateRepository.getForUpdate(client_key, tx);
    let tokens;
    let last_refill;
    if (!state) {
        //This is for 1st request
        tokens = burst
        last_refill = now
    }
    else {
        //This is for any other req 
        const elapsedTime = (now - state.last_refill) / 1000
        const refilledTokens = elapsedTime * rate
        tokens = Math.min(burst, state.tokens + refilledTokens)//got stuck ..there cannot be more tokenst than the burst limit
        last_refill = now;
    }
    const allowed = tokens >= 1
    const remaining = allowed ? tokens - 1 : tokens//if req was allowed then  humne ek token deduct kr diya

    // Save the updated state
    await bucketStateRepository.upsert(client_key, remaining, last_refill, tx)
    // Time until fully refilled  for X-RateLimit-Reset
    //Unix epoch timestamp calculate karta hai 
    const timeToFull = ((burst - remaining) / rate)
    const resetTime = Math.ceil(now.getTime() / 1000 + timeToFull)
    return {
        allowed,
        remaining: Math.floor(remaining),
        limit: burst,
        reset: resetTime
    }
}