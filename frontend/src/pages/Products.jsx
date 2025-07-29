import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Products.scss';

export default function Products() {
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
        <title>Nos produits – Domaine Berthuit</title>
        <meta
          name="description"
          content="Découvrez nos vins bio rouges, blancs et rosés du Domaine Berthuit. Commandez en ligne directement auprès du producteur."
        />
        <link rel="canonical" href="http://localhost:5173/products" />
      </Helmet>

      <section className="search-bar" aria-label="Recherche de produit">
        <label htmlFor="search-input" className="sr-only">Rechercher un produit</label>
        <input
          id="search-input"
          type="search"
          placeholder="Rechercher un produit…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Zone de recherche de produit"
        />
      </section>

      <section className="products-list" aria-label="Liste des produits">
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
                alt={`Image de ${p.title}`}
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
                <span itemProp="price">{p.price.toFixed(2)}</span> €
                <meta itemProp="priceCurrency" content="EUR" />
              </p>
              <p className="stock">
                {p.stock > 0
                  ? `En stock : ${p.stock}`
                  : 'Rupture de stock'}
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="no-results">Aucun produit trouvé.</p>
        )}
      </section>
    </main>
  );
}