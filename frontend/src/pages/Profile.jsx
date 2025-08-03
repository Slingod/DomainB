import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Profile.scss';

export default function Profile() {
  const { t } = useTranslation();
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,30}$/;
  const addressRx = /^.{3,100}$/;
  const phoneRegex = /^\+?[0-9 ]{7,15}$/;

  useEffect(() => {
    document.title = t('profile.meta.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('profile.meta.description'));
    } else {
      const desc = document.createElement('meta');
      desc.name = 'description';
      desc.content = t('profile.meta.description');
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
  }, [dispatch, navigate, t]);

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (user.first_name && !nameRegex.test(user.first_name)) {
      setError(t('profile.errors.firstName'));
      return;
    }
    if (user.last_name && !nameRegex.test(user.last_name)) {
      setError(t('profile.errors.lastName'));
      return;
    }
    if (user.address && !addressRx.test(user.address)) {
      setError(t('profile.errors.address'));
      return;
    }
    if (user.phone && !phoneRegex.test(user.phone)) {
      setError(t('profile.errors.phone'));
      return;
    }

    try {
      await api.put('/users/me', user);
      setMessage(t('profile.success'));
    } catch (err) {
      setError(err.response?.data?.error || t('profile.errors.default'));
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.post('/users/me/export-mail');
      setMessage(data.message || t('profile.export.success'));
    } catch (err) {
      setError(err.response?.data?.error || t('profile.errors.export'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('profile.confirmDelete'))) return;
    try {
      await api.delete('/users/me');
      dispatch(logout());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('profile.errors.delete'));
    }
  };

  return (
    <main className="profile-page" role="main">
      <header>
        <h1>{t('profile.title')}</h1>
      </header>
      {message && <div className="notification success" role="status">{message}</div>}
      {error && <div className="notification error" role="alert">{error}</div>}

      <form onSubmit={handleSave} className="profile-form">
        <label htmlFor="first_name">{t('profile.firstName')}
          <input
            id="first_name"
            type="text"
            value={user.first_name || ''}
            onChange={e => setUser({ ...user, first_name: e.target.value })}
            placeholder={t('profile.placeholders.firstName')}
          />
        </label>

        <label htmlFor="last_name">{t('profile.lastName')}
          <input
            id="last_name"
            type="text"
            value={user.last_name || ''}
            onChange={e => setUser({ ...user, last_name: e.target.value })}
            placeholder={t('profile.placeholders.lastName')}
          />
        </label>

        <label htmlFor="address">{t('profile.address')}
          <input
            id="address"
            type="text"
            value={user.address || ''}
            onChange={e => setUser({ ...user, address: e.target.value })}
            placeholder={t('profile.placeholders.address')}
          />
        </label>

        <label htmlFor="phone">{t('profile.phone')}
          <input
            id="phone"
            type="tel"
            value={user.phone || ''}
            onChange={e => setUser({ ...user, phone: e.target.value })}
            placeholder={t('profile.placeholders.phone')}
          />
        </label>

        <button type="submit" className="btn save">
          {t('profile.save')}
        </button>
      </form>

      <section className="actions">
        <button onClick={handleExport} className="btn export">
          {t('profile.export')}
        </button>
        <button onClick={handleDelete} className="btn delete">
          {t('profile.delete')}
        </button>
      </section>
    </main>
  );
}