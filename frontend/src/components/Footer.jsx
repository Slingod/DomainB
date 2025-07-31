import { Link } from 'react-router-dom';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-links">
          <h4>Assistance</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/cgu">CGU</Link></li>
            <li><Link to="/privacy-policy">Politique de confidentialité</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-logo">
          <img src="/logberthuit.webp" alt="Domaine Berthuit Logo" />
          <span>Domaine Berthuit</span>
          <div className="footer-languages">
            <label htmlFor="lang-select">Langue :</label>
            <select id="lang-select" defaultValue="fr">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>L'abus d’alcool est dangereux pour la santé, à consommer avec modération.</p>
      </div>
    </footer>
  );
}