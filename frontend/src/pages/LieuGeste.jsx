import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './LieuGeste.scss';

export default function LieuGeste() {
  const { t } = useTranslation();

  const sections = t('lieuGeste.sections', { returnObjects: true });

  return (
    <main className="lieu-geste-page">
      <Helmet>
        <title>{t('lieuGeste.meta.title')}</title>
        <meta name="description" content={t('lieuGeste.meta.description')} />
        <link rel="canonical" href={t('lieuGeste.meta.canonical')} />
      </Helmet>

      {/* Bandeau titre */}
      <header className="hero">
        <div className="hero-inner">
          <h1 className="page-title">{t('lieuGeste.title')}</h1>
          <p className="page-lead">{t('lieuGeste.intro.lead')}</p>
        </div>
      </header>

      {/* Corps */}
      <div className="container">
        <section className="intro">
          <p>{t('lieuGeste.intro.text1')}</p>
          <p>{t('lieuGeste.intro.text2')}</p>
        </section>

        <div className="grid">
          {/* Terroir */}
          <section className="card">
            <h2>{sections.terroir.title}</h2>
            <p>{sections.terroir.body1}</p>
            <p>{sections.terroir.body2}</p>
          </section>

          {/* Viticulture */}
          <section className="card">
            <h2>{sections.viticulture.title}</h2>
            <p>{sections.viticulture.body1}</p>
            <p>{sections.viticulture.body2}</p>
          </section>

          {/* Vinification */}
          <section className="card">
            <h2>{sections.vinification.title}</h2>
            <p>{sections.vinification.body1}</p>
            <p>{sections.vinification.body2}</p>
          </section>

          {/* Élevage & Affinage */}
          <section className="card">
            <h2>{sections.aging.title}</h2>
            <p>{sections.aging.body1}</p>
            <p>{sections.aging.body2}</p>
          </section>

          {/* Engagement */}
          <section className="card">
            <h2>{sections.commitment.title}</h2>
            <p>{sections.commitment.body1}</p>
            <p>{sections.commitment.body2}</p>
          </section>
        </div>

        {/* Bloc Map (placeholder) */}
        <section className="map-section" aria-label={t('lieuGeste.map.title')}>
          <h2 className="map-title">{t('lieuGeste.map.title')}</h2>
          <div
            id="domaine-map"
            className="map-block"
            role="region"
            aria-label={t('lieuGeste.map.title')}
          >
            <div className="map-placeholder">
              <span>{t('lieuGeste.map.hint')}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
