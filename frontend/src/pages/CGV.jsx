import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './CGV.scss';

export default function CGV() {
  const { t } = useTranslation();

  return (
    <main className="page cgv-page">
      <Helmet>
        <title>{t('cgv.metaTitle')}</title>
        <meta name="description" content={t('cgv.metaDescription')} />
        <meta name="keywords" content={t('cgv.metaKeywords')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaineberthuit.com/cgv" />
      </Helmet>

      <h1>{t('cgv.title')}</h1>

      <nav className="toc">
        <h2>{t('cgv.toc.title')}</h2>
        <ul>
          {Object.entries(t('cgv.toc.items', { returnObjects: true })).map(([key, label]) => (
            <li key={key}>
              <a href={`#section-${key}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {Object.entries(t('cgv.sections', { returnObjects: true })).map(([key, section]) => (
        <section id={`section-${key}`} key={key}>
          <h2>{section.title}</h2>
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
    </main>
  );
}
