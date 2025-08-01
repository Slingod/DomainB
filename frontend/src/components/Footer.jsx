import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";
import flags from "../data/flags.json";

export default function Footer() {
  const [lang, setLang] = useState("fr");
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    setLanguages(flags);
  }, []);

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
              <li key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}>
                <img src={l.flagUrl} alt={l.code} />
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer-content">
        <div className="footer-links">
          <h4>Assistance</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/cgu">CGU</Link></li>
            <li><Link to="/privacy-policy">Politique de confidentialité</Link></li>
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
        <p>L'abus d’alcool est dangereux pour la santé, à consommer avec modération.</p>
      </div>
    </footer>
  );
}