import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminLayout from './pages/AdminLayout';
import Products from './pages/Products';
import Categories from './pages/Categories';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';
import { Toaster } from 'react-hot-toast';
import MyOrders from './pages/MyOrders';
import Coupons from './pages/Coupons';
import ProductListing from './pages/ProductListing';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import { useThemeStore } from './store/useThemeStore';

// Protected Route Component for Admin
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  return children;
};

// Wrapper for Public Store Routes to redirect admins
const StoreRoutes = () => {
  const { user } = useAuthStore();
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          {/* Redirect unmatched public routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default function App() {
  const user = useAuthStore((s) => s.user);
  const initTheme = useThemeStore((s) => s.initTheme);

  // On page reload, rehydrate the correct user's cart & wishlist
  useEffect(() => {
    initTheme();
    if (user) {
      const userId = user.id || user._id;
      useCartStore.getState().loadUserData(userId);
      useWishlistStore.getState().loadUserData(userId);
    } else {
      // No user logged in — ensure stores are empty
      useCartStore.setState({ items: [], _userId: null });
      useWishlistStore.setState({ items: [], _userId: null });
    }
  }, []); // Run once on mount

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-background font-sans text-on-background flex flex-col selection:bg-rose-200 selection:text-rose-900">
        <Routes>
          {/* Admin Routes (No regular Navbar) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Public Store Routes */}
          <Route path="*" element={<StoreRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}