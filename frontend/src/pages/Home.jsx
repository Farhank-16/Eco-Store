import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Heart, Eye, ArrowRight, Clock, X, ArrowUpRight, Flame } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSearchStore } from '../store/useSearchStore';
import toast from 'react-hot-toast';

// Dynamic Intersection Observer based Lazy Loading Section to defer below-the-fold rendering
function LazySection({ children, placeholderHeight = "200px" }) {
  const [isIntersected, setIsIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" } // trigger loading slightly before scrolling in
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: isIntersected ? 'auto' : placeholderHeight }}>
      {isIntersected ? children : (
        <div style={{ height: placeholderHeight }} className="w-full bg-background" />
      )}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [collectionConfigs, setCollectionConfigs] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { searchQuery } = useSearchStore();
  const navigate = useNavigate();

  const productListingRef = useRef(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 }; // reset
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/collection/get`);
        if (collRes && collRes.data && collRes.data.configs) {
          setCollectionConfigs(collRes.data.configs);
        }
      } catch (error) {
        console.error('Failed to fetch collections', error);
      } finally {
        setLoadingCollections(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const prodRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/product/get`);
        setProducts(prodRes.data.products || []);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCollections();
    fetchProducts();
  }, []);

  const getCollectionData = (key, defaultData) => {
    const config = collectionConfigs.find(c => c.key === key);
    return config ? {
      name: config.name,
      subtitle: config.subtitle,
      imageUrl: config.imageUrl
    } : defaultData;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (!user) {
      toast.error('PLEASE LOG IN TO ADD TO CART');
      navigate('/login');
    } else {
      addToCart(product);
      toast.success('PIECE ADDED TO BAG');
    }
  };

  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    if (!user) {
      toast.error('PLEASE LOG IN TO WISHLIST');
      navigate('/login');
    } else {
      toggleWishlist(product);
      const isFav = wishlistItems.some(item => item._id === product._id);
      toast.success(isFav ? 'REMOVED FROM GRAILS' : 'ADDED TO GRAILS');
    }
  };

  // Filter products for category and search
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  
  // Helper to get badges based on stock and hash
  const getBadgeType = (product) => {
    if (product.stock === 0) return "SOLD OUT";
    const hash = product._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 3 === 0) return "NEW";
    if (hash % 3 === 1) return "LIMITED";
    return "";
  };

  return (
    <div className="bg-background min-h-screen text-on-background relative">
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          alt="REBEL Streetwear Cinematic" 
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-75 transition-transform duration-10000 ease-out" 
          src="https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1200&auto=format&fit=crop"
          srcSet="https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop 600w,
                  https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=900&auto=format&fit=crop 900w,
                  https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1200&auto=format&fit=crop 1200w,
                  https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1600&auto=format&fit=crop 1600w"
          sizes="(max-width: 600px) 600px, (max-width: 900px) 900px, (max-width: 1200px) 1200px, 1600px"
          loading="eager"
          fetchPriority="high"
          width="1600"
          height="900"
        />
        
        {/* Parallax Content */}
        <div className="relative z-20 text-center px-margin-mobile max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 mb-6 animate-pulse">
            <Flame className="w-4 h-4 text-primary fill-primary" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white">
              JOIN THE / REVOLUTION
            </span>
          </div>

          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter leading-none mb-4 uppercase select-none">
            BREAK THE RULES
          </h1>
          
          <p className="font-montserrat text-sm sm:text-base md:text-lg text-on-surface-variant max-w-lg mb-10 tracking-widest uppercase">
            Streetwear for the ones who never follow.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => productListingRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary hover:bg-primary-container text-white px-10 py-4 font-display text-lg tracking-widest transition-all rounded-none rebel-glow-red hover:scale-105 active:scale-95 cursor-pointer rebel-glitch-hover"
            >
              SHOP THE DROP
            </button>
            <Link 
              to="/products"
              className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-10 py-4 font-display text-lg tracking-widest transition-all rounded-none hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              EXPLORE ALL
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-on-surface-variant text-[10px] tracking-widest uppercase">
          <span>SCROLL DOWN</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent animate-bounce" />
        </div>
      </section>

      {/* Featured Drop Countdown Banner */}
      <LazySection placeholderHeight="150px">
        <section className="py-12 bg-surface border-y border-outline/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl tracking-widest text-white uppercase">NEXT DROP COUNTDOWN</h3>
                <p className="text-on-surface-variant text-xs uppercase tracking-wider mt-0.5">EXCLUSIVE SNEAKERS & OVERSIZED HOODIES COMING SOON</p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 select-none">
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest text-primary">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[9px] text-on-surface-variant tracking-widest uppercase mt-1">HOURS</span>
              </div>
              <span className="text-3xl text-outline-variant font-extrabold">:</span>
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest text-primary">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[9px] text-on-surface-variant tracking-widest uppercase mt-1">MINUTES</span>
              </div>
              <span className="text-3xl text-outline-variant font-extrabold">:</span>
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest text-primary animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[9px] text-on-surface-variant tracking-widest uppercase mt-1">SECONDS</span>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* Collections Section */}
      <LazySection placeholderHeight="550px">
        <section className="py-24 bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl md:text-6xl font-extrabold tracking-widest uppercase">THE CLANS</h2>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-2">CHOOSE YOUR IDENTITY</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingCollections ? (
                Array(4).fill(0).map((_, idx) => (
                  <div key={idx} className="bg-surface border border-outline/10 h-[450px] animate-pulse flex flex-col justify-end p-8">
                    <div className="h-3 w-20 bg-outline/20 mb-2 rounded"></div>
                    <div className="h-8 w-40 bg-outline/20 mb-3 rounded"></div>
                    <div className="h-4 w-28 bg-outline/20 rounded"></div>
                  </div>
                ))
              ) : (
                collectionConfigs.map((config, index) => {
                  const isEven = index % 2 === 0;
                  const borderHoverColor = isEven ? "hover:border-primary/45" : "hover:border-secondary/45";
                  const textAccentColor = isEven ? "text-primary" : "text-secondary";
                  return (
                    <div 
                      key={config.key}
                      onClick={() => navigate(`/products?collection=${config.key}`)}
                      className={`group relative h-[450px] overflow-hidden cursor-pointer border border-outline/10 ${borderHoverColor} transition-all duration-500`}
                    >
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors duration-500 z-10" />
                      <img 
                        src={config.imageUrl} 
                        alt={config.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end">
                        <span className={`text-[10px] font-bold ${textAccentColor} tracking-widest uppercase mb-1`}>
                          {config.subtitle || `COLLECTION 0${index + 1}`}
                        </span>
                        <h3 className="font-display text-3xl font-bold tracking-widest text-white uppercase">{config.name}</h3>
                        <span className="text-[11px] text-on-surface-variant tracking-wider uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center gap-1.5">
                          SHOP NOW <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </LazySection>

      {/* Main Shop / Products Grid */}
      <LazySection placeholderHeight="650px">
        <section ref={productListingRef} className="py-24 bg-surface-container-low border-t border-outline/5">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl md:text-6xl font-extrabold tracking-widest uppercase">THE GEAR</h2>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-2">HIGH CONTRACE STREETWEAR PIECES</p>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array(4).fill(0).map((_, idx) => (
                  <div key={idx} className="bg-surface border border-outline/10 animate-pulse flex flex-col relative p-5 justify-between">
                    <div className="aspect-square bg-outline/10 w-full mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 w-16 bg-outline/20 rounded"></div>
                      <div className="h-5 w-3/4 bg-outline/20 rounded"></div>
                      <div className="h-3 w-full bg-outline/20 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-outline/10 mt-4">
                      <div className="h-6 w-20 bg-outline/20 rounded"></div>
                      <div className="h-8 w-24 bg-outline/20 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-3xl border border-outline/10 max-w-xl mx-auto">
                <p className="text-on-surface-variant text-sm uppercase tracking-widest">NO PIECES FOUND IN THIS DROP</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.slice(0, 4).map((product) => {
                    const currentPrice = product.discountedPrice && product.discountedPrice < product.originalPrice ? product.discountedPrice : product.originalPrice;
                    const isFavorite = wishlistItems.some(item => item._id === product._id);
                    const badge = getBadgeType(product);

                    return (
                      <div 
                        key={product._id} 
                        className="group bg-surface border border-outline/10 hover:border-primary/20 transition-all duration-300 flex flex-col relative"
                      >
                        {/* Product Badges */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                          {badge && (
                            <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 shadow-md ${
                              badge === "NEW" 
                                ? "bg-primary text-white" 
                                : badge === "LIMITED"
                                ? "bg-secondary text-white"
                                : "bg-surface-container-highest text-on-surface-variant border border-outline/25"
                            }`}>
                              {badge}
                            </span>
                          )}
                        </div>

                        {/* Add to Wishlist Button */}
                        <button 
                          onClick={(e) => handleWishlistToggle(e, product)}
                          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black border border-white/10 hover:border-primary flex items-center justify-center text-white transition-all cursor-pointer"
                          title={isFavorite ? "Remove from grails" : "Add to grails"}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? "fill-primary text-primary" : "text-white"}`} />
                        </button>

                        {/* Image Frame */}
                        <div className="relative aspect-square overflow-hidden bg-background">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          
                          {/* Hover Overlay Buttons */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button 
                              onClick={() => setQuickViewProduct(product)}
                              className="w-10 h-10 rounded-full bg-white text-black hover:bg-primary hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-lg"
                              title="Quick View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Details Box */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[9px] font-bold text-primary mb-1 uppercase tracking-widest">
                              {product.category?.name || 'STREETWEAR'}
                            </div>
                            <Link to={`/product/${product.slug || product._id}`}>
                              <h3 className="font-display text-xl text-on-surface uppercase tracking-wider mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 leading-relaxed font-semibold">
                              {product.description || 'Premium weight heavyweight drop tailored for comfortable everyday wear.'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-outline/10 mt-auto">
                            <div className="flex flex-col">
                              {product.discountedPrice && product.discountedPrice < product.originalPrice ? (
                                <>
                                  <span className="text-lg font-extrabold text-primary">₹{product.discountedPrice}</span>
                                  <span className="text-[10px] text-on-surface-variant line-through">₹{product.originalPrice}</span>
                                </>
                              ) : (
                                <span className="text-lg font-extrabold text-on-surface">₹{product.originalPrice || '0.00'}</span>
                              )}
                            </div>
                            
                            {badge !== "SOLD OUT" ? (
                              <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                className="bg-primary hover:bg-primary-container text-white px-4 py-2 font-display text-xs tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer uppercase"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" /> ADD TO BAG
                              </button>
                            ) : (
                              <span className="text-on-surface-variant text-xs uppercase tracking-widest font-extrabold">OUT OF STOCK</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-16">
                  <Link 
                    to="/products"
                    className="inline-flex items-center gap-2.5 bg-transparent border-2 border-on-surface hover:border-primary hover:bg-primary hover:scale-105 text-on-surface hover:text-white px-10 py-4 font-display text-lg tracking-widest transition-all cursor-pointer uppercase"
                  >
                    EXPLORE ALL CLOTHING <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </LazySection>

      {/* Brand story banner */}
      <LazySection placeholderHeight="300px">
        <section className="py-32 bg-black relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-15 filter grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop')` }} />
          <div className="relative z-10 max-w-4xl mx-auto px-margin-mobile">
            <span className="font-display text-primary text-xl tracking-widest uppercase">THE REBEL MANIFESTO</span>
            <h2 className="font-display text-5xl sm:text-7xl font-extrabold text-white tracking-widest uppercase mt-4 mb-8">
              REBEL ISN'T CLOTHING.<br/>IT'S AN ATTITUDE.
            </h2>
            <p className="font-montserrat text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
              We do not create templates. We do not copy. We disrupt. Born in the streets, made for the ones who refuse to bend. Welcome to the counter-culture.
            </p>
          </div>
        </section>
      </LazySection>

     
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative bg-surface border border-outline/25 w-full max-w-4xl shadow-2xl p-6 sm:p-10 text-left overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-background transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Frame */}
              <div className="aspect-square bg-background overflow-hidden">
                <img 
                  src={quickViewProduct.image} 
                  alt={quickViewProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details column */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                    {quickViewProduct.category?.name || 'STREETWEAR'}
                  </span>
                  
                  <h2 className="font-display text-3xl font-extrabold uppercase tracking-widest text-on-surface mt-1 mb-4">
                    {quickViewProduct.name}
                  </h2>
                  
                  <div className="flex items-center gap-4 mb-6">
                    {quickViewProduct.discountedPrice && quickViewProduct.discountedPrice < quickViewProduct.originalPrice ? (
                      <>
                        <span className="text-2xl font-extrabold text-primary">₹{quickViewProduct.discountedPrice}</span>
                        <span className="text-sm text-on-surface-variant line-through">₹{quickViewProduct.originalPrice}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-extrabold text-on-surface">₹{quickViewProduct.originalPrice || '0.00'}</span>
                    )}
                  </div>
                  
                  <p className="text-on-surface-variant text-sm font-semibold mb-6 leading-relaxed">
                    {quickViewProduct.description || 'Tailored to premium specifications for ultimate comfort, drape, and modern street aesthetics.'}
                  </p>

                  <div className="space-y-4 mb-6 border-t border-outline/10 pt-4">
                    <div className="flex justify-between text-xs tracking-wider uppercase">
                      <span className="text-on-surface-variant">Material</span>
                      <span className="text-on-surface font-bold">{quickViewProduct.material || 'Organic Heavy Cotton'}</span>
                    </div>
                    <div className="flex justify-between text-xs tracking-wider uppercase">
                      <span className="text-on-surface-variant">Rating</span>
                      <span className="text-on-surface font-bold">{quickViewProduct.ecoRating || '4.8'} / 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-outline/10">
                  <button 
                    onClick={(e) => {
                      handleAddToCart(e, quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 bg-primary hover:bg-primary-container text-white py-4 font-display text-sm tracking-widest transition-colors flex items-center justify-center gap-2 uppercase"
                  >
                    <ShoppingCart className="w-4 h-4" /> ADD TO BAG
                  </button>
                  <button 
                    onClick={(e) => {
                      handleWishlistToggle(e, quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="px-6 py-4 bg-transparent border border-outline/20 hover:border-on-surface text-on-surface transition-colors flex items-center justify-center"
                    title="Add to grails"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
