import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import './Signup.scss';

export default function Signup() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^[^<>]{6,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!usernameRegex.test(username)) {
      setError(t('signup.errors.username'));
      return;
    }
    if (!emailRegex.test(email)) {
      setError(t('signup.errors.email'));
      return;
    }
    if (!passwordRegex.test(password)) {
      setError(t('signup.errors.password'));
      return;
    }

    try {
      await api.post('/auth/signup', { username, email, password });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || t('signup.errors.default'));
    }
  };

  return (
    <main className="auth-page" role="main">
      <Helmet>
        <title>{t('signup.meta.title')}</title>
        <meta name="description" content={t('signup.meta.description')} />
        <meta name="keywords" content={t('signup.meta.keywords')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/signup" />
      </Helmet>

      <section className="auth-form" aria-label={t('signup.formLabel')}>
        <h2>{t('signup.heading')}</h2>

        {error && <div className="error-message" role="alert">{error}</div>}
        {success && <div className="success-message" role="status">{t('signup.success')}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">
            {t('signup.username')}
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={t('signup.usernamePlaceholder')}
              required
              autoComplete="username"
            />
          </label>

          <label htmlFor="email">
            {t('signup.email')}
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('signup.emailPlaceholder')}
              required
              autoComplete="email"
            />
          </label>

          <label htmlFor="password">
            {t('signup.password')}
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('signup.passwordPlaceholder')}
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn-primary">
            {t('signup.submit')}
          </button>
        </form>
      </section>
    </main>
  );
}