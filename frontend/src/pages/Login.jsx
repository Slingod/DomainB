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
    'Unauthorized': t('login.errors.default')
  };

  const handleSubmit = async e => {
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
      const { data } = await api.post('/auth/login', { email, password });
      const { token, role, username } = data;
      dispatch(setCredentials({ token, role, username }));
      navigate('/products');
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      setError(errorTranslations[serverMsg] || t('login.errors.default'));
    }
  };

  return (
    <main className="auth-page">
      <Helmet>
        <title>{t('login.meta.title')}</title>
        <meta
          name="description"
          content={t('login.meta.description')}
        />
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