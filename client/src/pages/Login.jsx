import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../api/api';
import { setCredentials } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './Login.scss';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // 1) Login pour obtenir token+role
      const { data: loginData } = await api.post('/auth/login', { email, password });
      const { token, role } = loginData;
      // 2) Appel /users/me pour récupérer le username
      const { data: profile } = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const username = profile.username;
      // 3) Stocker le trio dans Redux + localStorage
      dispatch(setCredentials({ token, role, username }));
      // 4) Redirection
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
            required
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn-primary">
          Se connecter
        </button>
      </form>
    </div>
  );
}
