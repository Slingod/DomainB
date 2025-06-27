import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import './ProductDetail.scss';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Chargement…</p>;

  const handleAdd = () => {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        quantity
      })
    );
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
        {product.description && (
          <p className="description">{product.description}</p>
        )}
        <div className="actions">
          <label htmlFor="qty">Quantité :</label>
          <input
            id="qty"
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
          />
        </div>
        <button onClick={handleAdd} className="btn-add">
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
