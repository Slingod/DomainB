import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './Profile.scss';

export default function Profile() {
  const [user, setUser]       = useState({});
  const [message, setMessage] = useState('');
  const dispatch              = useDispatch();
  const navigate              = useNavigate();

  useEffect(() => {
    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
  }, [dispatch, navigate]);

  const handleSave = async e => {
    e.preventDefault();
    try {
      await api.put('/users/me', user);
      setMessage('Profil mis à jour avec succès !');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.post('/users/me/export-mail');
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur lors de l’export');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Cette action est irréversible. Supprimer votre compte ?')) return;
    try {
      await api.delete('/users/me');
      dispatch(logout());
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>
      {message && <div className="notification">{message}</div>}

      <form onSubmit={handleSave} className="profile-form">
        <label>
          Prénom
          <input
            type="text"
            value={user.first_name || ''}
            onChange={e => setUser({ ...user, first_name: e.target.value })}
          />
        </label>
        <label>
          Nom
          <input
            type="text"
            value={user.last_name || ''}
            onChange={e => setUser({ ...user, last_name: e.target.value })}
          />
        </label>
        <label>
          Adresse
          <input
            type="text"
            value={user.address || ''}
            onChange={e => setUser({ ...user, address: e.target.value })}
          />
        </label>
        <label>
          Téléphone
          <input
            type="tel"
            value={user.phone || ''}
            onChange={e => setUser({ ...user, phone: e.target.value })}
          />
        </label>

        <button type="submit" className="btn save">
          Sauvegarder
        </button>
      </form>

      <div className="actions">
        <button onClick={handleExport} className="btn export">
          Exporter mes données par email
        </button>
        <button onClick={handleDelete} className="btn delete">
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}