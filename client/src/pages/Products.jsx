import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import './Products.scss';

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Chargement initial des produits
  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setFiltered(res.data);
    });
  }, []);

  // Filtrage « live » sur searchTerm
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(products.filter(p =>
      p.title.toLowerCase().includes(term)
    ));
  }, [searchTerm, products]);

  return (
    <div className="products-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="products-list">
        {filtered.map(p => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className={`product-card ${p.stock === 0 ? 'out-of-stock' : ''}`}
          >
            {p.image_url && (
              <img src={p.image_url} alt={p.title} className="product-image" />
            )}
            <div className="product-info">
              <h3 className="title">{p.title}</h3>
              <p className="price">{p.price.toFixed(2)} €</p>
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
      </div>
    </div>
  );
}