import rateLimit from "express-rate-limit"; 

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false  // Disable the `X-RateLimit-*` headers
});