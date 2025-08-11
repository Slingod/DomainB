import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
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
    const amount = Number(o.total || 0);
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
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      setError('');
      try {
        const { data } = await api.get('/orders/my');
        if (!mounted) return;
        setOrders(data);
        setStats(computeStats(data));
      } catch (err) {
        const status = err.response?.status;
        const code   = err.response?.data?.error;

        if (status === 401 && code === 'missing_token') {
          setError(t('orders.errors.loginRequired') || 'Veuillez vous connecter pour voir vos commandes.');
        } else if (status === 403) {
          setError(t('orders.errors.forbidden') || 'Accès refusé.');
        } else {
          setError(t('orders.errors.loadFailed') || 'Impossible de charger vos commandes.');
        }
        setOrders([]);
        setStats({ week:{count:0,total:0}, month:{count:0,total:0}, year:{count:0,total:0}, all:{count:0,total:0} });
      }
    })();

    return () => { mounted = false; };
  }, [t]);

  if (!stats) {
    return <p className="orders-page">{t('orders.loading')}</p>;
  }

  return (
    <main className="orders-page">
      <Helmet>
        <title>{t('orders.meta.title')}</title>
        <meta name="description" content={t('orders.meta.description')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/mes-commandes" />
      </Helmet>

      <header className="title-wrapper">
        <h1>{t('orders.title')}</h1>
      </header>

      {error && <div className="error" role="alert" style={{ marginBottom: 12 }}>{error}</div>}

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
                  {it.title} × {it.quantity} — {(it.quantity * it.unit_price).toFixed(2)}€
                </li>
              ))}
            </ul>
            <footer className="order-footer">
              {t('orders.list.total')}: {Number(o.total || 0).toFixed(2)}€
            </footer>
          </article>
        ))}

        {orders.length === 0 && !error && (
          <p className="no-orders">{t('orders.list.empty')}</p>
        )}
      </section>
    </main>
  );
}
