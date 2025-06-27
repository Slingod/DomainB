import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import './Orders.scss';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
  }, [dispatch, navigate]);

  return (
    <div className="orders-page">
      <h1>Mes Commandes</h1>
      {orders.map(o => (
        <div key={o.id} className="order-card">
          <div className="order-header">
            Commande #{o.id} – {new Date(o.created_at).toLocaleString()}
          </div>
          <ul className="items">
            {o.items.map((it, idx) => (
              <li key={idx}>
                {it.title} × {it.quantity}
              </li>
            ))}
          </ul>
          <div className="order-footer">
            Total : {o.total.toFixed(2)} €
          </div>
        </div>
      ))}
    </div>
  );
}
