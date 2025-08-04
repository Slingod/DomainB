import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CookieConsent.scss';

export default function CookieConsent({ onAccept }) {
  const [visible, setVisible] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const accepted = localStorage.getItem('cookieConsent') === 'true';
    setAlreadyAccepted(accepted);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setAlreadyAccepted(true);
    setVisible(false);
    onAccept?.();
  };

  const handleRevoke = () => {
    localStorage.removeItem('cookieConsent');
    setVisible(true);
    setAlreadyAccepted(false);
    window.location.href = 'https://www.google.com';
  };

  const reopen = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      {!alreadyAccepted && visible && (
        <div className="cookie-modal" role="dialog" aria-modal="true">
          <div className="cookie-box">
            <h3>🍷 <strong>{t('cookies.title')}</strong></h3>
            <p>
              {t('cookies.message')}{' '}
              <a href="/cgu" target="_blank">{t('cookies.termsLink')}</a>,{' '}
              <a href="/cgv" target="_blank">{t('cookies.salesLink')}</a>{' '}
              {t('cookies.and')} <a href="/privacy-policy" target="_blank">{t('cookies.privacyLink')}</a>.
            </p>
            <div className="cookie-actions">
              <button className="btn-primary" onClick={handleAccept}>
                {t('cookies.accept')}
              </button>
            </div>
          </div>
        </div>
      )}

      {alreadyAccepted && visible && (
        <div className="cookie-modal" role="dialog" aria-modal="true">
          <div className="cookie-box">
            <h3>🍷 <strong>{t('cookies.title')}</strong></h3>
            <p>
              {t('cookies.message')}{' '}
              <a href="/cgu" target="_blank">{t('cookies.termsLink')}</a>,{' '}
              <a href="/cgv" target="_blank">{t('cookies.salesLink')}</a>{' '}
              {t('cookies.and')} <a href="/privacy-policy" target="_blank">{t('cookies.privacyLink')}</a>.
            </p>
            <div className="cookie-actions">
              <button className="btn-danger" onClick={handleRevoke}>
                ❌ {t('cookies.revoke')}
              </button>
              <button className="btn-secondary" onClick={handleCancel}>
                {t('cookies.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {alreadyAccepted && !visible && (
        <button
          className="cookie-reopen-button"
          aria-label="Paramètres cookies"
          onClick={reopen}
        >
          🍪 Cookies
        </button>
      )}
    </>
  );
}