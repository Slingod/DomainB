import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './IdleNotification.scss';

/**
 * IdleTimer
 * - N'ajoute des écouteurs et des timers que si `enabled === true`.
 * - Au timeout, déclenche le logout Redux + redirige vers /login après un toast.
 */
export default function IdleTimer({ timeout = 15 * 60 * 1000, enabled = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerId = useRef(null);
  const [showNotice, setShowNotice] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!enabled) {
      // Si on désactive l'IdleTimer (pas connecté, page d'auth, etc.), on nettoie tout.
      if (timerId.current) clearTimeout(timerId.current);
      return;
    }

    const handleLogout = () => {
      dispatch(logout());
      setShowNotice(true);
      // Affiche un toast 5s puis redirige
      setTimeout(() => {
        setShowNotice(false);
        navigate('/login', { replace: true, state: { reason: 'idle' } });
      }, 5000);
    };

    const reset = () => {
      if (timerId.current) clearTimeout(timerId.current);
      timerId.current = setTimeout(handleLogout, timeout);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click', 'wheel'];
    // Premier armement
    reset();
    // Écoute l'activité utilisateur
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    // Reset quand l'onglet revient au premier plan
    const onVisibility = () => { if (!document.hidden) reset(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
      events.forEach((e) => window.removeEventListener(e, reset));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, timeout, dispatch, navigate]);

  return (
    <>
      {showNotice && (
        <div className="idle-toast">
          {t('idle.logoutMessage')}
        </div>
      )}
    </>
  );
}