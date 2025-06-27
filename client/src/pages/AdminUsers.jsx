import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './AdminUsers.scss';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '',
    address: '', phone: '', role: 'member'
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    }
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setForm({
      email: u.email || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      address: u.address || '',
      phone: u.phone || '',
      role: u.role || 'member'
    });
  };

  const saveEdit = async () => {
    try {
      // 🔄 Un seul PUT vers `/users/:id`
      await api.put(`/users/${editId}`, {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        address: form.address,
        phone: form.phone,
        role: form.role
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
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="actions">
                  <button className="btn edit" onClick={() => startEdit(u)}>Modifier</button>
                  <button className="btn delete" onClick={() => deleteUser(u.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
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
                  <span>{field}</span>
                  <input
                    type="text"
                    value={form[field] || ''}
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
                <button className="btn save" onClick={saveEdit}>Enregistrer</button>
                <button className="btn cancel" onClick={() => setEditId(null)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}