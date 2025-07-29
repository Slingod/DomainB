import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Composant de route protégée.
 *
 * @param {Object} props
 * @param {JSX.Element} props.children - Composant à afficher si autorisé
 * @param {string[]} props.roles - Liste des rôles autorisés (facultatif)
 * @returns {JSX.Element}
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { token, role } = useSelector((state) => state.auth);

  // Non connecté : redirection vers login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais rôle non autorisé : redirection vers l'accueil
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Utilisateur autorisé : on affiche la page protégée
  return children;
}