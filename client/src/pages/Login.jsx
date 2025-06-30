import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../api/api';
import { setCredentials } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Même regex email que sur l’inscription
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // 1) Validation front
    if (!emailRegex.test(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length === 0) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    // 2) Appel API
    try {
      const { data } = await api.post('/auth/login', { email, password });
      console.log("Données reçues du backend :", data);

      const { token, role, username } = data;
      dispatch(setCredentials({ token, role, username }));
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Connexion</h2>
        {error && <div className="error">{error}</div>}

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
            placeholder="Votre mot de passe"
            required
          />
        </label>

        <button type="submit" className="btn-primary">
          Se connecter
        </button>
        <Link to="/forgot-password" className="link">Mot de passe oublié?</Link>
      </form>
    </div>
  );
}
