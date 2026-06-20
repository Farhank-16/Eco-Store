import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useSearchStore } from '../store/useSearchStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useThemeStore } from '../store/useThemeStore';
import { Search, ShoppingCart, Heart, LogOut, LayoutDashboard, Package, Menu, X, User, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme } = useThemeStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Suggestions state
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    setShowSuggestions(false);
    if (location.pathname !== "/products") {
      navigate('/products');
    }
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    setMobileMenuOpen(false);
    if (location.pathname !== "/products") {
      navigate('/products');
    }
  };

  // Monitor scroll for transparent -> dark backdrop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/product/get`);
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter(p => 
      p.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (p.category?.name && p.category.name.toLowerCase().includes(inputValue.toLowerCase())) ||
      (p.material && p.material.toLowerCase().includes(inputValue.toLowerCase()))
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [inputValue, allProducts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
      if (inputValue.trim() !== "" && location.pathname !== "/products") {
        navigate('/products');
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [inputValue, setSearchQuery, navigate, location.pathname]);

  // Keep inputValue in sync with global search query changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isProductsPage = location.pathname === "/products";
  const isHomePage = location.pathname === "/";

  // Navigation menu items
  const menuItems = [
    { name: "NEW DROP", path: "/products?filter=new" },
    { name: "MEN", path: "/products?category=men" },
    { name: "WOMEN", path: "/products?category=women" },
    { name: "HOODIES", path: "/products?category=hoodies" },
    { name: "TEES", path: "/products?category=tees" },
    { name: "CARGO", path: "/products?category=cargo" },
    { name: "ACCESSORIES", path: "/products?category=accessories" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 ${
      isHomePage && !isScrolled 
        ? "bg-transparent border-transparent py-5" 
        : "bg-background/95 backdrop-blur-xl border-b border-outline/10 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
    }`}>
      <div className="flex justify-between items-center px-margin-mobile min-[1150px]:px-margin-desktop w-full max-w-container-max mx-auto">
        
        {/* Left Side: Brand Logo & Search */}
        <div className="flex items-center gap-2 sm:gap-6 min-[1150px]:gap-8 shrink-0">
          <Link to="/" className="flex items-center gap-1 group select-none shrink-0">
            <span className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-on-background group-hover:text-primary transition-colors">
              REBEL
            </span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse self-end mb-1"></span>
          </Link>
          
          {/* Navbar Search Bar (Visible on all sizes) */}
          <form onSubmit={handleSearchSubmit} className="flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-3 h-3" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="SEARCH..."
              className="pl-7.5 pr-3 py-1.5 bg-surface-container-high/50 hover:bg-surface-container-high/85 focus:bg-surface-container-highest border border-outline/10 focus:border-primary/40 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/45 w-16 min-[360px]:w-24 sm:w-36 min-[1150px]:w-44 transition-all duration-300 focus:w-24 min-[360px]:focus:w-32 sm:focus:w-56 min-[1150px]:focus:w-64 group-hover:w-24 min-[360px]:group-hover:w-32 sm:group-hover:w-56 min-[1150px]:group-hover:w-64 text-[9px] sm:text-xs tracking-wider uppercase text-on-background placeholder-on-surface-variant/70"
            />
            {inputValue && (
              <button 
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-[10px] tracking-wider uppercase font-bold"
              >
                Clear
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-2 bg-surface border border-outline rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 py-2.5 max-h-60 overflow-y-auto w-64 min-[380px]:w-72 sm:w-80 animate-fade-in">
                {suggestions.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setInputValue(p.name);
                      setShowSuggestions(false);
                      navigate(`/product/${p.slug || p._id}`);
                    }}
                    className="w-full text-left px-4.5 py-2 hover:bg-surface-container-highest text-xs font-semibold text-on-surface flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="truncate mr-2 uppercase tracking-wide">{p.name}</span>
                    <span className="text-[9px] text-white bg-primary px-2.5 py-0.5 rounded-full font-extrabold tracking-widest shrink-0 uppercase">{p.category?.name || "REBEL"}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden min-[1150px]:flex items-center gap-6 xl:gap-8">
          {menuItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className="font-display text-sm tracking-widest text-on-surface-variant hover:text-on-background transition-all py-1.5 relative group"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-350 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right Side: Account Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="hidden min-[1150px]:inline-flex p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
          </button>
          
          {/* Wishlist Link */}
          {(!user || user.role !== 'admin') && (
            <Link 
              to="/wishlist" 
              className="flex relative p-2 text-on-surface-variant hover:text-primary transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[9px] font-extrabold flex items-center justify-center rounded-full shadow-md rebel-glow-red">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart Link */}
          {(!user || user.role !== 'admin') && (
            <Link 
              to="/cart" 
              className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-secondary text-white text-[9px] font-extrabold flex items-center justify-center rounded-full shadow-md rebel-glow-purple">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="p-2 text-primary hover:bg-primary/15 rounded-full transition-colors hidden min-[1150px]:inline-flex"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}

              {user.role !== 'admin' && (
                <Link 
                  to="/my-orders" 
                  className="p-2 text-on-surface-variant hover:text-on-background transition-colors hidden min-[1150px]:inline-flex"
                  title="My Orders"
                >
                  <Package className="w-5 h-5" />
                </Link>
              )}

              {/* Profile Link */}
              <Link 
                to="/profile"
                className="hidden min-[1150px]:flex items-center gap-2 px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full border border-outline/10 cursor-pointer"
                title="View Profile"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-extrabold text-[10px] tracking-wider uppercase shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-xs font-bold text-on-surface hidden lg:inline max-w-20 truncate uppercase tracking-wider">{user.name}</span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="hidden min-[1150px]:block p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hidden min-[1150px]:inline-flex text-on-surface-variant hover:text-on-background font-bold text-xs tracking-wider uppercase px-2 py-1.5 transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="hidden min-[1150px]:inline-flex bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-md hover:scale-105"
              >
                Join
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-[1150px]:hidden p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 min-[1150px]:hidden bg-black/90 backdrop-blur-md top-[60px] animate-fade-in">
          <div className="bg-background border-t border-outline/10 px-margin-mobile py-8 flex flex-col gap-6 h-[calc(100vh-60px)] overflow-y-auto">
            
            {/* Search Input for Mobile */}
            <form onSubmit={handleMobileSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="SEARCH REBEL..."
                className="w-full pl-11 pr-4 py-2.5 bg-surface-container border border-outline/10 focus:border-primary rounded-full focus:outline-none text-xs uppercase tracking-wider text-on-background"
              />
            </form>

            {/* Quick Actions Row: Interface Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-surface-container/50 rounded-2xl border border-outline/15 shadow-sm">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Interface Theme</span>
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-surface-container rounded-full border border-outline/10"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* User Profile Card (if logged in) or Login/Join buttons (if logged out) - Placed at Top */}
            {user ? (
              <div className="flex flex-col gap-3.5 p-4 bg-surface-container/50 rounded-2xl border border-outline/15 shadow-sm">
                <div className="flex items-center gap-3 pb-3 border-b border-outline/10">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-extrabold text-base tracking-wider uppercase shrink-0 border border-primary/25">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface truncate uppercase tracking-wider">{user.name}</span>
                    <span className="text-[10px] text-on-surface-variant truncate tracking-wide font-medium">{user.email}</span>
                  </div>
                </div>
                
                {/* Account Navigation Quick Links inside Profile section */}
                <div className="flex flex-col gap-3 mt-1">
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-container flex items-center gap-3 py-1 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  {user.role !== 'admin' && (
                    <Link 
                      to="/my-orders" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-3 py-1 transition-colors"
                    >
                      <Package className="w-4 h-4 text-primary" /> My Orders
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-3 py-1 transition-colors"
                  >
                    <User className="w-4 h-4 text-on-surface-variant/70" /> My Profile
                  </Link>

                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-4 bg-surface-container/50 rounded-2xl border border-outline/15 shadow-sm">
                <Link 
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline/15 text-on-surface rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center"
                >
                  Log In
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center shadow-sm"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Categories & Main Shop Links (Placed below Profile Card) */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest px-1">Categories</span>
              <nav className="flex flex-col gap-4 mt-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display text-2xl tracking-widest text-on-background hover:text-primary transition-colors py-2 border-b border-outline/5"
                  >
                    {item.name}
                  </Link>
                ))}
                
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold uppercase tracking-wider text-on-surface-variant py-2.5 flex items-center gap-3.5 mt-2"
                >
                  <User className="w-5 h-5 text-secondary" /> Brand Story
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
