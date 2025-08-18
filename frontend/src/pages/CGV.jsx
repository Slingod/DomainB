import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ScrollTopButton from '../components/ScrollTopButton';
import './CGV.scss';

export default function CGV() {
  const { t } = useTranslation();
  const tocItems = t('cgv.toc.items', { returnObjects: true });
  const sections = t('cgv.sections', { returnObjects: true });

  return (
    <main className="page legal-page cgv-page">
      <Helmet>
        <title>{t('cgv.metaTitle')}</title>
        <meta name="description" content={t('cgv.metaDescription')} />
        <meta name="keywords" content={t('cgv.metaKeywords')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaineberthuit.com/cgv" />
      </Helmet>

      <div id="top" />

      <h1 className="legal-title">{t('cgv.title')}</h1>

      <div className="legal-layout">
        <nav className="toc" role="navigation" aria-label={t('cgv.toc.title')}>
          <h2 className="toc-title">{t('cgv.toc.title')}</h2>
          <ol className="toc-list">
            {Object.entries(tocItems).map(([key, label]) => (
              <li key={key}>
                <a href={`#section-${key}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-content">
          {Object.entries(sections).map(([key, section]) => (
            <section
              id={`section-${key}`}
              key={key}
              aria-labelledby={`heading-${key}`}
              className="legal-section"
            >
              <h2 id={`heading-${key}`}>{section.title}</h2>
              {section.content && <p>{section.content}</p>}

              {key === '11' && (
                <>
                  <p><strong>{section.societe}</strong></p>
                  <p><strong>{section.adresse}</strong></p>
                  <p><strong>{section.email}</strong></p>
                  <p><strong>{section.siret}</strong></p>
                  <p>{section.date}</p>
                </>
              )}
            </section>
          ))}
        </article>
      </div>

      <ScrollTopButton />
    </main>
  );
}
