import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './LieuGeste.scss';

export default function LieuGeste() {
  const { t } = useTranslation();
  const sections = t('lieuGeste.sections', { returnObjects: true });

  // --- Map: lazy mount + loading state ---
  const [mountMap, setMountMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapSentinelRef = useRef(null);

  useEffect(() => {
    const el = mapSentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMountMap(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Embed Google Maps (adresse sur tes pages légales)
  // Le short-link fourni ouvre bien l’app, et reste dispo via le bouton "Ouvrir dans Google Maps".
  const mapEmbedSrc =
    'https://www.google.com/maps?q=31%20BOULEVARD%20DU%20MINERVOIS%2C%2011700%20PEPIEUX&output=embed';
  const mapsExternalHref = 'https://maps.app.goo.gl/jSP2nd3tsu2kV94z5';

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

        {/* Bloc Map */}
        <section className="map-section" aria-label={t('lieuGeste.map.title')}>
          <h2 className="map-title">{t('lieuGeste.map.title')}</h2>

          <div
            id="domaine-map"
            className={`map-block ${mapLoaded ? 'is-loaded' : ''}`}
            role="region"
            aria-label={t('lieuGeste.map.title')}
            ref={mapSentinelRef}
          >
            {!mountMap && (
              <div className="map-placeholder">
                <span>{t('lieuGeste.map.hint')}</span>
              </div>
            )}

            {mountMap && (
              <>
                {!mapLoaded && (
                  <div className="map-skeleton" aria-hidden="true" />
                )}
                <iframe
                  title={t('lieuGeste.map.title')}
                  src={mapEmbedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  onLoad={() => setMapLoaded(true)}
                  style={{
                    border: 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    inset: 0
                  }}
                />
              </>
            )}
          </div>

          <p className="map-cta">
            <a
              href={mapsExternalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {t('lieuGeste.map.openInMaps')}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
