import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

/* util: slug pour les ancres */
function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* rend du texte avec liens symboliques [CGU] [CGV] [PRIVACY] [CONTACT] */
function renderWithLinks(text) {
  const parts = String(text).split(/(\[CGU\]|\[CGV\]|\[PRIVACY\]|\[CONTACT\])/g);
  return parts.map((p, i) => {
    switch (p) {
      case '[CGU]':     return <a key={i} href="/cgu">CGU</a>;
      case '[CGV]':     return <a key={i} href="/cgv">CGV</a>;
      case '[PRIVACY]': return <a key={i} href="/privacy-policy">politique de confidentialité</a>;
      case '[CONTACT]': return <a key={i} href="/contact">Contact</a>;
      default:          return <React.Fragment key={i}>{p}</React.Fragment>;
    }
  });
}

export default function FAQ() {
  const { t } = useTranslation();

  const metaTitle = t('faq.meta.title', 'FAQ — Domaine Berthuit');
  const metaDesc  = t('faq.meta.description', 'Questions fréquentes : compte, cookies, produits, commandes, livraison, etc.');
  const canonical = t('faq.meta.canonical', 'https://www.domaine-berthuit.fr/faq');

  // Récupération stricte via i18n (pas de fallback local)
  const sections = useMemo(() => {
    const raw = t('faq.sections', { returnObjects: true });
    if (!Array.isArray(raw)) return [];
    return raw.map((s) => {
      const qa = Array.isArray(s?.qa) ? s.qa : (Array.isArray(s?.items) ? s.items : []);
      return { title: s?.title ?? '', qa };
    });
  }, [t]);

  return (
    <main className="legal-page faq-page">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="legal-title">{t('faq.title', 'FAQ — Domaine Berthuit')}</h1>

      <div className="legal-layout">
        {/* Sommaire */}
        <nav className="toc" aria-label={t('faq.tocTitle', 'FAQ')}>
          <div className="toc-title">{t('faq.tocTitle', 'FAQ')}</div>
          <ol className="toc-list">
            {sections.map((sec) => {
              const id = slugify(sec.title);
              return (
                <li key={id}>
                  {/* On laisse l’<ol> numéroter tout seul pour éviter “1. 1)” */}
                  <a href={`#${id}`}>{sec.title}</a>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Contenu */}
        <article className="legal-content">
          {sections.map((sec, index) => {
            const id = slugify(sec.title);
            return (
              <section key={id} id={id} className="legal-section">
                {/* On garde la numérotation dans le titre de section */}
                <h2>{index + 1}) {sec.title}</h2>

                {Array.isArray(sec.qa) && sec.qa.length > 0 && (
                  <div className="faq-accordion" role="list">
                    {sec.qa.map((pair, i) => {
                      const qId = `${id}-q${i}`;
                      return (
                        <details key={qId} className="faq-item" role="listitem">
                          <summary className="faq-summary">
                            <span className="faq-q">Q. {pair.q}</span>
                          </summary>
                          <div className="faq-a">
                            <p>{renderWithLinks(pair.a)}</p>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </article>
      </div>

      {/* Style rapide pour l’accordéon */}
      <style>{`
        .faq-accordion { display: grid; gap: .5rem; }
        .faq-item {
          border: 1px solid #e6e8eb; border-radius: 10px; background: #fbfcfe;
          transition: box-shadow .2s ease, background .2s ease;
        }
        .faq-item[open] { background: #ffffff; box-shadow: 0 8px 18px rgba(0,0,0,.06); }
        .faq-summary {
          cursor: pointer; list-style: none; padding: .75rem 1rem; font-weight: 600;
        }
        .faq-summary::-webkit-details-marker { display: none; }
        .faq-summary::after {
          content: "▸"; float: right; transform: rotate(0deg); transition: transform .2s ease;
        }
        .faq-item[open] .faq-summary::after { transform: rotate(90deg); }
        .faq-a { padding: 0 .95rem 1rem .95rem; }
        .faq-q { font-weight: 700; }
      `}</style>
    </main>
  );
}
