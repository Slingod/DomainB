import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './AdminUsers.scss';

export default function AdminUsers() {
  const [users, setUsers]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState({
    email: '', first_name: '', last_name: '',
    address: '', phone: '', role: 'member'
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // fetchUsers stabilisé par useCallback
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    }
  }, [dispatch, navigate]);

  // appel au montage
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Recherche live
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFiltered(
      users.filter(u =>
        u.id.toString().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const startEdit = (u) => {
    setEditId(u.id);
    setForm({
      email:      u.email      || '',
      first_name: u.first_name || '',
      last_name:  u.last_name  || '',
      address:    u.address    || '',
      phone:      u.phone      || '',
      role:       u.role       || 'member'
    });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/users/${editId}`, {
        email:      form.email,
        first_name: form.first_name,
        last_name:  form.last_name,
        address:    form.address,
        phone:      form.phone,
        role:       form.role
      });
      setEditId(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la modification.');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      await api.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <div className="admin-users-page">
      <h1 className="page-title">Administration des utilisateurs</h1>

      {/* Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par ID, pseudo, email ou rôle…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pseudo</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="actions">
                  <button className="btn edit"   onClick={() => startEdit(u)}>Modifier</button>
                  <button className="btn delete" onClick={() => deleteUser(u.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="no-results">
                  Aucun utilisateur ne correspond.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Éditer utilisateur #{editId}</h2>
            <div className="modal-form">
              {['email', 'first_name', 'last_name', 'address', 'phone'].map(field => (
                <label key={field} className="field-group">
                  <span>{field.replace('_', ' ')}</span>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                  />
                </label>
              ))}

              <label className="field-group">
                <span>Rôle</span>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="modal-actions">
                <button className="btn save"   onClick={saveEdit}>Enregistrer</button>
                <button className="btn cancel" onClick={() => setEditId(null)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}