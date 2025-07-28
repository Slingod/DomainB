const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: 'Trop de tentatives, réessayez plus tard.'
});