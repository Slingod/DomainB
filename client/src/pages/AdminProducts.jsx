import { useState, useEffect } from 'react';
import api from '../api/api';
import './AdminProducts.scss';

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [editing, setEditing]     = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Chargement initial des produits
  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setFiltered(res.data);
    });
  }, []);

  // Filtrage live
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFiltered(
      products.filter(p =>
        p.title.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  // Sauvegarde (création ou mise à jour)
  const saveProduct = async p => {
    const payload = {
      title:       p.title,
      description: p.description,
      price:       p.price,
      image_url:   p.image_url,
      stock:       p.stock
    };

    if (p.id) {
      await api.put(`/products/${p.id}`, payload);
    } else {
      await api.post('/products', payload);
    }
    // Rafraîchir la liste
    const refreshed = await api.get('/products');
    setProducts(refreshed.data);
    setEditing(null);
  };

  // Suppression
  const deleteProduct = async id => {
    if (window.confirm('Supprimer ce produit ?')) {
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
          onClick={() => setEditing({
            title: '', description: '', price: 0,
            image_url: '', stock: 0
          })}
        >
          + Nouveau produit
        </button>
      </header>

      {/* Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="product-list">
        {filtered.map(p => (
          <li key={p.id} className="product-item">
            <div className="info">
              <strong className="title">{p.title}</strong>
              <span className="price">{p.price.toFixed(2)} €</span>
              <span
                className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}
              >
                {p.stock > 0 ? `En stock : ${p.stock}` : 'Rupture de stock'}
              </span>
            </div>
            <div className="actions">
              <button onClick={() => setEditing(p)} className="btn warning">
                Modifier
              </button>
              <button onClick={() => deleteProduct(p.id)} className="btn danger">
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="no-results">Aucun produit ne correspond.</li>
        )}
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
                onChange={e =>
                  setEditing({ ...editing, price: parseFloat(e.target.value) })
                }
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

            <label>
              Stock
              <input
                type="number"
                min="0"
                value={editing.stock}
                onChange={e =>
                  setEditing({ ...editing, stock: parseInt(e.target.value, 10) || 0 })
                }
                required
              />
            </label>

            <div className="modal-actions">
              <button type="submit" className="btn primary">Enregistrer</button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}