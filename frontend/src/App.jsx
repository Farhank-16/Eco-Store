import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useThemeStore } from './store/useThemeStore';

// Lazy load pages for optimized bundle sizing and performance
const Home = lazy(() => import('./pages/Home'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Coupons = lazy(() => import('./pages/Coupons'));
const ProductListing = lazy(() => import('./pages/ProductListing'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Sleek loading animation during chunk fetching
const LoadingFallback = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-bold text-on-surface-variant animate-pulse uppercase tracking-widest">Loading Rebel...</p>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </div>
    </Router>
  );
}