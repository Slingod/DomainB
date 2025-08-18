import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IdleTimer from './components/IdleTimer';
import ProtectedRoute from './components/ProtectedRoute';
import CookieConsent from './components/CookieConsent';
import RouteScrollTop from './components/RouteScrollTop';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Moderation from './pages/Moderation';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

import CGV from './pages/CGV';
import CGU from './pages/CGU';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LieuGeste from './pages/LieuGeste';

/* === helpers cookies === */
function readConsentCookie() {
  const m = document.cookie.match(/(?:^|;\s*)cookieConsent=([^;]+)/);
  return m ? decodeURIComponent(m[1]) === 'true' : false;
}

/* garde-route: bloque si consentement absent */
function CookiesGate({ children }) {
  const location = useLocation();
  const accepted = readConsentCookie(); // lu à chaque render
  if (accepted) return children;
  return <Navigate to="/" replace state={{ from: location, needCookies: true }} />;
}

export default function App() {
  const [cookiesAccepted, setCookiesAccepted] = useState(readConsentCookie());
  const location = useLocation();

  useEffect(() => {
    // fonction de synchro utilisée par tous les listeners
    const sync = () => setCookiesAccepted(readConsentCookie());

    // sync au focus / visibilité (changement d’onglet)
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);

    // ✅ écoute des évènements émis par CookieConsent
    window.addEventListener('cookieconsent:accepted', sync);
    window.addEventListener('cookieconsent:refused', sync);

    // init (utile si le cookie a changé avant le montage)
    sync();

    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('cookieconsent:accepted', sync);
      window.removeEventListener('cookieconsent:refused', sync);
    };
  }, []);

  // état d'auth depuis Redux (adapte selon ton authSlice)
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = Boolean(auth?.isAuthenticated ?? auth?.token ?? auth?.user);

  // IdleTimer OFF sur les pages d’auth
  const isAuthPage = useMemo(() => {
    const p = location.pathname;
    return p === '/login' || p === '/signup' || p === '/forgot-password' || p === '/reset-password';
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Domaine Berthuit - Boutique en ligne</title>
        <meta
          name="description"
          content="Bienvenue sur Domaine Berthuit. Achetez nos produits directement en ligne."
        />
        <meta
          name="keywords"
          content="vin, domaine, boutique, ecommerce, commande, produits, panier"
        />
        <meta name="author" content="Domaine Berthuit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="canonical" href="http://localhost:5173" />
      </Helmet>

      {/* on informe la navbar pour masquer/afficher les liens */}
      <Navbar cookiesAccepted={cookiesAccepted} />

      {/* IdleTimer actif seulement si connecté + cookies acceptés + pas sur une page d’auth */}
      <IdleTimer
        timeout={15 * 60 * 1000}
        enabled={isAuthenticated && !isAuthPage && cookiesAccepted}
      />

      {/* Bandeau cookies (écrit le cookie et émet les events ci-dessus) */}
      <CookieConsent onAccept={() => setCookiesAccepted(true)} />

      <RouteScrollTop behavior="auto" />

      <main className="page-content">
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Pages accessibles uniquement après consentement */}
          <Route
            path="/products"
            element={
              <CookiesGate>
                <Products />
              </CookiesGate>
            }
          />
          <Route
            path="/products/:id"
            element={
              <CookiesGate>
                <ProductDetail />
              </CookiesGate>
            }
          />
          <Route
            path="/le-lieu-et-le-geste"
            element={
              <CookiesGate>
                <LieuGeste />
              </CookiesGate>
            }
          />
          <Route
            path="/signup"
            element={
              <CookiesGate>
                <Signup />
              </CookiesGate>
            }
          />
          <Route
            path="/login"
            element={
              <CookiesGate>
                <Login />
              </CookiesGate>
            }
          />

          {/* Reset/Forgot : libres (ou mets-les derrière CookiesGate si tu préfères) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Zones protégées par rôle (et par consentement implicite via Navbar + CookiesGate si tu veux aussi) */}
          {cookiesAccepted && (
            <>
              <Route
                path="/cart"
                element={
                  <ProtectedRoute roles={['member', 'moderator', 'admin']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute roles={['member', 'moderator', 'admin']}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={['member', 'moderator', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/moderation"
                element={
                  <ProtectedRoute roles={['moderator', 'admin']}>
                    <Moderation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
            </>
          )}
        </Routes>
      </main>

      <Footer />
    </>
  );
}