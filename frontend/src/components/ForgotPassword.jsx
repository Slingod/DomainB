import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './ForgotPassword.scss';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ message: '', error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', error: false });

    try {
      const res = await api.post('/auth/request-password-reset', { email });
      setStatus({ message: res.data.message, error: false });
    } catch (err) {
      const errorMsg = err.response?.data?.error ?? 'Une erreur est survenue.';
      setStatus({ message: errorMsg, error: true });
    }
  };

  return (
    <div className="forgot-password-container">
      {/* SEO */}
      <Helmet>
        <title>Reinitialisation du mot de passe – Domaine Berthuit</title>
        <meta
          name="description"
          content="Demandez un lien de reinitialisation de mot de passe pour votre compte sur Domaine Berthuit."
        />
      </Helmet>

      <div className="forgot-password-card" role="main">
        <h2>Mot de passe oublie ?</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="fp-email" className="visually-hidden">
            Votre adresse email
          </label>
          <input
            id="fp-email"
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
          />

          <button type="submit">Envoyer le lien de reinitialisation</button>
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
          ← Retour a l'accueil
        </Link>
      </div>
    </div>
  );
}