import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
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

    // 1) Validation front
    if (!usernameRegex.test(username)) {
      setError('Le pseudo doit faire 3–20 caractères et contenir uniquement lettres, chiffres ou “_”.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('Le mot de passe doit avoir au moins 6 caractères et ne pas contenir “<” ou “>”.');
      return;
    }

    // 2) Appel API
    try {
      await api.post('/auth/signup', { username, email, password });
      alert('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Créer un compte</h2>
        {error && <div className="error">{error}</div>}

        <label>
          Pseudo
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Ex : MonPseudo_01"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemple@domaine.com"
            required
          />
        </label>

        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Au moins 6 caractères"
            required
          />
        </label>

        <button type="submit" className="btn-primary">
          S’inscrire
        </button>
      </form>
    </div>
  );
}
