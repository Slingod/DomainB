module.exports = function csrf() {
  return (req, res, next) => {
    const method = (req.method || 'GET').toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }
    const header = req.get('X-CSRF-Token');
    const cookie = req.cookies?.csrf_token;
    if (!cookie || !header || cookie !== header) {
      return res.status(403).json({ error: 'Bad CSRF token' });
    }
    next();
  };
};