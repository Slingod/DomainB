import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {JSX.ElementType} props.element — le composant à afficher
 * @param {string[]} props.roles — liste de rôles autorisés, ex ['member','admin']
 */
export default function ProtectedRoute({ element: Element, roles = [] }) {
  const { token, role } = useSelector((state) => state.auth);

  if (!token) {
    // non connecté → redirection vers login
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    // connecté mais rôle non autorisé
    return <Navigate to="/" replace />;
  }

  return <Element />;
}
