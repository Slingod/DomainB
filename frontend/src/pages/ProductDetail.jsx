import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { Helmet } from 'react-helmet';
import './ProductDetail.scss';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement…</p>;

  const handleAdd = () => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      quantity: qty
    }));
    navigate('/cart');
  };

  return (
    <main className="product-detail" itemScope itemType="https://schema.org/Product">
      <Helmet>
        <title>{product.title} – Domaine Berthuit</title>
        <meta
          name="description"
          content={`Achetez ${product.title} au prix de ${product.price.toFixed(2)} €. En stock : ${product.stock}`}
        />
        <meta name="keywords" content={`vin, produit, ${product.title}, Domaine Berthuit`} />
        <link rel="canonical" href={`http://localhost:5173/products/${product.id}`} />
      </Helmet>

      {product.image_url && (
        <figure className="image-wrapper">
          <img
            src={product.image_url}
            alt={`Photo de ${product.title}`}
            className="product-detail-image"
            itemProp="image"
          />
        </figure>
      )}

      <section className="details">
        <h1 itemProp="name">{product.title}</h1>

        <div className="price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price">{product.price.toFixed(2)}</span> €
          <meta itemProp="priceCurrency" content="EUR" />
        </div>

        <p className="stock">
          {product.stock > 0
            ? `En stock : ${product.stock}`
            : 'Rupture de stock'}
        </p>

        {product.description && (
          <p className="description" itemProp="description">
            {product.description}
          </p>
        )}

        <form className="actions" onSubmit={(e) => e.preventDefault()} aria-label="Ajout au panier">
          <label htmlFor="qty">Quantité :</label>
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
          {product.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </section>
    </main>
  );
}