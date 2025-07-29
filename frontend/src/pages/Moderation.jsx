import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
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
    <main className="moderation-page">
      <Helmet>
        <title>Modération des utilisateurs – Domaine Berthuit</title>
        <meta
          name="description"
          content="Modération des utilisateurs du site Domaine Berthuit. Modification d'informations personnelles des membres par les administrateurs."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/moderation" />
      </Helmet>

      <header>
        <h1 className="page-title">Modération des utilisateurs</h1>
      </header>

      <section className="user-section" aria-label="Liste des utilisateurs">
        <ul className="user-list">
          {users.map(u => (
            <li key={u.id} className="user-item">
              <div className="user-info">
                <strong>#{u.id}</strong> {u.username} — {u.email} — rôle : {u.role}
              </div>
              {u.role.toLowerCase() === 'member' && (
                <button
                  onClick={() => startEdit(u)}
                  className="btn edit"
                  aria-label={`Modifier l'utilisateur ${u.username}`}
                >
                  Modifier
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {editId && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Éditer utilisateur #{editId}</h2>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                required
              />
            </label>

            <label>
              Adresse
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Adresse"
              />
            </label>

            <label>
              Téléphone
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="Téléphone"
              />
            </label>

            <div className="modal-actions">
              <button onClick={save} className="btn save">Enregistrer</button>
              <button onClick={() => setEditId(null)} className="btn cancel">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}