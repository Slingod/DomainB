import { useState, useEffect } from 'react';
import api from '../api/api';
import './Moderation.scss';

export default function Moderation() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ email: '', address: '', phone: '' });

  useEffect(() => {
    api.get('/moderation/users')
      .then(res => setUsers(res.data))
      .catch(console.error);
  }, []);

  const startEdit = user => {
    setEditId(user.id);
    setForm({
      email: user.email || '',
      address: user.address || '',
      phone: user.phone || ''
    });
  };

  const save = async () => {
    try {
      await api.put(`/moderation/users/${editId}`, form);
      setEditId(null);
      const { data } = await api.get('/moderation/users');
      setUsers(data);
      alert('Modifications enregistrées !');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  return (
    <div className="moderation-page">
      <h1 className="page-title">Modération des utilisateurs</h1>

      <ul className="user-list">
        {users.map(u => (
          <li key={u.id} className="user-item">
            <div className="user-info">
              <strong>#{u.id}</strong> {u.username} — {u.email} — rôle : {u.role}
            </div>
            {u.role.toLowerCase() === 'member' && (
              <button onClick={() => startEdit(u)} className="btn edit">
                Modifier
              </button>
            )}
          </li>
        ))}
      </ul>

      {editId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Éditer utilisateur #{editId}</h2>
            <input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Adresse"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
            <input
              placeholder="Téléphone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={save} className="btn save">Enregistrer</button>
              <button onClick={() => setEditId(null)} className="btn cancel">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}