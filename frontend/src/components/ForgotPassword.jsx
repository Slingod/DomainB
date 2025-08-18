import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useTranslation } from 'react-i18next';
import './ForgotPassword.scss';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ message: '', error: false });
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', error: false });

    try {
      const res = await api.post('/auth/request-password-reset', { email });
      setStatus({ message: res.data.message, error: false });
      setEmail('');
    } catch (err) {
      const errorMsg = err.response?.data?.error ?? t('resetPassword.errorGeneric');
      setStatus({ message: errorMsg, error: true });
    }
  };

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ message: '', error: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <main className="forgot-password-page">
      <Helmet>
        <title>{t('resetPassword.title')} – Domaine Berthuit</title>
        <meta name="description" content={t('resetPassword.seoDescription')} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* ✅ Fond plein écran local à la page */}
      <div className="bg" role="presentation" aria-hidden="true">
        <img src="/home_page.webp" alt="" loading="eager" decoding="async" />
        <div className="overlay" aria-hidden="true" />
      </div>

      {/* ✅ Wrapper avec padding (le fond n’a PAS de padding) */}
      <div className="content">
        <section className="forgot-password-card" role="main" aria-label={t('resetPassword.title')}>
          <h2>{t('resetPassword.title')}</h2>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="fp-email" className="visually-hidden">
              {t('resetPassword.email')}
            </label>
            <input
              id="fp-email"
              type="email"
              placeholder={t('resetPassword.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              autoComplete="email"
            />
            <button type="submit" className="btn-primary">
              {t('resetPassword.submit')}
            </button>
          </form>

          {status.message && (
            <div className={status.error ? 'error' : 'message'} role="alert" aria-live="assertive">
              {status.message}
            </div>
          )}

          <Link to="/login" className="back-link">
            ← {t('resetPassword.back')}
          </Link>
        </section>
      </div>
    </main>
  );
}
