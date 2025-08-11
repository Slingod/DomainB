const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TTL  = process.env.JWT_ACCESS_TTL  || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '7d';
const SECURE = process.env.COOKIE_SECURE === 'true'; // override explicite

function signAccess(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefresh(user) {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign({ sub: String(user.id), jti }, process.env.JWT_SECRET, { expiresIn: REFRESH_TTL });
  return { token, jti };
}

function setAuthCookies(res, { accessToken, refreshToken, csrfToken }) {
  res.cookie('access_token', accessToken, {
    httpOnly: true, secure: SECURE, sameSite: 'lax', path: '/', maxAge: 1000 * 60 * 60
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: SECURE, sameSite: 'lax', path: '/auth', maxAge: 1000 * 60 * 60 * 24 * 7
  });
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false, secure: SECURE, sameSite: 'lax', path: '/'
  });
}

function clearAuthCookies(res) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/auth' });
  res.clearCookie('csrf_token', { path: '/' });
}

module.exports = { signAccess, signRefresh, setAuthCookies, clearAuthCookies };