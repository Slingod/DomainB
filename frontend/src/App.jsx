import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IdleTimer from './components/IdleTimer';
import ProtectedRoute from './components/ProtectedRoute';
import CookieConsent from './components/CookieConsent';

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

export default function App() {
  const [cookiesAccepted, setCookiesAccepted] = useState(
    localStorage.getItem('cookieConsent') === 'true'
  );

  useEffect(() => {
    const accepted = localStorage.getItem('cookieConsent') === 'true';
    setCookiesAccepted(accepted);
  }, []);

  return (
    <>
      {/* SEO Meta Global */}
      <Helmet>
        <title>Domaine Berthuit - Boutique en ligne</title>
        <meta name="description" content="Bienvenue sur Domaine Berthuit. Achetez nos produits directement en ligne." />
        <meta name="keywords" content="vin, domaine, boutique, ecommerce, commande, produits, panier" />
        <meta name="author" content="Domaine Berthuit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="canonical" href="http://localhost:5173" />
      </Helmet>

      <Navbar />
      <IdleTimer timeout={15 * 60 * 1000} />

      {/* Consentement cookies obligatoire */}
      <CookieConsent onAccept={() => setCookiesAccepted(true)} />

          <main className="page-content">
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Authentification */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Informations légales */}
        <Route path="/cgu" element={<CGU />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Pages protégées (accessibles uniquement après consentement cookies) */}
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