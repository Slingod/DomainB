import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { setCredentials } from '../store/authSlice';
import './Login.scss';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!emailRegex.test(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length === 0) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, role, username } = data;
      dispatch(setCredentials({ token, role, username }));
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    }
  };

  return (
    <main className="auth-page">
      <Helmet>
        <title>Connexion – Domaine Berthuit</title>
        <meta
          name="description"
          content="Connectez-vous à votre compte Domaine Berthuit pour accéder à votre profil, vos commandes et profiter d'une expérience personnalisée."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/login" />
      </Helmet>

      <section aria-label="Formulaire de connexion" className="auth-section">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Connexion</h2>
          {error && <div className="error" role="alert">{error}</div>}

          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemple@domaine.com"
              required
              autoComplete="email"
            />
          </label>

          <label htmlFor="password">
            Mot de passe
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn-primary">
            Se connecter
          </button>
          <Link to="/forgot-password" className="link">
            Mot de passe oublié ?
          </Link>
        </form>
      </section>
    </main>
  );
}