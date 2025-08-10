import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
import './AdminProducts.scss';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    api.get('/products?include_hidden=true').then(res => {
      const withDefaults = res.data.map(p => ({
        ...p,
        is_visible: p.is_visible ?? true,
        is_summer_product: p.is_summer_product ?? false
      }));
      setProducts(withDefaults);
      setFiltered(withDefaults);
    });
  }, []);

  useEffect(() => {
    setMounted(true);
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
      stock: p.stock,
      is_visible: p.is_visible,
      is_summer_product: p.is_summer_product
    };

    if (p.id) {
      await api.put(`/products/${p.id}`, payload);
    } else {
      await api.post('/products', payload);
    }

    const refreshed = await api.get('/products?include_hidden=true');
    const withDefaults = refreshed.data.map(p => ({
      ...p,
      is_visible: p.is_visible ?? true,
      is_summer_product: p.is_summer_product ?? false
    }));
    setProducts(withDefaults);
    setFiltered(withDefaults);
    setEditing(null);
  };

  const deleteProduct = async id => {
    if (!window.confirm('Supprimer ce produit ?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data?.error || 'Impossible de supprimer ce produit car il est lié à des commandes existantes.');
      } else {
        alert('Une erreur inattendue est survenue lors de la suppression.');
        console.error(error);
      }
    }
  };

    const toggleVisibility = async (product) => {
    const updated = { ...product, is_visible: !product.is_visible };
    const payload = {
      ...updated,
      description: updated.description,
      image_alt: product.image_alt || ''
    };

    await api.put(`/products/${product.id}`, payload);

    // 👇 ICI on récupère TOUS les produits même désactivés (admin)
    const refreshed = await api.get('/products?include_hidden=true');
    const withDefaults = refreshed.data.map(p => ({
      ...p,
      is_visible: p.is_visible ?? true,
      is_summer_product: p.is_summer_product ?? false
    }));
    setProducts(withDefaults);
    setFiltered(withDefaults);
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
                description: { fr: '', en: '', es: '', ru: '', zh: '' },
                price: 0,
                image_url: '',
                stock: 0,
                is_visible: true,
                is_summer_product: false
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
              <li
                key={p.id}
                className={`product-item ${!p.is_visible ? 'disabled-product' : ''}`}
              >
                <div className="info">
                  {p.image_url && (
                    <div className="product-thumb-wrapper">
                      <img
                        src={p.image_url}
                        alt={p.image_alt || `Produit : ${p.title}`}
                        className="product-thumb"
                      />
                    </div>
                  )}
                  <div className="text-info">
                    <strong className="title">
                      {p.title}
                      {!p.is_visible && (
                        <span className="invisible-tag"> (désactivé)</span>
                      )}
                    </strong>
                    <span className="price">{p.price.toFixed(2)} €</span>
                    <span
                      className={`stock-badge ${
                        p.stock > 0 ? 'in-stock' : 'out-of-stock'
                      }`}
                    >
                      {p.stock > 0
                        ? `En stock : ${p.stock}`
                        : 'Rupture de stock'}
                    </span>
                    {p.is_summer_product && (
                      <span className="badge summer">☀️ Estival</span>
                    )}
                  </div>
                </div>
                <div className="actions">
                  <button
                    onClick={() =>
                      setEditing({
                        ...p,
                        is_visible: p.is_visible ?? true,
                        is_summer_product: p.is_summer_product ?? false
                      })
                    }
                    className="btn warning"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="btn danger"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => toggleVisibility(p)}
                    className={`btn ${p.is_visible ? 'secondary' : 'success'}`}
                  >
                    {p.is_visible ? 'Désactiver' : 'Activer'}
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

            <fieldset>
              <legend>Description (par langue)</legend>
              {mounted && ['fr', 'en', 'es', 'ru', 'zh'].map(lang => (
                <div key={lang} className="quill-block">
                  <label>{lang.toUpperCase()}</label>
                  <ReactQuill
                    theme="snow"
                    value={editing.description?.[lang] || ''}
                    onChange={(value) =>
                      setEditing(prev => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          [lang]: value
                        }
                      }))
                    }
                    placeholder={`Description ${lang.toUpperCase()}...`}
                  />
                </div>
              ))}
            </fieldset>

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
                value={editing.image_url || ''}
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

            <label>
              Visible pour les utilisateurs
              <input
                type="checkbox"
                checked={!!editing.is_visible}
                onChange={e => setEditing({ ...editing, is_visible: e.target.checked })}
              />
            </label>

            <label>
              Produit estival ☀️
              <input
                type="checkbox"
                checked={!!editing.is_summer_product}
                onChange={e => setEditing({ ...editing, is_summer_product: e.target.checked })}
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