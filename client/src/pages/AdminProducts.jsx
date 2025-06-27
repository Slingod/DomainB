import { useState, useEffect } from 'react';
import api from '../api/api';
import './AdminProducts.scss';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing]   = useState(null);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const saveProduct = async (p) => {
    if (p.id) {
      await api.put(`/products/${p.id}`, p);
    } else {
      await api.post('/products', p);
    }
    const refreshed = await api.get('/products');
    setProducts(refreshed.data);
    setEditing(null);
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="admin-products-page">
      <header className="header">
        <h1>Gestion des produits</h1>
        <button
          className="btn primary new-btn"
          onClick={() => setEditing({ title: '', description: '', price: 0, image_url: '' })}
        >
          + Nouveau produit
        </button>
      </header>

      <ul className="product-list">
        {products.map(p => (
          <li key={p.id} className="product-item">
            <div className="info">
              <strong className="title">{p.title}</strong>
              <span className="price">{p.price.toFixed(2)} €</span>
            </div>
            <div className="actions">
              <button onClick={() => setEditing(p)} className="btn warning">Modifier</button>
              <button onClick={() => deleteProduct(p.id)} className="btn danger">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="modal-overlay">
          <form
            onSubmit={e => { e.preventDefault(); saveProduct(editing); }}
            className="modal"
          >
            <h2>{editing.id ? 'Modifier' : 'Nouveau'} produit</h2>
            <label>
              Titre
              <input
                type="text"
                value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={editing.description}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                rows="3"
              />
            </label>
            <label>
              Prix (€)
              <input
                type="number"
                step="0.01"
                value={editing.price}
                onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                required
              />
            </label>
            <label>
              URL de l’image
              <input
                type="url"
                value={editing.image_url || ''}
                onChange={e => setEditing({ ...editing, image_url: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="submit" className="btn primary">Enregistrer</button>
              <button type="button" onClick={() => setEditing(null)} className="btn secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}