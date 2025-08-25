import { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
import './AdminProducts.scss';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * RGPD — Points couverts par ce fichier Front :
 * 1) Aucun stockage navigateur (pas de localStorage/sessionStorage/IndexedDB).
 * 2) Pas de base64 côté client (envoi binaire via FormData uniquement).
 * 3) Upload direct vers le serveur (POST /uploads/images).
 * 4) EXIF purgé : à faire côté backend dans /uploads/images (Sharp sans withMetadata()).
 */

/* ===========================
   Composant d'upload d'image
   =========================== */
function ImageUploader({ onUploaded, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const MAX_UPLOAD_MB = 5;
  const accept = 'image/jpeg,image/png,image/webp,image/avif';

  const uploadFile = async (file) => {
    if (!file) return;

    // Validation simple côté client (la sécurité reste assurée côté serveur)
    if (!accept.split(',').includes(file.type)) {
      alert('Format non supporté (JPEG/PNG/WebP/AVIF uniquement).');
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      alert(`Fichier trop lourd (max ${MAX_UPLOAD_MB} Mo).`);
      return;
    }

    const form = new FormData();
    form.append('file', file);

    try {
      setProgress(1);
      // La route /uploads/images :
      //  - valide le MIME réellement avec Sharp
      //  - redimensionne/compresse
      //  - SUPPRIME les métadonnées (ne pas utiliser .withMetadata())
      const res = await api.post('/uploads/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      const { url, altSuggested } = res.data || {};
      onUploaded?.({ url, alt: altSuggested || '' });
    } catch (err) {
      console.error(err);
      alert("Échec de l'upload de l'image.");
    } finally {
      setProgress(0);
      setDragOver(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const onSelect = (e) => {
    const file = e.target.files?.[0];
    uploadFile(file);
  };

  const triggerClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerClick();
    }
  };

  return (
    <div className="uploader">
      <div
        className={`dropzone ${dragOver ? 'over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={triggerClick}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Déposer une image ici ou cliquer pour parcourir"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onSelect}
          hidden
          disabled={disabled}
        />
        <p>
          <strong>Glissez-déposez</strong> une image ici<br />
          <span>ou cliquez pour parcourir</span><br />
          <small>JPEG/PNG/WebP/AVIF — max {MAX_UPLOAD_MB} Mo</small>
        </p>
        {progress > 0 && (
          <div className="progress" aria-label="Progression de l'upload">
            <div className="bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ===========================
   Ligne produit mémoïsée
   =========================== */
const ProductRow = memo(function ProductRow({
  p,
  index,
  searchActive,
  askDelete,
  toggleVisibility,
  setEditing
}) {
  return (
    <Draggable
      draggableId={String(p.id)}
      index={index}
      isDragDisabled={!!searchActive}
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
                  loading="lazy"
                  decoding="async"
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
              <span className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
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
  );
}, (prev, next) => {
  // Ne re-render que si l'objet ou l'index changent (et l'état "filtré")
  return prev.p === next.p && prev.index === next.index && prev.searchActive === next.searchActive;
});

/* ===========================
   Page AdminProducts
   =========================== */
export default function AdminProducts() {
  // liste source (tri = sort_order)
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [info, setInfo] = useState('');

  // Confirmation de suppression
  const [confirming, setConfirming] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  // charge tous les produits (dont cachés) ordonnés par sort_order
  const loadAll = useCallback(async () => {
    const res = await api.get('/products?include_hidden=true');
    const withDefaults = res.data.map(p => ({
      ...p,
      is_visible: p.is_visible ?? true,
      is_summer_product: p.is_summer_product ?? false
    }));
    setProducts(withDefaults);
  }, []);

  useEffect(() => {
    loadAll();
    setMounted(true);
  }, [loadAll]);

  // Vue filtrée DÉRIVÉE (pas stockée en état)
  const searchActive = !!searchTerm.trim();
  const visibleList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter(p => (p.title || '').toLowerCase().includes(term));
  }, [products, searchTerm]);

  // Mutations stables
  const saveProduct = useCallback(async (p) => {
    const payload = {
      title: p.title,
      description: p.description, // { fr, en, es }
      price: p.price,
      image_url: p.image_url,
      image_alt: p.image_alt || '',
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
  }, [loadAll]);

  const askDelete = useCallback((product) => {
    setConfirming(product);
    setConfirmText('');
  }, []);

  const reallyDelete = useCallback(async () => {
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
  }, [confirming, confirmText, loadAll]);

  const cancelDelete = useCallback(() => {
    setConfirming(null);
    setConfirmText('');
  }, []);

  const toggleVisibility = useCallback(async (product) => {
    const updated = { ...product, is_visible: !product.is_visible };
    const payload = {
      ...updated,
      description: updated.description,
      image_alt: product.image_alt || ''
    };
    await api.put(`/products/${product.id}`, payload);
    await loadAll();
  }, [loadAll]);

  // ---- Drag & Drop ----
  function arrayMove(arr, from, to) {
    const copy = arr.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  }

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination) return;
    if (searchActive) {
      setInfo('Astuce : vide le champ de recherche pour réordonner toute la liste.');
      setTimeout(() => setInfo(''), 3000);
      return;
    }

    const next = arrayMove(products, result.source.index, result.destination.index);
    setProducts(next); // ✅ un seul setState

    try {
      setReorderSaving(true);
      await api.put('/products/reorder', { ids: next.map(p => p.id) });
    } catch {
      setInfo("Erreur lors de l'enregistrement de l'ordre. Rechargement…");
      await loadAll();
    } finally {
      setReorderSaving(false);
    }
  }, [products, searchActive, loadAll]);

  // handler modal
  const handleModalSubmit = (evt) => {
    evt.preventDefault();
    if (editing) saveProduct(editing);
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
                description: { fr: '', en: '', es: '' },
                price: 0,
                image_url: '',
                image_alt: '',
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
                  <ProductRow
                    key={p.id}
                    p={p}
                    index={index}
                    searchActive={searchActive}
                    askDelete={askDelete}
                    toggleVisibility={toggleVisibility}
                    setEditing={setEditing}
                  />
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
              {mounted && ['fr', 'en', 'es'].map(lang => (
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

            {/* Uploader + aperçu */}
            <div className="image-field">
              <label>Image du produit</label>
              <ImageUploader
                disabled={false}
                onUploaded={({ url, alt }) =>
                  setEditing(prev => ({ ...prev, image_url: url, image_alt: alt }))
                }
              />
              {editing.image_url && (
                <div className="preview">
                  <img src={editing.image_url} alt={editing.image_alt || 'Aperçu du produit'} />
                  <small className="muted">{editing.image_url}</small>
                </div>
              )}
            </div>

            {/* ALT éditable */}
            <label>
              Texte alternatif (ALT)
              <input
                type="text"
                value={editing.image_alt || ''}
                onChange={(e) => setEditing(prev => ({ ...prev, image_alt: e.target.value }))}
                placeholder="Courte description de l’image"
              />
            </label>

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

      {/* Modal confirmation suppression */}
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
