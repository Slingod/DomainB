import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.scss";
import flags from "../data/flags.json";
import Insta from "./Insta";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "fr");
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    setLanguages(flags || []);
  }, []);

  // Ferme le sélecteur de langue si click en dehors
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLang(code);
    setOpen(false);
  };

  const currentLang = languages.find((l) => l.code === lang) || {};

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-lang-selector-topright" ref={menuRef}>
        <button
          type="button"
          className="selected"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t("footer.changeLanguage", "Changer la langue")}
        >
          {currentLang.flagUrl && (
            <img src={currentLang.flagUrl} alt={currentLang.label || lang} />
          )}
          <span>{currentLang.label || lang}</span>
        </button>

        {open && (
          <ul className="options" role="listbox" aria-label={t("footer.languages", "Langues")}>
            {languages.map((l) => (
              <li
                key={l.code}
                role="option"
                aria-selected={l.code === lang}
                tabIndex={0}
                onClick={() => changeLanguage(l.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") changeLanguage(l.code);
                }}
              >
                <img src={l.flagUrl} alt={l.label} />
                <span>{l.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer-content">
        <div className="footer-links">
          <h4>{t("footer.assistance", "Assistance")}</h4>
          <ul>
            <li>
              <Link to="/contact">{t("footer.contact", "Contact")}</Link>
            </li>
            <li>
              <Link to="/cgu">{t("footer.terms", "Mentions légales")}</Link>
            </li>
            <li>
              <Link to="/cgv">{t("footer.sales", "Conditions de vente")}</Link>
            </li>
            <li>
              <Link to="/privacy-policy">{t("footer.privacy", "Politique de confidentialité")}</Link>
            </li>
            <li>
              <Link to="/faq">{t("footer.faqLong", "Foire aux questions")}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-logo-and-social">
          <div className="footer-logo">
            <Link to="/" className="footer-logo-link" aria-label={t("footer.home", "Accueil")}>
              {/* ici on laisse le contrôle au CSS via la classe footer-logo-img */}
              <img src="/logberthuit.webp" alt="Domaine Berthuit — logo" className="footer-logo-img" />
            </Link>
            <span className="footer-brand">Domaine Berthuit</span>
          </div>

          <div className="footer-social">
            <Insta />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t("footer.alcoholWarning", "L'abus d'alcool est dangereux pour la santé. À consommer avec modération.")}</p>
      </div>
    </footer>
  );
}
