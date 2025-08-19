import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ScrollTopButton from '../components/ScrollTopButton';
import './PrivacyPolicy.scss';

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();

  // Textes i18n
  const sections = t('privacy.sections', { returnObjects: true }) || [];
  const cookies = t('privacy.cookies', { returnObjects: true }) || {};

  // Date formatée selon la langue
  const fmtDate = new Intl.DateTimeFormat(i18n.language || 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(new Date());

  // Retire une numérotation en début de chaîne: "1. ", "2) ", "3 - "...
  // (pas d'échappements inutiles pour '.' et ')' dans la classe)
  const stripLeadingNum = (s) => String(s || '').replace(/^\s*\d+[.)-]\s*/, '');

  // Éléments du sommaire : sections + tableau cookies
  const tocItems = [
    ...sections.map((s, idx) => ({
      id: `section-${idx + 1}`,
      label: stripLeadingNum(s.title),
    })),
    cookies?.title
      ? { id: 'section-cookies', label: stripLeadingNum(cookies.title) }
      : null,
  ].filter(Boolean);

  return (
    <main className="page legal-page privacy-page">
      <Helmet>
        <title>{t('privacy.metaTitle')}</title>
        <meta name="description" content={t('privacy.metaDescription')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaineberthuit.com/privacy-policy" />
      </Helmet>

      <div id="top" />

      <h1 className="legal-title">{t('privacy.title')}</h1>

      <div className="legal-layout">
        {/* Sommaire */}
        <nav className="toc" role="navigation" aria-label={t('privacy.title')}>
          <h2 className="toc-title">{t('privacy.title')}</h2>
          <ol className="toc-list">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Contenu */}
        <article className="legal-content">
          <p>{t('privacy.intro')}</p>

          {sections.map((sec, idx) => (
            <section
              id={`section-${idx + 1}`}
              key={idx}
              aria-labelledby={`heading-${idx + 1}`}
              className="legal-section"
            >
              {/* On garde le titre tel quel (peut contenir "1. ...") */}
              <h2 id={`heading-${idx + 1}`}>{sec.title}</h2>

              {Array.isArray(sec.paragraphs) &&
                sec.paragraphs.map((p, i) => <p key={i}>{p}</p>)}

              {Array.isArray(sec.list) && (
                <ul>
                  {sec.list.map((li, i) => (
                    <li key={i}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Section Cookies */}
          {cookies?.title && (
            <section
              id="section-cookies"
              aria-labelledby="heading-cookies"
              className="legal-section"
            >
              <h2 id="heading-cookies">{cookies.title}</h2>

              <div className="table-wrap" role="region" aria-label={cookies.title}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>{cookies.headers?.name}</th>
                      <th style={th}>{cookies.headers?.purpose}</th>
                      <th style={th}>{cookies.headers?.duration}</th>
                      <th style={th}>{cookies.headers?.type}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cookies.rows || []).map((r, i) => (
                      <tr key={i}>
                        <td style={td}><code>{r.name}</code></td>
                        <td style={td}>{r.purpose}</td>
                        <td style={td}>{r.duration}</td>
                        <td style={td}>{r.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {cookies.note && <p style={{ marginTop: '.6rem' }}>{cookies.note}</p>}
            </section>
          )}

          <p>
            <em>{t('privacy.updated', { date: fmtDate })}</em>
          </p>
        </article>
      </div>

      {/* Bouton retour haut (même composant que CGU/CGV) */}
      <ScrollTopButton />
    </main>
  );
}

const th = { borderBottom: '1px solid ' + '#e6e8eb', textAlign: 'left', padding: '6px' };
const td = { borderBottom: '1px solid ' + '#f1f2f5', padding: '6px', verticalAlign: 'top' };