import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './ProductDetail.scss';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) {
    return (
      <p style={{ textAlign: 'center', padding: '2rem' }}>
        {t('productDetail.loading')}
      </p>
    );
  }

  const handleAdd = () => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      quantity: qty
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
            price: product.price.toFixed(2),
            stock: product.stock
          })}
        />
        <meta
          name="keywords"
          content={t('productDetail.meta.keywords', { title: product.title })}
        />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href={t('productDetail.meta.canonical', { id: product.id })}
        />
      </Helmet>

      {product.image_url && (
        <figure className="image-wrapper">
          <img
            src={product.image_url}
            alt={t('productDetail.imageAlt', { title: product.title })}
            className="product-detail-image"
            itemProp="image"
          />
        </figure>
      )}

      <section className="details">
        <h1 itemProp="name">{product.title}</h1>

        {addedMessage && (
          <div className="add-message success">
            {addedMessage}
          </div>
        )}

        <div className="price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price">{product.price.toFixed(2)}</span> {t('productDetail.priceSuffix')}
          <meta itemProp="priceCurrency" content="EUR" />
        </div>

        <p className="stock">
          {product.stock > 0
            ? t('productDetail.stockAvailable', { stock: product.stock })
            : t('productDetail.outOfStock')}
        </p>

        {product.description && (
          <section className="description" itemProp="description">
            {product.description
              .split(/(?=Terroirs|Assemblage|Méthode|Vinification|Embotteillage|Degré|Origine)/)
              .map((line, i) => (
                <p key={i} className={line.includes(':') ? 'line-block' : 'line-intro'}>
                  {line.trim()}
                </p>
              ))}
          </section>
        )}

        <form className="actions" onSubmit={(e) => e.preventDefault()} aria-label="Ajout au panier">
          <label htmlFor="qty">{t('productDetail.quantityLabel')}</label>
          <input
            id="qty"
            type="number"
            min="1"
            max={product.stock}
            value={qty}
            onChange={e => {
              const v = Number(e.target.value);
              setQty(v < 1 ? 1 : v > product.stock ? product.stock : v);
            }}
          />
        </form>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="btn-add"
        >
          {product.stock === 0
            ? t('productDetail.unavailable')
            : t('productDetail.addToCart')}
        </button>
      </section>
    </main>
  );
}