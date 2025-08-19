import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
import './AdminProducts.scss';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const localImages = [
  { url: '/hiver.webp',  alt: 'ciel_Hiver' },
  { url: '/gout.webp',   alt: 'le_gout_des_autres' },
  { url: '/dany.webp',   alt: 'dany_jo' },
  { url: '/coteau.webp', alt: 'petit_coteau' },
  { url: '/lum.webp',    alt: 'lum_del_pais' }
];

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);   // liste source (tri = sort_order)
  const [filtered, setFiltered]     = useState([]);   // vue filtrée
  const [editing, setEditing]       = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted]       = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [info, setInfo] = useState('');

  // --- Nouveau : confirmation de suppression ---
  const [confirming, setConfirming] = useState(null);   // produit ciblé (ou null)
  const [confirmText, setConfirmText] = useState('');   // texte saisi dans la modal

  // charge tous les produits (dont cachés) ordonnés par sort_order
  const loadAll = async () => {
    const res = await api.get('/products?include_hidden=true');
    const withDefaults = res.data.map(p => ({
      ...p,
      is_visible: p.is_visible ?? true,
      is_summer_product: p.is_summer_product ?? false
    }));
    setProducts(withDefaults);
    setFiltered(withDefaults);
  };

  useEffect(() => {
    loadAll();
    setMounted(true);
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFiltered(products);
      return;
    }
    setFiltered(
      products.filter(p => (p.title || '').toLowerCase().includes(term))
    );
  }, [searchTerm, products]);

  const visibleList = useMemo(
    () => (searchTerm.trim() ? filtered : products),
    [searchTerm, filtered, products]
  );

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
    await loadAll();
    setEditing(null);
  };

  // Ancienne suppression => remplacée par une demande de confirmation
  const askDelete = (product) => {
    setConfirming(product);
    setConfirmText('');
  };

  const reallyDelete = async () => {
    if (!confirming) return;
    if (confirmText !== confirming.title) return;
    try {
      await api.delete(`/products/${confirming.id}`);
      await loadAll();
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data?.error || 'Impossible de supprimer ce produit car il est lié à des commandes existantes.');
      } else {
        alert('Une erreur inattendue est survenue lors de la suppression.');
        console.error(error);
      }
    } finally {
      setConfirming(null);
      setConfirmText('');
    }
  };

  const cancelDelete = () => {
    setConfirming(null);
    setConfirmText('');
  };

  const toggleVisibility = async (product) => {
    const updated = { ...product, is_visible: !product.is_visible };
    const payload = {
      ...updated,
      description: updated.description,
      image_alt: product.image_alt || ''
    };
    await api.put(`/products/${product.id}`, payload);
    await loadAll(); // recharge pour conserver l’ordre
  };

  // ---- Drag & Drop ----
  function arrayMove(arr, from, to) {
    const copy = arr.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    if (searchTerm.trim()) {
      setInfo('Astuce : vide le champ de recherche pour réordonner toute la liste.');
      setTimeout(() => setInfo(''), 3000);
      return;
    }

    const next = arrayMove(products, result.source.index, result.destination.index);
    setProducts(next);
    setFiltered(next); // puisque pas de filtre actif

    // Sauvegarde côté API
    try {
      setReorderSaving(true);
      await api.put('/products/reorder', { ids: next.map(p => p.id) });
    } catch {
      // rollback si erreur
      setInfo("Erreur lors de l'enregistrement de l'ordre. Rechargement…");
      await loadAll();
    } finally {
      setReorderSaving(false);
    }
  };

  // handler séparé pour éviter le warning no-unused-vars
  const handleModalSubmit = (evt) => {
    evt.preventDefault();
    saveProduct(editing);
  };

  return (
    <main className="admin-products-page">
      <Helmet>
        <title>Admin – Gestion des produits | Domaine Berthuit</title>
        <meta name="description" content="Tableau de bord pour gérer les produits : ajouter, modifier, réordonner ou supprimer." />
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
          onChange={(evt) => setSearchTerm(evt.target.value)}
        />
        {info && <div className="hint" role="status">{info}</div>}
        {reorderSaving && <div className="hint">Sauvegarde de l’ordre…</div>}
      </section>

      <section className="product-management" aria-label="Liste des produits">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="products-list">
            {(provided) => (
              <ul
                className="product-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {visibleList.map((p, index) => (
                  <Draggable
                    key={p.id}
                    draggableId={String(p.id)}
                    index={index}
                    isDragDisabled={!!searchTerm.trim()} // on bloque si filtré
                  >
                    {(prov, snapshot) => (
                      <li
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`product-item ${!p.is_visible ? 'disabled-product' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div className="drag-handle" title="Glisser pour réordonner" {...prov.dragHandleProps}>⋮⋮</div>

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
                            <span className="price">{Number(p.price).toFixed(2)} €</span>
                            <span
                              className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}
                            >
                              {p.stock > 0 ? `En stock : ${p.stock}` : 'Rupture de stock'}
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
                            onClick={() => askDelete(p)}
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {visibleList.length === 0 && (
                  <li className="no-results">Aucun produit ne correspond.</li>
                )}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </section>

      {/* Modal édition produit */}
      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <form onSubmit={handleModalSubmit} className="modal">
            <h2>{editing.id ? 'Modifier' : 'Nouveau'} produit</h2>

            <label>
              Titre
              <input
                type="text"
                value={editing.title}
                onChange={(evt) => setEditing({ ...editing, title: evt.target.value })}
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
                onChange={(evt) => setEditing({ ...editing, price: parseFloat(evt.target.value) || 0 })}
                required
              />
            </label>

            <label>
              Image du produit
              <select
                value={editing.image_url || ''}
                onChange={(evt) => {
                  const selected = localImages.find(img => img.url === evt.target.value);
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
                onChange={(evt) => setEditing({ ...editing, stock: parseInt(evt.target.value, 10) || 0 })}
                required
              />
            </label>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={!!editing.is_visible}
                onChange={(evt) => setEditing({ ...editing, is_visible: evt.target.checked })}
              />
              <span>Visible pour les utilisateurs</span>
            </label>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={!!editing.is_summer_product}
                onChange={(evt) => setEditing({ ...editing, is_summer_product: evt.target.checked })}
              />
              <span>Produit estival ☀️</span>
            </label>

            <div className="modal-actions">
              <button type="submit" className="btn primary">Enregistrer</button>
              <button type="button" onClick={() => setEditing(null)} className="btn secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal confirmation suppression (nouveau) */}
      {confirming && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal">
            <h2 id="confirm-title">Supprimer le produit</h2>
            <p>
              Cette action est <strong>irréversible</strong>. Pour confirmer la suppression du produit&nbsp;:
              <br />
              <strong>«&nbsp;{confirming.title}&nbsp;»</strong>,
              veuillez saisir exactement son nom ci-dessous.
            </p>

            <label htmlFor="confirm-input">
              Nom du produit (saisir exactement)
            </label>
            <input
              id="confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirming.title}
              autoFocus
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn danger"
                onClick={reallyDelete}
                disabled={confirmText !== confirming.title}
                title={confirmText !== confirming.title ? 'Le nom ne correspond pas exactement' : 'Supprimer définitivement'}
              >
                Supprimer définitivement
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={cancelDelete}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}