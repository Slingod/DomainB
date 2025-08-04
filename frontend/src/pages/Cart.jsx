import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Cart.scss';
import '../styles/buttons.scss';

export default function Cart() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(state => state.cart.items);
  const [successMsgVisible, setSuccessMsgVisible] = useState(false);

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
      setSuccessMsgVisible(true);
      setTimeout(() => {
        setSuccessMsgVisible(false);
        navigate('/orders');
      }, 5000);
    } catch (err) {
      alert(err.response?.data?.error || t('cart.alerts.error'));
    }
  };

  return (
    <main className="cart-page" aria-labelledby="page-title">
      <Helmet>
        <title>{t('cart.meta.title')}</title>
        <meta name="description" content={t('cart.meta.description')} />
        <meta name="keywords" content="panier, commande, vin, Domaine Berthuit, boutique en ligne" />
        <meta name="robots" content={t('cart.meta.robots')} />
        <link rel="canonical" href={t('cart.meta.canonical')} />
      </Helmet>

      <h1 id="page-title" className="page-title">{t('cart.title')}</h1>

      {successMsgVisible && (
        <div className="cart-success-message">
          {t('cart.alerts.success')}
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty">{t('cart.empty')}</p>
      ) : (
        <>
          <section className="table-wrapper" aria-label={t('cart.table.ariaLabel')}>
            <table>
              <thead>
                <tr>
                  <th scope="col">{t('cart.table.headers.product')}</th>
                  <th scope="col">{t('cart.table.headers.price')}</th>
                  <th scope="col">{t('cart.table.headers.quantity')}</th>
                  <th scope="col">{t('cart.table.headers.subtotal')}</th>
                  <th scope="col">{t('cart.table.headers.action')}</th>
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
                        className="btn danger"
                        onClick={() => handleRemove(item.id)}
                        aria-label={t('cart.table.removeAria', { title: item.title })}
                      >
                        {t('cart.table.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card-list" aria-label={t('cart.cards.ariaLabel')}>
            {items.map(item => (
              <article key={item.id} className="card">
                <div className="field">
                  <span className="label">{t('cart.cards.product')}</span>
                  <span className="value">{item.title}</span>
                </div>
                <div className="field">
                  <span className="label">{t('cart.cards.price')}</span>
                  <span className="value">{item.price.toFixed(2)} €</span>
                </div>
                <div className="field">
                  <span className="label">{t('cart.cards.quantity')}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.id, e.target.value, item.stock)}
                  />
                </div>
                <div className="field">
                  <span className="label">{t('cart.cards.subtotal')}</span>
                  <span className="value">{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
                <div className="field actions">
                  <button
                    className="btn danger"
                    onClick={() => handleRemove(item.id)}
                    aria-label={t('cart.cards.removeAria', { title: item.title })}
                  >
                    {t('cart.cards.remove')}
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="summary" aria-label={t('cart.summary.ariaLabel')}>
            <span className="total">{t('cart.summary.total', { total })}</span>
            <button
              className="btn primary order-btn"
              onClick={handleOrder}
              disabled={items.length === 0}
            >
              {t('cart.summary.submit')}
            </button>
          </section>
        </>
      )}
    </main>
  );
}