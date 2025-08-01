import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './IdleNotification.scss';

export default function IdleTimer({ timeout = 15 * 60 * 1000 }) { // 15 minutes default timeout
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerId = useRef(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      dispatch(logout());
      setShowNotice(true);
      setTimeout(() => {
        setShowNotice(false);
        navigate('/login');
      }, 5000); // durée visible du toast 5s
    };

    const reset = () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
      timerId.current = setTimeout(handleLogout, timeout);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    reset();
    events.forEach((e) => window.addEventListener(e, reset));

    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [dispatch, navigate, timeout]);

  return (
    <>
      {showNotice && (
        <div className="idle-toast">
          Vous avez été déconnecté(e) pour cause d'inactivité.
        </div>
      )}
    </>
  );
}