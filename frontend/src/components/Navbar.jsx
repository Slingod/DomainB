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

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate('/');
  };

  const navLinks = (
    <>
      <Link to="/" className="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
             style={{ marginRight: '6px', verticalAlign: 'middle' }}>
          <path d="M3 9.75L12 3l9 6.75V21a.75.75 0 0 1-.75.75h-5.25v-6h-6v6H3.75A.75.75 0 0 1 3 21V9.75z" />
        </svg>
        Accueil
      </Link>

      <Link to="/products" className="nav-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
             style={{ marginRight: '6px', verticalAlign: 'middle' }}>
          <path d="M6 2l1.5 5h9L18 2M5 8h14l-1.5 12H6.5L5 8z" />
        </svg>
        Produits
      </Link>

      {token && (
        <>
          <Link to="/cart" className="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                 style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a1 1 0 0 0 .99.82h10.66a1 1 0 0 0 .98-.79L23 6H6" />
            </svg>
            Panier
          </Link>

          <Link to="/orders" className="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <path d="M9 12h6M9 16h6" />
              <path d="M20 7V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3m16 0v13l-4-2-4 2-4-2-4 2V7" />
            </svg>
            <span className="nav-link-text">
              Commandes
            </span>
          </Link>
        </>
      )}

      {token && role === 'moderator' && (
        <Link to="/moderation" className="nav-link">Modération</Link>
      )}

      {token && role === 'admin' && (
        <>
          <Link to="/admin/products" className="nav-link">Admin Produits</Link>
          <Link to="/admin/users" className="nav-link">Admin Utilisateurs</Link>
        </>
      )}
    </>
  );

  const authControls = (
    <>
      {token && username && (
        <Link to="/profile" className="navbar-greeting">
          👋 Bonjour, <strong>{username}</strong>
        </Link>
      )}
      {!token ? (
        <>
          <Link to="/signup" className="nav-link">Inscription</Link>
          <Link to="/login" className="nav-link">Connexion</Link>
        </>
      ) : (
        <button onClick={handleLogout} className="nav-button">
          <svg xmlns="http://www.w3.org/2000/svg"
               width="20" height="20" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round"
               style={{ marginRight: '6px', verticalAlign: 'middle' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Déconnexion
        </button>
      )}
    </>
  );

  return (
    <nav className={`navbar${open ? ' open' : ''}`}>
      <div className="navbar-main">
        <button
          className="navbar-toggle"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Menu mobile"
          aria-expanded={open}
        >
          ☰
        </button>

        <div className="navbar-desktop">
          <div className="navbar-left">{navLinks}</div>
          <div className="navbar-right">{authControls}</div>
        </div>
      </div>

      <div className="navbar-mobile" role="dialog" aria-label="Menu mobile">
        <div className="navbar-mobile-content">
          {navLinks}
          <hr />
          {authControls}
        </div>
      </div>
    </nav>
  );
}
