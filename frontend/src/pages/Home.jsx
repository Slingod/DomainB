import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Home.scss';

export default function Home() {
  const { token } = useSelector(state => state.auth);
  const { t } = useTranslation();

  return (
    <main className="home-page">
      <Helmet>
        <title>{`${t('home.welcome')} – Domaine Berthuit`}</title>
        <meta
          name="description"
          content={t('home.subtitle')}
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
        <h1>{t('home.welcome')}</h1>
        <p>{t('home.subtitle')}</p>
        {!token && (
          <Link to="/signup" className="btn-primary" aria-label={t('auth.signup')}>
            {t('auth.signup', 'Créer un compte')}
          </Link>
        )}
      </header>

      <section className="home-features" aria-label={t('home.featuresLabel')}>
        <article className="feature">
          <h2>🛒 {t('home.browseShop')}</h2>
          <p>{t('home.qualityProducts')}</p>
          <Link to="/products" className="btn-secondary" aria-label={t('home.viewShop')}>
            <button className="btn primary">{t('home.viewShop')}</button>
          </Link>
        </article>

        <article className="feature">
          <h2>🔒 {t('home.security')}</h2>
          <p>{t('home.dataProtection')}</p>
        </article>
      </section>
    </main>
  );
}