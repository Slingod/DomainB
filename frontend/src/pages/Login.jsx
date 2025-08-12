import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
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

    if (!emailRegex.test(email)) {
      setError(t('login.errors.email'));
      return;
    }
    if (password.length === 0) {
      setError(t('login.errors.password'));
      return;
    }

    try {
      // Login : les cookies httpOnly sont posés par le serveur
      await api.post('/auth/login', { email, password });

      // Vérifie & récupère l'utilisateur courant via le cookie access_token
      const me   = await api.get('/auth/me');
      const user = me.data?.user || {};

      // Conserve un "token" truthy pour ne pas casser ton store (placeholder)
      dispatch(setCredentials({
        token: 'cookie',
        role: user.role ?? null,
        username: user.username || user.email || ''
      }));

      navigate('/');
    } catch (err) {
      const status    = err.response?.status;
      const serverMsg = err.response?.data?.error;

      if (status === 403) {
        setError(errorTranslations['Bad CSRF token']);
        return;
      }
      if (status === 401) {
        setError(errorTranslations['Invalid credentials']);
        return;
      }
      setError(errorTranslations[serverMsg] || t('login.errors.default'));
    }
  };

  return (
    <main className="auth-page">
      <Helmet>
        <title>{t('login.meta.title')}</title>
        <meta name="description" content={t('login.meta.description')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/login" />
      </Helmet>

      <section aria-label={t('login.formLabel')} className="auth-section">
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
    </main>
  );
}