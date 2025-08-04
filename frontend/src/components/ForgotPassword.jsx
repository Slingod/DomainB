import React, { useState } from 'react';
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
    } catch (err) {
      const errorMsg = err.response?.data?.error ?? t('resetPassword.errorGeneric');
      setStatus({ message: errorMsg, error: true });
    }
  };

  return (
    <div className="forgot-password-container">
      <Helmet>
        <title>{t('resetPassword.title')} – Domaine Berthuit</title>
        <meta
          name="description"
          content={t('resetPassword.seoDescription')}
        />
      </Helmet>

      <div className="forgot-password-card" role="main">
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
          />
          <button type="submit">{t('resetPassword.submit')}</button>
        </form>

        {status.message && (
          <div
            className={status.error ? 'error' : 'message'}
            role="alert"
            aria-live="assertive"
          >
            {status.message}
          </div>
        )}

        <Link to="/" className="back-link">
          ← {t('resetPassword.back')}
        </Link>
      </div>
    </div>
  );
}