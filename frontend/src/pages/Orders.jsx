import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Orders.scss';

function computeStats(orders) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const stats = {
    week: { count: 0, total: 0 },
    month: { count: 0, total: 0 },
    year: { count: 0, total: 0 },
    all: { count: orders.length, total: 0 },
  };

  orders.forEach((o) => {
    const date = new Date(o.created_at);
    const amount = o.total;
    stats.all.total += amount;
    if (date >= startOfYear) {
      stats.year.count++;
      stats.year.total += amount;
      if (date >= startOfMonth) {
        stats.month.count++;
        stats.month.total += amount;
        if (date >= startOfWeek) {
          stats.week.count++;
          stats.week.total += amount;
        }
      }
    }
  });

  return stats;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    api
      .get('/orders/my')
      .then((res) => {
        setOrders(res.data);
        setStats(computeStats(res.data));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
  }, [dispatch, navigate]);

  if (stats === null) {
    return <p className="orders-page">{t('orders.loading')}</p>;
  }

  return (
    <main className="orders-page">
      <Helmet>
        <title>{t('orders.meta.title')}</title>
        <meta name="description" content={t('orders.meta.description')} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header>
        <h1>{t('orders.title')}</h1>
      </header>

      <section className="stats" aria-label={t('orders.stats.ariaLabel')}>
        {['week', 'month', 'year', 'all'].map((key) => (
          <article key={key} className="stat-card">
            <h2 className="stat-label">{t(`orders.stats.${key}.label`)}</h2>
            <p className="stat-value">
              {t('orders.stats.orders', { count: stats[key].count })}
            </p>
            <p className="stat-sub">
              {t('orders.stats.total')}: {stats[key].total.toFixed(2)}€
            </p>
          </article>
        ))}
      </section>

      <section className="orders-list" aria-label={t('orders.list.ariaLabel')}>
        {orders.map((o) => (
          <article key={o.id} className="order-card">
            <header className="order-header">
              {t('orders.list.orderId', { id: o.id })} – {new Date(o.created_at).toLocaleString()}
            </header>
            <ul className="items">
              {o.items.map((it, idx) => (
                <li key={idx}>
                  {it.title} × {it.quantity}
                </li>
              ))}
            </ul>
            <footer className="order-footer">
              {t('orders.list.total')}: {o.total.toFixed(2)}€
            </footer>
          </article>
        ))}

        {orders.length === 0 && (
          <p className="no-orders">{t('orders.list.empty')}</p>
        )}
      </section>
    </main>
  );
}