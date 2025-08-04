import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CGU.scss';

export default function CGU() {
  const { t } = useTranslation();

  return (
    <main className="page cgu-page">
      <Helmet>
        <title>{t('cgu.metaTitle')}</title>
        <meta name="description" content={t('cgu.metaDescription')} />
        <meta name="keywords" content={t('cgu.metaKeywords')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaineberthuit.com/cgu" />
      </Helmet>

      <h1>{t('cgu.title')}</h1>

      <nav className="toc">
        <h2>{t('cgu.toc.title')}</h2>
        <ul>
          {Object.entries(t('cgu.toc.items', { returnObjects: true })).map(([key, label]) => (
            <li key={key}>
              <a href={`#section-${key}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {Object.entries(t('cgu.sections', { returnObjects: true })).map(([key, section]) => (
        <section id={`section-${key}`} key={key}>
          <h2>{section.title}</h2>
          {section.content && <p>{section.content}</p>}
          {key === '11' && (
            <>
              <p><strong>{section.editeur}</strong></p>
              <p><strong>{section.adresse}</strong></p>
              <p><strong>{section.email}</strong></p>
              <p><strong>{section.siret}</strong></p>
              <p>{section.date}</p>
            </>
          )}
        </section>
      ))}
    </main>
  );
}