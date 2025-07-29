import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { resetCart } from '../store/cartSlice';
import { useState, useEffect } from 'react';
import './Navbar.scss';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, username } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  // Ferme le menu lors d’un changement de route
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Scroll lock sur le body quand menu ouvert
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  // Déconnexion
  function handleLogout() {
    dispatch(logout());
    dispatch(resetCart());
    navigate('/');
  }

  return (
    <nav className={`navbar${open ? ' open' : ''}`} aria-label="Navigation principale">
      <button
        className="navbar-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="navbar-menu"
      >
        ☰
      </button>

      <div className="navbar-left" id="navbar-menu" role="navigation">
        <Link to="/" className="nav-link">🏠 Accueil</Link>
        <Link to="/products" className="nav-link">🛍️ Produits</Link>

        {token && (
          <>
            <Link to="/cart" className="nav-link">🧺 Panier</Link>
            <Link to="/orders" className="nav-link">📜 Commandes</Link>
            <Link to="/profile" className="nav-link">👤 Profil</Link>
          </>
        )}

        {token && role === 'moderator' && (
          <Link to="/moderation" className="nav-link">🛠️ Modération</Link>
        )}

        {token && role === 'admin' && (
          <>
            <Link to="/admin/products" className="nav-link">⚙️ Admin Produits</Link>
            <Link to="/admin/users" className="nav-link">👥 Admin Utilisateurs</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {token && username && (
          <span className="navbar-greeting">👋 Bonjour, {username}</span>
        )}

        {!token ? (
          <>
            <Link to="/signup" className="nav-link">✍️ Inscription</Link>
            <Link to="/login" className="nav-link">🔑 Connexion</Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="nav-button"
            aria-label="Déconnexion"
          >
            🚪 Déconnexion
          </button>
        )}
      </div>
    </nav>
  );
}