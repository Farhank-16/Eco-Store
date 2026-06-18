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
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        
        {/* Left Side: Brand Logo & Search */}
        <div className="flex items-center gap-6 md:gap-8 flex-1 md:flex-initial">
          <Link to="/" className="flex items-center gap-1.5 group select-none">
            <span className="font-display text-3xl md:text-4xl font-extrabold tracking-widest text-on-background group-hover:text-primary transition-colors">
              REBEL
            </span>
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse self-end mb-1"></span>
          </Link>
          
          {/* Desktop Search Bar */}
          <div className="hidden lg:flex relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="SEARCH THE DROP..."
              className="pl-10 pr-4 py-2 bg-surface-container-high/50 hover:bg-surface-container-high/85 focus:bg-surface-container-highest border border-outline/10 focus:border-primary/40 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/45 w-44 transition-all duration-300 focus:w-64 group-hover:w-64 text-xs tracking-wider uppercase text-on-background placeholder-on-surface-variant/70"
            />
            {inputValue && (
              <button 
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-[10px] tracking-wider uppercase font-bold"
              >
                Clear
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 py-2.5 max-h-60 overflow-y-auto w-80 animate-fade-in">
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
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 xl:gap-8">
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
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
          </button>
          
          {/* Wishlist Link */}
          {(!user || user.role !== 'admin') && (
            <Link 
              to="/wishlist" 
              className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
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
                  className="p-2 text-primary hover:bg-primary/15 rounded-full transition-colors hidden sm:inline-flex"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}

              {user.role !== 'admin' && (
                <Link 
                  to="/my-orders" 
                  className="p-2 text-on-surface-variant hover:text-on-background transition-colors hidden sm:inline-flex"
                  title="My Orders"
                >
                  <Package className="w-5 h-5" />
                </Link>
              )}

              {/* Profile Link */}
              <Link 
                to="/profile"
                className="flex items-center gap-2 px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full border border-outline/10 cursor-pointer"
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
                className="p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-on-surface-variant hover:text-on-background font-bold text-xs tracking-wider uppercase px-2 py-1.5 transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-md hover:scale-105"
              >
                Join
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/90 backdrop-blur-md top-[60px] animate-fade-in">
          <div className="bg-background border-t border-outline/10 px-margin-mobile py-8 flex flex-col gap-8 h-[calc(100vh-60px)] overflow-y-auto">
            
            {/* Search Input for Mobile */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="SEARCH REBEL..."
                className="w-full pl-11 pr-4 py-2.5 bg-surface-container border border-outline/10 focus:border-primary rounded-full focus:outline-none text-xs uppercase tracking-wider text-on-background"
              />
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-4">
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
              
              <div className="h-[1px] bg-outline/10 my-4" />

              <Link 
                to="/wishlist" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold uppercase tracking-wider text-on-surface-variant py-2 flex items-center gap-3.5"
              >
                <Heart className="w-5 h-5 text-primary" /> Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
              </Link>
              
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold uppercase tracking-wider text-on-surface-variant py-2 flex items-center gap-3.5"
              >
                <User className="w-5 h-5 text-secondary" /> Brand Story
              </Link>

              {user && (
                <>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-bold uppercase tracking-wider text-primary py-2 flex items-center gap-3.5"
                    >
                      <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
                    </Link>
                  )}
                  {user.role !== 'admin' && (
                    <Link 
                      to="/my-orders" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-bold uppercase tracking-wider text-on-surface-variant py-2 flex items-center gap-3.5"
                    >
                      <Package className="w-5 h-5" /> My Orders
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-bold uppercase tracking-wider text-on-surface-variant py-2 flex items-center gap-3.5"
                  >
                    <User className="w-5 h-5" /> My Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
