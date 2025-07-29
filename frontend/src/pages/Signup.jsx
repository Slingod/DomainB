import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Signup.scss';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  // Regex de validation
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^[^\s<>]{6,}$/;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!usernameRegex.test(username)) {
      setError('Le pseudo doit faire 3–20 caractères et contenir uniquement lettres, chiffres ou “_”.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('Le mot de passe doit avoir au moins 6 caractères et ne pas contenir “<” ou “>”.');
      return;
    }

    try {
      await api.post('/auth/signup', { username, email, password });
      alert('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <main className="auth-page" role="main">
      <Helmet>
        <title>Inscription - Domaine Berthuit</title>
        <meta name="description" content="Créez votre compte sur Domaine Berthuit pour commander nos produits en ligne." />
        <meta name="keywords" content="inscription, compte, utilisateur, domaine, boutique en ligne" />
        <link rel="canonical" href="http://localhost:5173/signup" />
      </Helmet>

      <section className="auth-form" aria-label="Formulaire d’inscription">
        <h2>Créer un compte</h2>
        {error && <div className="error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">
            Pseudo
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ex : MonPseudo_01"
              required
              autoComplete="username"
            />
          </label>

          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
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
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Au moins 6 caractères"
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn-primary">
            S’inscrire
          </button>
        </form>
      </section>
    </main>
  );
}