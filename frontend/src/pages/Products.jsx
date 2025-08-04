import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Products.scss';

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setFiltered(res.data);
    });
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(
      products.filter(p =>
        p.title.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  return (
    <main className="products-page">
      <Helmet>
        <title>{t('products.meta.title')}</title>
        <meta
          name="description"
          content={t('products.meta.description')}
        />
        <link rel="canonical" href={t('products.meta.canonical')} />
      </Helmet>

      <section className="search-bar" aria-label={t('products.search.ariaLabel')}>
        <label htmlFor="search-input" className="sr-only">
          {t('products.search.label')}
        </label>
        <input
          id="search-input"
          type="search"
          placeholder={t('products.search.placeholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label={t('products.search.ariaLabel')}
        />
      </section>

      <section className="products-list" aria-label={t('products.list.ariaLabel')}>
        {filtered.map(p => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className={`product-card ${p.stock === 0 ? 'out-of-stock' : ''}`}
            itemScope
            itemType="https://schema.org/Product"
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={`${t('products.meta.title')} - ${p.title}`}
                className="product-image"
                itemProp="image"
                loading="lazy"
              />
            ) : (
              <div className="product-image placeholder" role="presentation" />
            )}

            <div className="product-info">
              <h3 className="title" itemProp="name">{p.title}</h3>
              <p className="price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <span itemProp="price">{p.price.toFixed(2)}</span> {t('products.list.priceSuffix')}
                <meta itemProp="priceCurrency" content="EUR" />
              </p>
              <p className="stock">
                {p.stock > 0
                  ? t('products.list.stockAvailable', { stock: p.stock })
                  : t('products.list.outOfStock')}
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="no-results">{t('products.list.noResults')}</p>
        )}
      </section>
    </main>
  );
}