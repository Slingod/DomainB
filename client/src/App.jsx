import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import IdleTimer from './components/IdleTimer';
import ProtectedRoute from './components/ProtectedRoute';

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

export default function App() {
  return (
    <>
      <Navbar />
      <IdleTimer timeout={15 * 60 * 1000} />
      <div className="page-content">
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

          {/* Espace membre / mod / admin */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute element={Cart} roles={['member', 'moderator', 'admin']} />
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute element={Orders} roles={['member', 'moderator', 'admin']} />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute element={Profile} roles={['member', 'moderator', 'admin']} />
            }
          />

          {/* Modération */}
          <Route
            path="/moderation"
            element={
              <ProtectedRoute element={Moderation} roles={['moderator', 'admin']} />
            }
          />

          {/* Administration */}
          <Route
            path="/admin/products"
            element={<ProtectedRoute element={AdminProducts} roles={['admin']} />}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute element={AdminUsers} roles={['admin']} />}
          />
        </Routes>
      </div>
    </>
  );
}