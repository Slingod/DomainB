import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CookieConsent.scss';

/* Helpers: cookie simple (pas de localStorage) */
function readConsentCookie() {
  const m = document.cookie.match(/(?:^|;\s*)cookieConsent=([^;]+)/);
  return m ? decodeURIComponent(m[1]) === 'true' : false;
}
function writeConsentCookie(value) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `cookieConsent=${value ? 'true' : 'false'}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export default function CookieConsent({ onAccept }) {
  const { t } = useTranslation();

  // visible si pas encore accepté (bandeau) ; réutilisé pour le panneau "gérer"
  const initiallyAccepted = readConsentCookie();
  const [visible, setVisible] = useState(!initiallyAccepted);
  // vue courante: "ask" (demande) ou "manage" (paramètres après acceptation)
  const [view, setView] = useState(initiallyAccepted ? 'manage' : 'ask');

  // sync multi-onglets
  useEffect(() => {
    const sync = () => {
      const accepted = readConsentCookie();
      if (accepted) {
        // si accepté ailleurs → fermer le bandeau
        setVisible(false);
        setView('manage');
      } else {
        // si retiré ailleurs → rouvrir la demande
        setVisible(true);
        setView('ask');
      }
    };
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const accept = () => {
    writeConsentCookie(true);
    setVisible(false);
    setView('manage');
    window.dispatchEvent(new Event('cookieconsent:accepted'));
    onAccept?.();
  };

  const refuse = () => {
    writeConsentCookie(false);
    setVisible(false); // accès restreint (Navbar/Routes gèrent), bouton "reopen" reste
    setView('ask');
    window.dispatchEvent(new Event('cookieconsent:refused'));
  };

  const revoke = () => {
    // Retire le consentement, reste ouvert en mode "ask"
    writeConsentCookie(false);
    setView('ask');
    setVisible(true);
    window.dispatchEvent(new Event('cookieconsent:refused'));
  };

  const closePanel = () => setVisible(false);

  const reopen = () => {
    setView(readConsentCookie() ? 'manage' : 'ask');
    setVisible(true);
  };

  return (
    <>
      {visible && (
        <aside
          className={`cookie-consent cookie-consent--left ${view === 'manage' ? 'is-manage' : 'is-ask'}`}
          role="dialog"
          aria-live="polite"
          aria-label={t('cookies.title', 'Cookies & Âge')}
        >
          <div className="cc-icon" aria-hidden="true">🍪</div>

          <div className="cc-content">
            <h3 className="cc-title">
              {t('cookies.title', 'Cookies & Âge')}
              <span className="cc-age-badge">{t('cookies.ageBadge', '18+')}</span>
            </h3>

            {/* ✅ nouvelle note d’accès complet */}
            <p className="cc-note">
              {t('cookies.fullAccess', 'Pour bénéficier d’un accès complet au site, vous devez accepter nos cookies.')}
            </p>

            <p className="cc-copy">
              {t('cookies.ageNotice', 'Ce site est réservé aux personnes majeures (18+).')}{' '}
              {t('cookies.continueNotice', 'En poursuivant, vous acceptez nos')}{' '}
              <a href="/cgu" rel="nofollow">{t('cookies.cgu', 'CGU')}</a>,{' '}
              <a href="/cgv" rel="nofollow">{t('cookies.cgv', 'CGV')}</a>{' '}
              {t('cookies.and', 'et')}{' '}
              <a href="/privacy-policy" rel="nofollow">{t('cookies.privacy', 'politique de confidentialité')}</a>.
              {' '}
              <a href="/contact">{t('cookies.contact', 'Contact')}</a>
            </p>
          </div>

          {/* ✅ actions déplacées en bas (full width) */}
          <div className="cc-actions">
            {view === 'ask' ? (
              <>
                <button type="button" className="cc-btn ghost" onClick={refuse}>
                  {t('cookies.decline', 'Je refuse')}
                </button>
                <button type="button" className="cc-btn primary" onClick={accept}>
                  {t('cookies.accept', 'J’ai plus de 18 ans et j’accepte')}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="cc-btn danger" onClick={revoke}>
                  {t('cookies.revoke', 'Retirer mon consentement')}
                </button>
                <button type="button" className="cc-btn ghost" onClick={closePanel}>
                  {t('cookies.cancel', 'Fermer')}
                </button>
              </>
            )}
          </div>
        </aside>
      )}

      {/* Bouton flottant pour ré-ouvrir (paramètres si déjà accepté) */}
      {!visible && (
        <button
          className="cookie-reopen-button cookie-reopen-button--left"
          aria-label={t('cookies.settingsAria', 'Paramètres cookies')}
          onClick={reopen}
        >
          🍪 {t('cookies.reopen', 'Cookies')}
        </button>
      )}
    </>
  );
}
