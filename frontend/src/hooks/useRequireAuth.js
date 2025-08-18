import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * requireAuth(handler, meta?) renvoie une fonction :
 * - si connecté → exécute handler(...args)
 * - sinon       → redirige vers /login en conservant la page courante
 */
export default function useRequireAuth() {
  const isAuthenticated = useSelector(
    (s) => Boolean(s.auth?.isAuthenticated ?? s.auth?.token ?? s.auth?.user)
  );
  const location = useLocation();
  const navigate = useNavigate();

  const requireAuth =
    (handler, meta = {}) =>
    (...args) => {
      if (isAuthenticated) {
        return typeof handler === 'function' ? handler(...args) : undefined;
      }
      navigate('/login', {
        replace: false,
        state: {
          from: location, // pour revenir après login
          ...meta,        // ex: { intent: 'add-to-cart', productId, qty }
        },
      });
      return undefined;
    };

  return { isAuthenticated, requireAuth };
}
