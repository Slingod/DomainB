import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Home.scss';

export default function Home() {
  const { token } = useSelector(state => state.auth);

  return (
    <main className="home-page">
      <Helmet>
        <title>Domaine Berthuit – Boutique de Vins en Ligne</title>
        <meta
          name="description"
          content="Bienvenue au Domaine Berthuit. Découvrez notre sélection de vins, commandez en ligne, et profitez d’une expérience sécurisée et personnalisée."
        />
        <meta
          name="keywords"
          content="vin, domaine, boutique en ligne, ecommerce, panier, commande, rgpd, sécurisé"
        />
        <meta name="author" content="Domaine Berthuit" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/" />
      </Helmet>

      <header className="home-hero">
        <h1>Bienvenue au Domaine Berthuit</h1>
        <p>
          Explorez notre sélection et profitez de vos achats en toute simplicité.
        </p>
        {!token && (
          <Link to="/signup" className="btn-primary" aria-label="Créer un compte">
            Créer un compte
          </Link>
        )}
      </header>

      <section className="home-features" aria-label="Avantages de notre boutique">
        <article className="feature">
          <h2>🛒 Parcourez la boutique</h2>
          <p>Des produits de qualité sélectionnés pour vous.</p>
          <Link to="/products" className="btn-secondary" aria-label="Voir la boutique">
            <button className="btn primary">Voir la boutique</button>
          </Link>
        </article>

        <article className="feature">
          <h2>🔒 Sécurité & RGPD</h2>
          <p>Vos données sont protégées et exportables à tout moment.</p>
        </article>
      </section>
    </main>
  );
}