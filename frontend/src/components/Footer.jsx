import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.scss";
import flags from "../data/flags.json";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "fr");
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    setLanguages(flags);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLang(code);
    setOpen(false);
  };

  const currentLang = languages.find((l) => l.code === lang) || {};

  return (
    <footer className="footer">
      <div className="footer-lang-selector-topright">
        <div className="selected" onClick={() => setOpen(!open)}>
          {currentLang.flagUrl && <img src={currentLang.flagUrl} alt={lang} />}
          <span>{currentLang.label}</span>
        </div>
        {open && (
          <ul className="options">
            {languages.map((l) => (
              <li key={l.code} onClick={() => changeLanguage(l.code)}>
                <img src={l.flagUrl} alt={l.code} />
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer-content">
        <div className="footer-links">
          <h4>{t('footer.assistance')}</h4>
          <ul>
            <li><Link to="/contact">{t('footer.contact')}</Link></li>
            <li><Link to="/cgu">{t('footer.terms')}</Link></li>
            <li><Link to="/cgv">{t('footer.sales')}</Link></li> 
            <li><Link to="/privacy-policy">{t('footer.privacy')}</Link></li>
          </ul>
        </div>

        <div className="footer-logo">
          <Link to="/" aria-label="Accueil">
            <img src="/logberthuit.webp" alt="Domaine Berthuit Logo" />
          </Link>
          <span className="footer-brand">Domaine Berthuit</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t('footer.alcoholWarning')}</p>
      </div>
    </footer>
  );
}