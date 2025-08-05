import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
import './AdminProducts.scss';

const localImages = [
  { url: '/hiver.webp', alt: 'ciel_Hiver' },
  { url: '/gout.webp', alt: 'le_gout_des_autres' },
  { url: '/dany.webp', alt: 'dany_jo' },
  { url: '/coteau.webp', alt: 'petit_coteau' },
  { url: '/lum.webp', alt: 'lum_del_pais' }
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setFiltered(res.data);
    });
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFiltered(products.filter(p => p.title.toLowerCase().includes(term)));
  }, [searchTerm, products]);

  const saveProduct = async p => {
    const selected = localImages.find(img => img.url === p.image_url);
    const payload = {
      title: p.title,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      image_alt: selected ? selected.alt : '',
      stock: p.stock
    };

    if (p.id) {
      await api.put(`/products/${p.id}`, payload);
    } else {
      await api.post('/products', payload);
    }

    const refreshed = await api.get('/products');
    setProducts(refreshed.data);
    setEditing(null);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      if (error.response?.status === 400) {
        alert(
          error.response.data?.error ||
          "Impossible de supprimer ce produit car il est lié à des commandes existantes."
        );
      } else {
        alert("Une erreur inattendue est survenue lors de la suppression.");
        console.error(error);
      }
    }
  };

  return (
    <main className="admin-products-page">
      <Helmet>
        <title>Admin – Gestion des produits | Domaine Berthuit</title>
        <meta name="description" content="Tableau de bord pour gérer les produits : ajouter, modifier ou supprimer les vins du Domaine Berthuit." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="http://localhost:5173/admin/products" />
      </Helmet>

      <header className="header" role="banner">
        <div className="container">
          <h1>Gestion des produits</h1>
          <button
            className="btn primary new-btn"
            onClick={() =>
              setEditing({
                title: '',
                description: '',
                price: 0,
                image_url: '',
                stock: 0
              })
            }
          >
            + Nouveau produit
          </button>
        </div>
      </header>

      <section className="search-section" aria-label="Recherche">
        <label htmlFor="product-search" className="visually-hidden">
          Rechercher un produit
        </label>
        <input
          id="product-search"
          type="search"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </section>

      <section className="product-management" aria-label="Liste des produits">
        <ul className="product-list">
          {filtered.map(p => (
            <li key={p.id} className="product-item" itemScope itemType="https://schema.org/Product">
              <div className="info">
                {p.image_url && (
                  <div className="product-thumb-wrapper">
                    <img
                      src={p.image_url}
                      alt={p.image_alt || `Produit : ${p.title}`}
                      className="product-thumb"
                      itemProp="image"
                    />
                  </div>
                )}
                <div className="text-info">
                  <strong className="title" itemProp="name">{p.title}</strong>
                  <span className="price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span itemProp="price">{p.price.toFixed(2)}</span> €
                    <meta itemProp="priceCurrency" content="EUR" />
                  </span>
                  <span className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {p.stock > 0 ? `En stock : ${p.stock}` : 'Rupture de stock'}
                  </span>
                </div>
              </div>

              <div className="actions">
                <button
                  onClick={() => setEditing(p)}
                  className="btn warning"
                  aria-label={`Modifier le produit ${p.title}`}
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="btn danger"
                  aria-label={`Supprimer le produit ${p.title}`}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="no-results">Aucun produit ne correspond.</li>
          )}
        </ul>
      </section>

      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <form
            onSubmit={e => {
              e.preventDefault();
              saveProduct(editing);
            }}
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
              Image du produit
              <select
                value={editing.image_url}
                onChange={e => {
                  const selected = localImages.find(img => img.url === e.target.value);
                  setEditing({
                    ...editing,
                    image_url: selected?.url || '',
                    image_alt: selected?.alt || ''
                  });
                }}
              >
                <option value="">-- Choisir une image --</option>
                {localImages.map(img => (
                  <option key={img.url} value={img.url}>
                    {img.alt}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                value={editing.stock}
                onChange={e => setEditing({ ...editing, stock: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </label>

            <div className="modal-actions">
              <button type="submit" className="btn primary">
                Enregistrer
              </button>
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
    </main>
  );
}
