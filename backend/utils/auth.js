// Utilitaires d'auth côté serveur (cookies httpOnly + JWT)

const jwt = require('jsonwebtoken');
const db  = require('../db');

/**
 * Vérifie un JWT en essayant d'abord JWT_SECRET,
 * puis JWT_SECRET_PREVIOUS (utile pendant une rotation).
 */
function verifyWithAnySecret(token) {
  const secrets = [process.env.JWT_SECRET, process.env.JWT_SECRET_PREVIOUS].filter(Boolean);
  let lastErr;
  for (const s of secrets) {
    try {
      return jwt.verify(token, s);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Invalid token');
}

/** Récupère le token d’accès depuis les cookies (httpOnly). */
function getAccessTokenFromReq(req) {
  return req?.cookies?.access_token || '';
}

/** Décode + vérifie le token d’accès (retourne le payload ou null). */
function decodeAccess(req) {
  const token = getAccessTokenFromReq(req);
  if (!token) return null;
  try {
    return verifyWithAnySecret(token);
  } catch {
    return null;
  }
}

/** Retourne l’ID utilisateur (number) depuis la requête, sinon null. */
function getUserIdFromReq(req) {
  const payload = decodeAccess(req);
  if (!payload) return null;
  // on accepte sub (standard) ou id (legacy)
  const id = payload.sub ?? payload.id;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

/**
 * Charge l’utilisateur complet depuis la BDD (id, email, role, username…),
 * ou null si non connecté / inexistant.
 */
function getUserFromReq(req) {
  const userId = getUserIdFromReq(req);
  if (!userId) return null;
  const u = db.prepare(
    'SELECT id, email, role, username, first_name, last_name FROM users WHERE id = ?'
  ).get(userId);
  return u || null;
}

/** Vrai si la requête contient un access_token valide. */
function isAuthenticated(req) {
  return !!getUserIdFromReq(req);
}

/**
 * Vrai si l’utilisateur a un des rôles requis.
 * @param {import('express').Request} req
 * @param {string[]|string} roles - ex: 'admin' ou ['moderator','admin']
 */
function hasRole(req, roles) {
  const u = getUserFromReq(req);
  if (!u) return false;
  const need = Array.isArray(roles) ? roles : [roles];
  return need.includes(u.role);
}

module.exports = {
  verifyWithAnySecret,
  getAccessTokenFromReq,
  decodeAccess,
  getUserIdFromReq,
  getUserFromReq,
  isAuthenticated,
  hasRole,
};