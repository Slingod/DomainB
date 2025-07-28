import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './Home.scss';

export default function Home() {
  const { token } = useSelector(state => state.auth);

  return (
    <div className="home-page">
      <header className="home-hero">
        <h1>Bienvenue sur Mon Shop</h1>
        <p>Explorez notre sélection et profitez de vos achats en toute simplicité.</p>
        {!token && (
          <Link to="/signup" className="btn-primary">
            Créer un compte
          </Link>
        )}
      </header>

      <section className="home-features">
        <div className="feature">
          <h2>🛒 Parcourez la boutique</h2>
          <p>Des produits de qualité sélectionnés pour vous.</p>
          <Link to="/products" className="btn-secondary">
            Voir les produits
          </Link>
        </div>
        <div className="feature">
          <h2>🔒 Sécurité & RGPD</h2>
          <p>Vos données sont protégées et exportables à tout moment.</p>
        </div>
        <div className="feature">
          <h2>⚙️ Espace Admin/Modération</h2>
          <p>Gestion des produits et des utilisateurs facile.</p>
        </div>
      </section>
    </div>
  );
}