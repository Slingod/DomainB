import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function IdleTimer({ timeout = 15 * 60 * 1000 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerId = useRef(null);

  useEffect(() => {
    // fonction de deconnexion
    const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
      alert(
        'Vous avez ete deconnecte(e) pour cause d\'inactivite.'
      );
    };

    // fonction redemarrant le timer
    const reset = () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
      timerId.current = setTimeout(handleLogout, timeout);
    };

    // evenements utilisateurs a capter
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'touchstart',
      'scroll'
    ];

    // initialisation
    reset();
    events.forEach((e) => window.addEventListener(e, reset));

    // nettoyage
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [dispatch, navigate, timeout]);

  return null;
}