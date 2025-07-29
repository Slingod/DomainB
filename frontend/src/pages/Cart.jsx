import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Cart.scss';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(state => state.cart.items);

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
    <main className="cart-page" aria-labelledby="page-title">
      <Helmet>
        <title>Votre Panier - Domaine Berthuit</title>
        <meta name="description" content="Consultez et validez votre panier avant de passer commande sur le Domaine Berthuit." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="http://localhost:5173/cart" />
      </Helmet>

      <h1 id="page-title" className="page-title">Votre Panier</h1>

      {items.length === 0 ? (
        <p className="empty">Votre panier est vide.</p>
      ) : (
        <>
          <section className="table-wrapper" aria-label="Liste des produits en panier">
            <table>
              <thead>
                <tr>
                  <th scope="col">Produit</th>
                  <th scope="col">Prix unitaire</th>
                  <th scope="col">Quantité</th>
                  <th scope="col">Sous-total</th>
                  <th scope="col">Action</th>
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
                        onChange={e => handleQuantityChange(item.id, e.target.value, item.stock)}
                      />
                    </td>
                    <td>{(item.price * item.quantity).toFixed(2)} €</td>
                    <td>
                      <button
                        className="btn delete"
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Supprimer ${item.title} du panier`}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card-list" aria-label="Produits (vue mobile)">
            {items.map(item => (
              <article key={item.id} className="card">
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
                    onChange={e => handleQuantityChange(item.id, e.target.value, item.stock)}
                  />
                </div>
                <div className="field">
                  <span className="label">Sous-total</span>
                  <span className="value">{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
                <div className="field actions">
                  <button
                    className="btn delete"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Supprimer ${item.title} du panier`}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="summary" aria-label="Récapitulatif de la commande">
            <span className="total">Total : {total} €</span>
            <button
              className="order-btn"
              onClick={handleOrder}
              disabled={items.length === 0}
            >
              Passer la commande
            </button>
          </section>
        </>
      )}
    </main>
  );
}