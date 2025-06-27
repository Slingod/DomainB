import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Cart.scss';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(state => state.cart.items);

  // Calcul du total
  const total = items
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);

  const handleQuantityChange = (id, value, maxStock) => {
    let qty = parseInt(value, 10) || 1;
    qty = Math.max(1, Math.min(qty, maxStock ?? qty));
    dispatch(updateQuantity({ id, quantity: qty }));
  };

  const handleRemove = id => {
    dispatch(removeFromCart(id));
  };

  const handleOrder = async () => {
    const payload = {
      items: items.map(i => ({
        product_id: i.id,
        quantity: i.quantity
      }))
    };

    try {
      await api.post('/orders', payload);
      dispatch(clearCart());
      alert('Commande passée avec succès !');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la commande');
    }
  };

  return (
    <div className="cart-page">
      <h1 className="page-title">Votre Panier</h1>

      {items.length === 0 ? (
        <p className="empty">Votre panier est vide.</p>
      ) : (
        <>
          {/* TABLEAU (Desktop) */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix unitaire</th>
                  <th>Quantité</th>
                  <th>Sous-total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.price.toFixed(2)} €</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e =>
                          handleQuantityChange(item.id, e.target.value, item.stock)
                        }
                      />
                    </td>
                    <td>{(item.price * item.quantity).toFixed(2)} €</td>
                    <td>
                      <button
                        className="btn delete"
                        onClick={() => handleRemove(item.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS (Mobile) */}
          <div className="card-list">
            {items.map(item => (
              <div key={item.id} className="card">
                <div className="field">
                  <span className="label">Produit</span>
                  <span className="value">{item.title}</span>
                </div>
                <div className="field">
                  <span className="label">Prix unitaire</span>
                  <span className="value">{item.price.toFixed(2)} €</span>
                </div>
                <div className="field">
                  <span className="label">Quantité</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e =>
                      handleQuantityChange(item.id, e.target.value, item.stock)
                    }
                  />
                </div>
                <div className="field">
                  <span className="label">Sous-total</span>
                  <span className="value">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
                <div className="field actions">
                  <button
                    className="btn delete"
                    onClick={() => handleRemove(item.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RÉCAPITULATIF */}
          <div className="summary">
            <span className="total">Total : {total} €</span>
            <button
              className="order-btn"
              onClick={handleOrder}
              disabled={items.length === 0}
            >
              Passer la commande
            </button>
          </div>
        </>
      )}
    </div>
  );
}