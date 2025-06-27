/**
 * Extrait l'ID du payload d'un JWT stocké en localStorage sous "token"
 * sans dépendances externes.
 */
export function getUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // Un JWT = header.payload.signature
    const [, payload] = token.split('.');
    // à la base64url → base64 classique
    const json = atob(
      payload.replace(/-/g, '+').replace(/_/g, '/')
    );
    const data = JSON.parse(json);
    return data.id || null;
  } catch {
    return null;
  }
}