import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }  from 'react-router-dom';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { addToCart }   from '../store/cartSlice';
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

  if (!product) return <p>Chargement…</p>;

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
    <div className="product-detail">
      {product.image_url && (
        <div className="image-wrapper">
          <img src={product.image_url} alt={product.title} />
        </div>
      )}
      <div className="details">
        <h1>{product.title}</h1>
        <div className="price">{product.price.toFixed(2)} €</div>
        <p className="stock">
          {product.stock > 0 ? `En stock : ${product.stock}` : 'Rupture de stock'}
        </p>
        {product.description && (
          <p className="description">{product.description}</p>
        )}
        <div className="actions">
          <label htmlFor="qty">Quantité :</label>
          <input
            id="qty"
            type="number"
            min="1"
            max={product.stock}  // ← on limite au stock dispo
            value={qty}
            onChange={e => {
              const v = Number(e.target.value);
              // Conserver 1 <= qty <= stock
              setQty(v < 1 ? 1 : v > product.stock ? product.stock : v);
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="btn-add"
        >
          {product.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}