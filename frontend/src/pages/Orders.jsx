import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './Orders.scss';

function computeStats(orders) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const stats = {
    week: { count: 0, total: 0 },
    month: { count: 0, total: 0 },
    year: { count: 0, total: 0 },
    all: { count: orders.length, total: 0 },
  };

  orders.forEach(o => {
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
  const [stats, setStats]   = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders/my')
      .then(res => {
        setOrders(res.data);
        setStats(computeStats(res.data));
      })
      .catch(err => {
        if (err.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
  }, [dispatch, navigate]);

  if (stats === null) {
    return <p className="orders-page">Chargement…</p>;
  }

  return (
    <div className="orders-page">
      <h1>Mes Commandes</h1>

      <div className="stats">
        {[
          { label: 'Cette semaine', key: 'week' },
          { label: 'Ce mois', key: 'month' },
          { label: 'Cette année', key: 'year' },
          { label: 'Depuis toujours', key: 'all' },
        ].map(({ label, key }) => (
          <div key={key} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value">
              {stats[key].count} commande{stats[key].count > 1 ? 's' : ''}
            </div>
            <div className="stat-sub">
              Total: {stats[key].total.toFixed(2)}€
            </div>
          </div>
        ))}
      </div>

      <div className="orders-list">
        {orders.map(o => (
          <div key={o.id} className="order-card">
            <div className="order-header">
              Commande #{o.id} –{' '}
              {new Date(o.created_at).toLocaleString()}
            </div>
            <ul className="items">
              {o.items.map((it, idx) => (
                <li key={idx}>
                  {it.title} × {it.quantity}
                </li>
              ))}
            </ul>
            <div className="order-footer">
              Total: {o.total.toFixed(2)}€
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="no-orders">Vous n’avez pas encore de commandes.</p>
        )}
      </div>
    </div>
  );
}
