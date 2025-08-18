import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // ⬅️ useLocation ajouté
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import { setCredentials } from '../store/authSlice';
import './Login.scss';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // ⬅️ ajouté

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errorTranslations = {
    'User not found': t('login.errors.notFound'),
    'Invalid credentials': t('login.errors.default'),
    'Identifiants invalides': t('login.errors.default'),
    'Unauthorized': t('login.errors.default'),
    'Bad CSRF token': t('login.errors.csrf') || 'Sécurité CSRF : rechargez la page et réessayez.'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailRegex.test(email)) return setError(t('login.errors.email'));
    if (!password.length)         return setError(t('login.errors.password'));

    try {
      await api.post('/auth/login', { email, password }); // cookies httpOnly
      const me   = await api.get('/auth/me');
      const user = me.data?.user || {};
      dispatch(setCredentials({
        token: 'cookie',
        role: user.role ?? null,
        username: user.username || user.email || ''
      }));

      // ⬅️ Redirection: revenir à la page d'où on vient si dispo, sinon /
      const from = location.state?.from;
      const redirectTo = from?.pathname
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : '/';

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const s   = err.response?.status;
      const msg = err.response?.data?.error;
      if (s === 403) return setError(errorTranslations['Bad CSRF token']);
      if (s === 401) return setError(errorTranslations['Invalid credentials']);
      setError(errorTranslations[msg] || t('login.errors.default'));
    }
  };

  return (
    <main className="login-page">
      <Helmet>
        <title>{t('login.meta.title')}</title>
        <meta name="description" content={t('login.meta.description')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/login" />
      </Helmet>

      {/* ✅ Fond plein écran local à la page (comme ForgotPassword) */}
      <div className="bg" role="presentation" aria-hidden="true">
        <img src="/home_page.webp" alt="" loading="eager" decoding="async" />
        <div className="overlay" aria-hidden="true" />
      </div>

      {/* ✅ Wrapper qui centre la carte et ajoute les gouttières */}
      <div className="content">
        <section aria-label={t('login.formLabel')} className="login-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{t('login.title')}</h2>

            {error && <div className="error" role="alert">{error}</div>}

            <label htmlFor="email">
              {t('login.email')}
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                autoComplete="email"
              />
            </label>

            <label htmlFor="password">
              {t('login.password')}
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="btn-primary">
              {t('login.submit')}
            </button>

            <Link to="/forgot-password" className="link">
              {t('login.forgotPassword')}
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}