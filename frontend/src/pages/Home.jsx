import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './Home.scss';

export default function Home() {
  const { token } = useSelector(state => state.auth);
  const { t } = useTranslation();

  const images = [
    '/home_page.webp',
    '/home_page2.webp',
    '/home_page3.webp'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <main className="home-page" role="main">
      <Helmet>
        <title>{`${t('home.welcome')} – Domaine Berthuit`}</title>
        <meta name="description" content={t('home.subtitle')} />
        <meta name="keywords" content="vin, domaine, boutique en ligne, ecommerce, panier, commande, rgpd, sécurisé" />
        <meta name="author" content="Domaine Berthuit" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/" />
      </Helmet>

      <div className="background-image" role="presentation" aria-hidden="true">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Fond ${index + 1} – Domaine Berthuit`}
            className={index === currentIndex ? 'active' : ''}
            loading="lazy"
          />
        ))}
        <div className="overlay" aria-hidden="true" />
      </div>

      <header className="home-hero">
        <h1>{t('home.welcome')}</h1>
        <p>{t('home.subtitle')}</p>
        {!token && (
          <Link to="/signup" className="btn-primary" aria-label={t('auth.signup')}>
            {t('auth.signup', 'Créer un compte')}
          </Link>
        )}
      </header>

      <section className="home-features darken-bg" aria-label={t('home.featuresLabel')}>
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

      <section className="home-poem">
        <h2>{t('home.poemTitle')}</h2>
        <blockquote>
          {t('home.poem.line1')}<br />
          {t('home.poem.line2')}<br /><br />
          {t('home.poem.line3')}<br />
          {t('home.poem.line4')}<br /><br />
          {t('home.poem.line5')}<br />
          {t('home.poem.line6')}<br />
          {t('home.poem.line7')}<br /><br />
          {t('home.poem.line8')}<br />
          {t('home.poem.line9')}<br />
          {t('home.poem.line10')}<br />
          {t('home.poem.line11')}<br />
          {t('home.poem.line12')}<br />
        </blockquote>
      </section>
    </main>
  );
}