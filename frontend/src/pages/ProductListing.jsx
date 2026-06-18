import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, 
  Loader2, 
  Star, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Heart, 
  Eye, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useSearchStore } from '../store/useSearchStore';
import { useWishlistStore } from '../store/useWishlistStore';
import toast from 'react-hot-toast';

const SkeletonCard = () => (
  <div className="bg-surface p-4 rounded-none border border-outline/10 animate-pulse flex flex-col h-[420px]">
    <div className="relative aspect-square bg-surface-container-highest mb-4" />
    <div className="h-3 bg-surface-container-highest rounded w-1/3 mb-2" />
    <div className="h-4 bg-surface-container-highest rounded w-3/4 mb-2" />
    <div className="h-3 bg-surface-container-highest rounded w-5/6 mb-4 flex-grow" />
    <div className="flex justify-between items-center pt-3 border-t border-outline/10">
      <div className="space-y-1">
        <div className="h-4 bg-surface-container-highest rounded w-12" />
        <div className="h-3 bg-surface-container-highest rounded w-8" />
      </div>
      <div className="w-9 h-9 bg-surface-container-highest rounded-xl" />
    </div>
  </div>
);

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { searchQuery, setSearchQuery } = useSearchStore();

  // State variables
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Pagination and count state from API
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { items: wishlistItems, toggleWishlist: globalToggleWishlist } = useWishlistStore();

  // Filter & Sort parameters synced with SearchParams
  const selectedCategories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : 10000;
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : 0;
  const sortBy = searchParams.get('sort') || 'newest';
  const discountOnly = searchParams.get('discount') === 'true';
  const availability = searchParams.get('availability') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCollection = searchParams.get('collection') || '';
  const selectedGender = searchParams.get('gender') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/category/get`);
        setCategories(catRes.data.categories || []);

        // URL Redirection mapping from home page categories
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          const lowerTerm = categoryParam.toLowerCase();
          if (['men', 'women', 'unisex'].includes(lowerTerm)) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('category');
            newParams.set('gender', lowerTerm);
            setSearchParams(newParams);
            return;
          }

          const terms = categoryParam.toLowerCase().split(',');
          const matchedIds = [];
          
          (catRes.data.categories || []).forEach(c => {
            const nameLower = c.name.toLowerCase();
            terms.forEach(term => {
              if (term === 'home') {
                if (nameLower.includes('home') || nameLower.includes('furniture') || nameLower.includes('appliance')) {
                  matchedIds.push(c._id);
                }
              } else if (term === 'fashion' || term === 'clothe') {
                if (nameLower.includes('fashion') || nameLower.includes('clothing') || nameLower.includes('apparel') || nameLower.includes('fabric')) {
                  matchedIds.push(c._id);
                }
              } else if (term === 'care') {
                if (nameLower.includes('care') || nameLower.includes('beauty') || nameLower.includes('personal')) {
                  matchedIds.push(c._id);
                }
              } else {
                if (nameLower.includes(term)) {
                  matchedIds.push(c._id);
                }
              }
            });
          });

          if (matchedIds.length > 0) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('category');
            newParams.set('categories', matchedIds.join(','));
            setSearchParams(newParams);
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        sort: sortBy
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedCategories.length > 0) params.categories = selectedCategories.join(',');
      if (discountOnly) params.discount = 'true';
      if (minPrice > 0) params.minPrice = minPrice;
      if (maxPrice < 10000) params.maxPrice = maxPrice;
      if (selectedCollection) params.collectionType = selectedCollection;
      if (selectedGender) params.gender = selectedGender;
      
      const filterParam = searchParams.get('filter');
      if (filterParam) params.filter = filterParam;

      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/product/get`, { params });
      
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || (res.data.products || []).length);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Could not fetch products. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, searchQuery]);

  const handleCategoryChange = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    let updated;
    if (selectedCategories.includes(catId)) {
      updated = selectedCategories.filter(id => id !== catId);
    } else {
      updated = [...selectedCategories, catId];
    }
    if (updated.length > 0) {
      newParams.set('categories', updated.join(','));
    } else {
      newParams.delete('categories');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };



  const handlePriceChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('maxPrice', val);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleDiscountToggle = (e) => {
    const checked = e.target.checked;
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('discount', 'true');
    } else {
      newParams.delete('discount');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleAvailabilityToggle = (e) => {
    const checked = e.target.checked;
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('availability', 'in-stock');
    } else {
      newParams.delete('availability');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', val);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNum.toString());
    setSearchParams(newParams);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('PLEASE LOG IN TO ADD TO BAG');
      navigate('/login');
    } else {
      addToCart(product);
      toast.success('PIECE ADDED TO BAG');
    }
  };

  const toggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('PLEASE LOG IN TO WISHLIST');
      navigate('/login');
    } else {
      globalToggleWishlist(product);
      const isCurrentlyIn = wishlistItems.some(item => item._id === product._id);
      toast.success(isCurrentlyIn ? 'REMOVED FROM GRAILS' : 'ADDED TO GRAILS');
    }
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
  };

  // Helper to get badges based on stock and hash
  const getBadgeType = (product) => {
    if (product.stock === 0) return "SOLD OUT";
    const hash = product._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 3 === 0) return "NEW";
    if (hash % 3 === 1) return "LIMITED";
    return "";
  };

  return (
    <div className="bg-background min-h-screen text-on-background pt-20">
      {searchQuery && (
        <div className="bg-primary/15 border-b border-primary/20 py-3.5 text-center text-xs tracking-widest font-extrabold text-primary uppercase">
          SHOWING RESULTS FOR "{searchQuery}" 
          <button onClick={() => setSearchQuery('')} className="ml-2 hover:underline text-[10px] text-on-surface-variant font-bold">
            (CLEAR SEARCH)
          </button>
        </div>
      )}

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-outline/10">
              <span className="font-display text-2xl tracking-widest text-on-background flex items-center gap-2.5 uppercase">
                <SlidersHorizontal className="w-5 h-5 text-primary" /> FILTERS
              </span>
              {(selectedCategories.length > 0 || maxPrice < 10000 || discountOnly || availability !== 'all' || searchQuery || selectedCollection || selectedGender) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] tracking-wider uppercase font-extrabold text-primary hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <section className="space-y-4">
              <h3 className="font-display text-xs tracking-widest text-on-surface-variant uppercase font-extrabold">CATEGORIES</h3>
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 text-xs tracking-wider uppercase font-bold text-on-surface-variant cursor-pointer hover:text-on-background transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => handleCategoryChange(cat._id)}
                      className="rounded-none border-outline text-primary focus:ring-primary/40 bg-surface w-4 h-4 cursor-pointer"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Price Range */}
            <section className="space-y-4">
              <h3 className="font-display text-xs tracking-widest text-on-surface-variant uppercase font-extrabold">PRICE RANGE</h3>
              <input
                type="range"
                min="0"
                max="10000"
                step="250"
                value={maxPrice}
                onChange={handlePriceChange}
                className="w-full h-1 bg-outline rounded-none appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold tracking-widest">
                <span>₹{minPrice}</span>
                <span>₹{maxPrice}+</span>
              </div>
            </section>

            {/* Offers & Availability */}
            <section className="space-y-4">
              <h3 className="font-display text-xs tracking-widest text-on-surface-variant uppercase font-extrabold">STATUS</h3>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-3 text-xs tracking-wider uppercase font-bold text-on-surface-variant cursor-pointer hover:text-on-background transition-colors">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={handleDiscountToggle}
                    className="rounded-none border-outline text-primary focus:ring-primary/40 bg-surface w-4 h-4 cursor-pointer"
                  />
                  <span>ON SALE</span>
                </label>
                <label className="flex items-center gap-3 text-xs tracking-wider uppercase font-bold text-on-surface-variant cursor-pointer hover:text-on-background transition-colors">
                  <input
                    type="checkbox"
                    checked={availability === 'in-stock'}
                    onChange={handleAvailabilityToggle}
                    className="rounded-none border-outline text-primary focus:ring-primary/40 bg-surface w-4 h-4 cursor-pointer"
                  />
                  <span>IN STOCK ONLY</span>
                </label>
              </div>
            </section>


          </aside>

          {/* Mobile Filters Drawer Modal */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-md">
              <div className="relative w-80 max-w-sm bg-surface p-6 shadow-2xl flex flex-col h-full overflow-y-auto border-r border-outline/15">
                <div className="flex items-center justify-between pb-4 border-b border-outline/10 mb-6">
                  <span className="font-display text-2xl tracking-widest text-on-surface uppercase">FILTERS</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 hover:bg-surface-container-highest rounded-full text-on-surface cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Categories */}
                  <section className="space-y-3">
                    <h3 className="font-display text-xs tracking-widest text-on-surface-variant uppercase font-extrabold">CATEGORIES</h3>
                    <div className="flex flex-col gap-2">
                      {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-3 text-xs uppercase tracking-wider font-bold text-on-surface-variant cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat._id)}
                            onChange={() => handleCategoryChange(cat._id)}
                            className="rounded-none border-outline text-primary focus:ring-primary/40 bg-surface w-4 h-4"
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Price Range */}
                  <section className="space-y-3">
                    <h3 className="font-display text-xs tracking-widest text-on-surface-variant uppercase font-extrabold">PRICE RANGE</h3>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="250"
                      value={maxPrice}
                      onChange={handlePriceChange}
                      className="w-full h-1 bg-outline rounded-none appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-bold tracking-widest">
                      <span>₹{minPrice}</span>
                      <span>₹{maxPrice}+</span>
                    </div>
                  </section>

                  {/* Offers & Availability */}
                  <section className="space-y-3">
                    <h3 className="font-display text-xs tracking-widest text-on-surface-variant uppercase font-extrabold">STATUS</h3>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 text-xs uppercase tracking-wider font-bold text-on-surface-variant cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discountOnly}
                          onChange={handleDiscountToggle}
                          className="rounded-none border-outline text-primary focus:ring-primary/40 bg-surface w-4 h-4"
                        />
                        <span>ON SALE</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs uppercase tracking-wider font-bold text-on-surface-variant cursor-pointer">
                        <input
                          type="checkbox"
                          checked={availability === 'in-stock'}
                          onChange={handleAvailabilityToggle}
                          className="rounded-none border-outline text-primary focus:ring-primary/40 bg-surface w-4 h-4"
                        />
                        <span>IN STOCK ONLY</span>
                      </label>
                    </div>
                  </section>


                </div>

                <div className="mt-8 pt-4 border-t border-outline/10 flex gap-3">
                  <button 
                    onClick={clearAllFilters}
                    className="flex-1 py-3 bg-transparent border border-outline/25 text-on-surface font-display text-xs tracking-widest uppercase hover:bg-surface-container-high transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1 py-3 bg-primary text-white font-display text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Display Area */}
          <div className="flex-grow">
            
            {/* Sorting & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest text-on-background uppercase">REBEL DROP</h1>
                <p className="text-on-surface-variant text-xs uppercase tracking-wider mt-1">
                  SHOWING {totalCount} PIECES OF STREETWEAR CULTURE
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-end">
                <button 
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-outline/10 bg-surface font-display text-xs tracking-widest uppercase text-on-surface hover:border-on-surface/30"
                >
                  <Filter className="w-4 h-4 text-primary" /> Filters
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={handleSortChange}
                    className="bg-surface border border-outline/15 text-on-surface rounded-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold py-2 px-4 w-44 cursor-pointer tracking-wider uppercase"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount-desc">Biggest Discount</option>
                    <option value="rating-desc">Highest Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error handling */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 text-primary rounded-none max-w-xl mx-auto mb-6">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="flex-grow text-xs tracking-wide uppercase font-bold">{error}</div>
                <button 
                  onClick={fetchProducts} 
                  className="text-xs font-bold underline hover:no-underline cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Main Listing Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-surface border border-outline/10 max-w-2xl mx-auto">
                <SlidersHorizontal className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                <h3 className="font-display text-2xl tracking-widest text-on-surface mb-1 uppercase">No products found</h3>
                <p className="text-on-surface-variant text-xs uppercase tracking-wider max-w-sm mx-auto mb-6">
                  Try adjusting your pricing sliders, choosing another category, or cleaning your current search query.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-primary text-white font-display text-xs tracking-widest uppercase hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => {
                    const hasDiscount = !!(product.discountedPrice && product.discountedPrice < product.originalPrice);
                    const discountPercentage = hasDiscount 
                      ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
                      : 0;
                    const isWishlisted = wishlistItems.some(item => item._id === product._id);
                    const badge = getBadgeType(product);
                    
                    return (
                      <div
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                        key={product._id}
                        className="group bg-surface border border-outline/10 hover:border-primary/20 transition-all duration-300 flex flex-col cursor-pointer relative"
                      >
                        {/* Image section */}
                        <div className="relative aspect-square overflow-hidden bg-background">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
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
                            
                            {hasDiscount && (
                              <span className="bg-primary text-white text-[9px] font-extrabold px-2.5 py-0.5 tracking-widest shadow-sm">
                                {discountPercentage}% OFF
                              </span>
                            )}
                          </div>
 
                          {/* Quick Wishlist and Quick View over hover */}
                          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
                            <button
                              onClick={(e) => toggleWishlist(e, product)}
                              className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center shadow-md backdrop-blur-sm transition-all ${
                                isWishlisted
                                  ? "bg-primary border-primary text-white"
                                  : "bg-black/60 border-white/10 text-white hover:bg-black"
                              }`}
                              title={isWishlisted ? "Remove from grails" : "Add to grails"}
                            >
                              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white text-white" : ""}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewProduct(product);
                              }}
                              className="w-8.5 h-8.5 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-md backdrop-blur-sm text-white hover:bg-black transition-all"
                              title="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Info section */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[9px] font-bold text-primary mb-1 uppercase tracking-widest self-start">
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
                              {hasDiscount ? (
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

                {/* Server-Side Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 select-none">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-outline/10 rounded-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-none font-display text-sm tracking-widest transition-all border ${
                            currentPage === pageNum
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "border-outline/10 text-on-surface-variant hover:bg-surface"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-outline/10 rounded-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </main>

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
