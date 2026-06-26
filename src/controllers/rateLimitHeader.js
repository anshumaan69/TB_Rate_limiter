export const setRateLimitHeaders = (req, res, next) => {
  // Jab response jane wala ho (on headers write), hum check karte hain 
  // aur res.locals.rateLimit se values read karke headers set kar dete hain.
  res.on("finish", () => {
    // optional: response finished log clean up
  });
  // Headers set karein agar rateLimit details locals par present hon
  if (res.locals.rateLimit) {
    const { limit, remaining, reset } = res.locals.rateLimit;
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);
  }

  next();
};