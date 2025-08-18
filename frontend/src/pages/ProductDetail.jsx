import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import './ProductDetail.scss';
import useRequireAuth from '../hooks/useRequireAuth'; // ⬅️ ajout

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { requireAuth } = useRequireAuth(); // ⬅️ ajout

  // Chargement produit
  useEffect(() => {
    let mounted = true;
    setError('');
    api
      .get(`/products/${encodeURIComponent(id)}`)
      .then(res => { if (mounted) setProduct(res.data); })
      .catch(() => { if (mounted) setError(t('productDetail.loadError')); });
    return () => { mounted = false; };
  }, [id, t]);

  // Description robuste (objet OU string JSON OU string brut)
  const safeDescription = useMemo(() => {
    if (!product || product.description == null) return '';

    let html = '';
    const rawDesc = product.description;

    try {
      // Si c'est un string JSON -> on parse
      if (typeof rawDesc === 'string') {
        const parsed = JSON.parse(rawDesc);
        if (parsed && typeof parsed === 'object') {
          html = parsed[i18n.language] || parsed.fr || '';
        } else {
          // string non-JSON de type texte simple
          html = String(rawDesc);
        }
      } else if (typeof rawDesc === 'object') {
        // déjà un objet { fr, en, ... }
        html = rawDesc[i18n.language] || rawDesc.fr || '';
      } else {
        html = String(rawDesc ?? '');
      }
    } catch {
      // string non JSON → on l'utilise tel quel
      html = String(rawDesc ?? '');
    }

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p','br','ul','ol','li','b','i','strong','em','a','img','h2','h3','h4'
      ],
      ALLOWED_ATTR: {
        a: ['href','title','target','rel'],
        img: ['src','alt','title']
      },
      RETURN_TRUSTED_TYPE: false
    });
  }, [product, i18n.language]);

  // Valeurs sûres même si product n’est pas encore chargé
  const price = useMemo(
    () => (product && Number.isFinite(+product.price) ? +product.price : 0),
    [product]
  );
  const stock = useMemo(
    () => (product && Number.isFinite(+product.stock) ? +product.stock : 0),
    [product]
  );

  const canonicalHref = useMemo(() => {
    try {
      return t('productDetail.meta.canonical', { id: product?.id ?? '' });
    } catch {
      return product?.id ? `/products/${product.id}` : '/';
    }
  }, [t, product]);

  if (error) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>{error}</p>;
  }
  if (!product) {
    return (
      <p style={{ textAlign: 'center', padding: '2rem' }}>
        {t('productDetail.loading')}
      </p>
    );
  }

  const handleAdd = () => {
    const quantity = Number.isFinite(qty) ? qty : 1;
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: price,
      image_url: product.image_url,
      quantity
    }));
    setAddedMessage(t('productDetail.addedSuccess'));
    setTimeout(() => setAddedMessage(''), 5000);
  };

  return (
    <main className="product-detail" itemScope itemType="https://schema.org/Product">
      <Helmet>
        <title>{`${product.title} – Domaine Berthuit`}</title>
        <meta
          name="description"
          content={t('productDetail.meta.description', {
            title: product.title,
            price: price.toFixed(2),
            stock: stock
          })}
        />
        <meta
          name="keywords"
          content={t('productDetail.meta.keywords', { title: product.title })}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalHref} />
      </Helmet>

      {product.image_url && (
        <figure className="image-wrapper">
          <img
            src={product.image_url}
            alt={t('productDetail.imageAlt', { title: product.title })}
            className="product-detail-image"
            itemProp="image"
            loading="lazy"
          />
        </figure>
      )}

      <section className="details">
        <h1 itemProp="name">{product.title}</h1>

        {addedMessage && (
          <div className="add-message success" role="status" aria-live="polite">
            {addedMessage}
          </div>
        )}

        <div className="price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price">{price.toFixed(2)}</span> {t('productDetail.priceSuffix')}
          <meta itemProp="priceCurrency" content="EUR" />
        </div>

        <p className="stock">
          {stock > 0
            ? t('productDetail.stockAvailable', { stock })
            : t('productDetail.outOfStock')}
        </p>

        {safeDescription && (
          <section
            className="description"
            itemProp="description"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        )}

        <form className="actions" onSubmit={(e) => e.preventDefault()} aria-label="Ajout au panier">
          <label htmlFor="qty">{t('productDetail.quantityLabel')}</label>
          <input
            id="qty"
            type="number"
            min="1"
            max={stock}
            value={qty}
            onChange={e => {
              const v = Number(e.target.value);
              if (!Number.isFinite(v)) return;
              setQty(v < 1 ? 1 : v > stock ? stock : v);
            }}
          />
        </form>

        <button
          onClick={requireAuth(handleAdd, { intent: 'add-to-cart', productId: product.id, qty })} /* ⬅️ ajout du contrôle */
          disabled={stock === 0}
          className="btn-add"
        >
          {stock === 0
            ? t('productDetail.unavailable')
            : t('productDetail.addToCart')}
        </button>
      </section>
    </main>
  );
}