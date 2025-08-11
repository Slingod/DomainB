const jwt = require('jsonwebtoken');

module.exports = function authOptional() {
  return (req, _res, next) => {
    const token = req.cookies?.access_token;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: Number(payload.sub),
        role: payload.role,
        email: payload.email
      };
    } catch {
      // token invalide → on ignore et on continue en anonyme
    }
    next();
  };
};