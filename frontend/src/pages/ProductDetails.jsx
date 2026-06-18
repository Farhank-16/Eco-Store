import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Loader2,
  Star,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Check,
  Flame,
  ArrowRight
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("default");
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { items: wishlistItems, toggleWishlist } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/product/get/${slug}`);
        const prod = res.data.product;
        setProduct(prod);
        if (prod) {
          const imgs = prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []);
          setActiveImage(imgs[0] || "");

          // Fetch related products (with category filter if present, otherwise general fallback)
          const prodCategoryId = prod.category?._id || prod.category;
          const allProdRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/product/get`);
          const allProducts = allProdRes.data.products || [];
          
          let filtered = [];
          if (prodCategoryId) {
            filtered = allProducts.filter(p => {
              const pCategoryId = p.category?._id || p.category;
              const matchesCategory = String(pCategoryId) === String(prodCategoryId);
              const isNotSelf = String(p._id) !== String(prod._id);
              return matchesCategory && isNotSelf;
            });
          }
          
          if (filtered.length < 4) {
            const otherProducts = allProducts.filter(p => {
              const isNotSelf = String(p._id) !== String(prod._id);
              const isNotAlreadyFiltered = filtered.some(f => String(f._id) === String(p._id));
              return isNotSelf && !isNotAlreadyFiltered;
            });
            filtered.push(...otherProducts.slice(0, 4 - filtered.length));
          }
          
          setRelatedProducts(filtered.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [slug]);

  const handleAction = () => {
    if (!user) {
      toast.error('PLEASE LOG IN');
      navigate("/login");
    } else {
      addToCart(product);
      toast.success("ADDED TO BAG");
      navigate("/cart");
    }
  };

  const handleAddToCartOnly = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('PLEASE LOG IN');
      navigate("/login");
    } else {
      addToCart(product);
      toast.success("ADDED TO BAG");
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('PLEASE LOG IN');
      navigate("/login");
    } else {
      toggleWishlist(product);
      const isCurrentlyIn = wishlistItems.some(item => item._id === product?._id);
      toast.success(isCurrentlyIn ? "REMOVED FROM GRAILS" : "ADDED TO GRAILS");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[85vh] bg-background text-on-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-background text-on-background p-6">
        <h2 className="font-display text-3xl tracking-widest uppercase mb-4">Product Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-primary text-white font-display text-xs tracking-widest uppercase hover:bg-primary-container transition-colors"
        >
          GO BACK
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const currentPrice = product.discountedPrice && product.discountedPrice < product.originalPrice ? product.discountedPrice : product.originalPrice;
  const isDiscounted = product.discountedPrice && product.discountedPrice < product.originalPrice;
  const discountPercent = isDiscounted ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100) : 0;
  const isWishlisted = wishlistItems.some(item => item._id === product._id);

  return (
    <div className="bg-background min-h-screen text-on-background pt-20 pb-24">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-8 uppercase tracking-widest font-bold">
          <Link to="/" className="hover:text-primary transition-colors">HOME</Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <Link to="/products" className="hover:text-primary transition-colors">CATALOG</Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span className="text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 mb-20">
          
          {/* Gallery Column */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-square bg-surface border border-outline/10 overflow-hidden group">
              <img 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src={activeImage}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 shadow-md">
                  REBEL ARCHIVE
                </span>
              </div>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square overflow-hidden border transition-all cursor-pointer ${
                      activeImage === img ? 'border-primary shadow-sm' : 'border-outline/15 hover:border-white/50'
                    }`}
                  >
                    <img className="w-full h-full object-cover" src={img} alt={`thumbnail-${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Column */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="bg-surface p-6 sm:p-10 border border-outline/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                  {product.category?.name || 'STREETWEAR'}
                </span>
                <span className="w-1.5 h-1.5 bg-outline rounded-full" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  4.8 RATING
                </span>
                {product.stock <= 0 && (
                  <>
                    <span className="w-1.5 h-1.5 bg-outline rounded-full" />
                    <span className="bg-red-500/20 text-red-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-red-500/10">
                      SOLD OUT
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-widest uppercase text-on-surface mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-extrabold text-primary">₹{currentPrice}</span>
                {isDiscounted && (
                  <>
                    <span className="text-on-surface-variant line-through text-sm">₹{product.originalPrice}</span>
                    <span className="bg-primary/20 text-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-on-surface-variant text-xs font-semibold leading-relaxed mb-8 border-b border-outline/10 pb-6 uppercase tracking-wider">
                {product.description || "Premium weight heavyweight drop tailored for comfortable everyday wear. Signature drop shoulder fit with ribbed cuffs and double stitching details."}
              </p>

              {/* Colorway Selection */}
              <div className="space-y-4 mb-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant block">SELECT COLORWAY</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedColor("midnight")}
                    className={`px-4 py-2 border text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                      selectedColor === "midnight" || selectedColor === "default" 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-outline/25 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    Midnight Black
                  </button>
                  <button 
                    onClick={() => setSelectedColor("ghost")}
                    className={`px-4 py-2 border text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                      selectedColor === "ghost" 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-outline/25 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    Ghost White
                  </button>
                  <button 
                    onClick={() => setSelectedColor("rebel-red")}
                    className={`px-4 py-2 border text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                      selectedColor === "rebel-red" 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-outline/25 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    Rebel Red
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCartOnly}
                    disabled={product.stock <= 0}
                    className={`flex-grow py-4 font-display text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      product.stock <= 0 
                        ? 'bg-outline/20 text-on-surface-variant/55 cursor-not-allowed border border-outline/10' 
                        : 'bg-primary hover:bg-primary-container text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4.5 h-4.5" /> {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO BAG'}
                  </button>
                  
                  <button 
                    onClick={handleWishlistToggle}
                    className={`px-5 py-4 border transition-colors flex items-center justify-center cursor-pointer ${
                      isWishlisted 
                        ? 'border-primary bg-primary/15 text-primary' 
                        : 'border-outline/25 text-on-surface-variant hover:border-white/50'
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAction}
                  disabled={product.stock <= 0}
                  className={`w-full py-4 font-display text-xs tracking-widest uppercase transition-colors cursor-pointer ${
                    product.stock <= 0 
                      ? 'bg-outline/10 text-on-surface-variant/30 cursor-not-allowed border border-outline/10' 
                      : 'bg-white hover:bg-white/95 text-black'
                  }`}
                >
                  {product.stock <= 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                </button>
              </div>

              {/* Delivery info */}
              <div className="mt-8 pt-6 border-t border-outline/10 flex items-center justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Free Shipping in India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary animate-pulse" />
                  <span>Limited Drop Specs</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Specs & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 mb-20">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl tracking-widest uppercase text-on-background">THE REBEL PROFILE</h2>
            <div className="space-y-4 text-on-surface-variant text-xs sm:text-sm leading-relaxed uppercase tracking-wider font-semibold">
              {product.rebelProfile ? (
                product.rebelProfile.split('\n').filter(Boolean).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))
              ) : (
                <>
                  <p>Designed with streetwear culture at its core. This garment undergoes a premium garment dye process to give it an authentic, lived-in luxury street feel.</p>
                  <p>Tailored to high fashion specifications: drop-shoulder aesthetic, oversized fit profile, thick neck collar ribbing, and heavy weight loopback weave.</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-surface p-6 sm:p-8 border border-outline/10">
            <h3 className="font-display text-lg tracking-widest text-on-surface mb-6 uppercase flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" /> PIECE SPECIFICATIONS
            </h3>
            <ul className="space-y-4">
              {product.specifications && product.specifications.length > 0 ? (
                product.specifications.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <div className="mt-0.5 bg-primary text-white rounded-none p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface uppercase tracking-widest">{spec.title}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{spec.value}</p>
                    </div>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-3.5">
                    <div className="mt-0.5 bg-primary text-white rounded-none p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface uppercase tracking-widest">450 GSM HEAVYWEIGHT COTTON</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Thick, high-drape cotton built to last seasons of wear.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <div className="mt-0.5 bg-primary text-white rounded-none p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface uppercase tracking-widest">OVERSIZED DROP-SHOULDER PROFILE</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Specifically cut to hang with clean lines and maximum street credibility.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <div className="mt-0.5 bg-primary text-white rounded-none p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-on-surface uppercase tracking-widest">HAND-FINISHED EMBROIDERY & DYING</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Each piece features custom embroidery details and individualized garment washing.</p>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-outline/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl tracking-widest text-on-background uppercase">COMPLETE THE LOOK</h2>
              <Link to="/products" className="text-primary font-display text-xs tracking-widest hover:underline flex items-center gap-1 uppercase">
                Browse drop <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pPrice = p.discountedPrice && p.discountedPrice < p.originalPrice ? p.discountedPrice : p.originalPrice;
                const hasPDiscount = !!(p.discountedPrice && p.discountedPrice < p.originalPrice);
                return (
                  <Link 
                    to={`/product/${p.slug || p._id}`} 
                    key={p._id}
                    className="group bg-surface border border-outline/10 hover:border-primary/20 transition-all duration-300 p-4 flex flex-col justify-between"
                  >
                    <div className="aspect-square overflow-hidden bg-background mb-4">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={p.image} 
                        alt={p.name} 
                      />
                    </div>
                    <div>
                      <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-1">{p.category?.name || "STREETWEAR"}</p>
                      <h4 className="font-display text-base text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-wider">{p.name}</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-on-surface">₹{pPrice}</span>
                        {hasPDiscount && (
                          <span className="text-[10px] text-on-surface-variant line-through">₹{p.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
