// Décoder le token JWT pour obtenir le userId
import jwt_decode from "jwt-decode";

export function getUserId() {
  const token = localStorage.getItem('token'); // adapte le nom du token si différent
  if (!token) return null;

  try {
    const decoded = jwt_decode(token);
    return decoded?.id || null;
  } catch (e) {
    return null;
  }
}