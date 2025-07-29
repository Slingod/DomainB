import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './Profile.scss';

export default function Profile() {
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,30}$/;
  const addressRx = /^.{3,100}$/;
  const phoneRegex = /^\+?[0-9 ]{7,15}$/;

  useEffect(() => {
    document.title = "Profil utilisateur - Domaine Berthuit";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gérez vos informations personnelles sur Domaine Berthuit. Modifiez, exportez ou supprimez votre profil.');
    } else {
      const desc = document.createElement('meta');
      desc.name = 'description';
      desc.content = 'Gérez vos informations personnelles sur Domaine Berthuit. Modifiez, exportez ou supprimez votre profil.';
      document.head.appendChild(desc);
    }

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
    setError('');
    setMessage('');

    if (user.first_name && !nameRegex.test(user.first_name)) {
      setError('Prénom invalide (2–30 lettres).');
      return;
    }
    if (user.last_name && !nameRegex.test(user.last_name)) {
      setError('Nom invalide (2–30 lettres).');
      return;
    }
    if (user.address && !addressRx.test(user.address)) {
      setError('Adresse invalide (3–100 caractères).');
      return;
    }
    if (user.phone && !phoneRegex.test(user.phone)) {
      setError('Téléphone invalide (7–15 chiffres, “+” autorisé).');
      return;
    }

    try {
      await api.put('/users/me', user);
      setMessage('Profil mis à jour avec succès !');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.post('/users/me/export-mail');
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’export');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Cette action est irréversible. Supprimer votre compte ?')) return;
    try {
      await api.delete('/users/me');
      dispatch(logout());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <main className="profile-page" role="main">
      <header>
        <h1>Mon Profil</h1>
      </header>
      {message && <div className="notification success" role="status">{message}</div>}
      {error && <div className="notification error" role="alert">{error}</div>}

      <form onSubmit={handleSave} className="profile-form">
        <label htmlFor="first_name">Prénom
          <input
            id="first_name"
            type="text"
            value={user.first_name || ''}
            onChange={e => setUser({ ...user, first_name: e.target.value })}
            placeholder="Ex : Marie"
          />
        </label>

        <label htmlFor="last_name">Nom
          <input
            id="last_name"
            type="text"
            value={user.last_name || ''}
            onChange={e => setUser({ ...user, last_name: e.target.value })}
            placeholder="Ex : Dupont"
          />
        </label>

        <label htmlFor="address">Adresse
          <input
            id="address"
            type="text"
            value={user.address || ''}
            onChange={e => setUser({ ...user, address: e.target.value })}
            placeholder="Ex : 10 rue de Paris, 75000 Paris"
          />
        </label>

        <label htmlFor="phone">Téléphone
          <input
            id="phone"
            type="tel"
            value={user.phone || ''}
            onChange={e => setUser({ ...user, phone: e.target.value })}
            placeholder="Ex : +33 6 12 34 56 78"
          />
        </label>

        <button type="submit" className="btn save">
          Sauvegarder
        </button>
      </form>

      <section className="actions">
        <button onClick={handleExport} className="btn export">
          Exporter mes données par email
        </button>
        <button onClick={handleDelete} className="btn delete">
          Supprimer mon compte
        </button>
      </section>
    </main>
  );
}