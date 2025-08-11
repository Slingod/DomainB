const jwt = require('jsonwebtoken');

function verifyWithAnySecret(token) {
  const secrets = [process.env.JWT_SECRET, process.env.JWT_SECRET_PREVIOUS].filter(Boolean);
  let lastErr;
  for (const s of secrets) {
    try { return jwt.verify(token, s); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Invalid token');
}

module.exports = function requireAuth(requiredRole = null) {
  return (req, res, next) => {
    try {
      let token = req.cookies['access_token'];
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.slice(7);
      }
      if (!token) return res.status(401).json({ error: 'missing_token' });

      let payload;
      try {
        payload = verifyWithAnySecret(token);
      } catch (e) {
        if (e && e.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'token_expired' });
        }
        return res.status(401).json({ error: 'invalid_token' });
      }

      req.user = { id: Number(payload.sub), role: payload.role };
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ error: 'forbidden' });
      }
      next();
    } catch {
      return res.status(401).json({ error: 'invalid_token' });
    }
  };
};
