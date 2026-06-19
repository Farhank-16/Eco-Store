import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

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

  const handleRemove = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(productId);
    toast.success('REMOVED FROM GRAILS');
  };

  return (
    <div className="bg-background min-h-screen text-on-background pt-20 pb-24">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-outline/10 pb-6 mb-12 gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest text-on-surface uppercase">MY GRAILS</h1>
            <p className="text-on-surface-variant text-xs uppercase tracking-wider mt-1">
              YOUR PERSONAL REBEL ARCHIVE
            </p>
          </div>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface border border-outline/15 px-4.5 py-2">
            {items.length} PIECES SAVED
          </span>
        </div>

        {items.length === 0 ? (
          <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center text-center bg-surface border border-outline/10 p-8">
            <div className="w-20 h-20 mb-6 bg-background border border-outline/15 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl tracking-widest text-on-surface mb-2 uppercase">YOUR ARCHIVE IS EMPTY</h2>
            <p className="text-on-surface-variant text-xs uppercase tracking-wider max-w-sm mx-auto mb-8 leading-relaxed font-semibold">
              Save pieces you love here to build your collection. Grab the hottest drop before it sells out.
            </p>
            <Link 
              to="/products" 
              className="px-8 py-3.5 bg-primary text-white font-display text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-sm"
            >
              SHOP THE DROP
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((product) => {
              const currentPrice = product.discountedPrice && product.discountedPrice < product.originalPrice 
                ? product.discountedPrice 
                : product.originalPrice;
              const hasDiscount = !!(product.discountedPrice && product.discountedPrice < product.originalPrice);
              const imgUrl = product.image || (product.images && product.images[0]);
              
              return (
                <div 
                  key={product._id} 
                  className="group bg-surface border border-outline/10 hover:border-primary/20 transition-all duration-300 flex flex-col h-full relative cursor-pointer"
                  onClick={() => navigate(`/product/${product.slug || product._id}`)}
                >
                  {/* Image Frame */}
                  <div className="aspect-square overflow-hidden bg-background relative">
                    <img 
                      src={imgUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemove(e, product._id)}
                      className="absolute top-3 right-3 w-8.5 h-8.5 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-md backdrop-blur-sm text-primary hover:bg-black transition-all cursor-pointer z-20"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-primary mb-1 uppercase tracking-widest">
                        {product.category?.name || 'STREETWEAR'}
                      </div>
                      <h3 className="font-display text-lg text-on-surface uppercase tracking-wider mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 leading-relaxed font-semibold">
                        {product.description || 'Premium weight heavyweight drop tailored for comfortable everyday wear.'}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-outline/10">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-extrabold text-on-surface">₹{currentPrice}</span>
                        {hasDiscount && (
                          <span className="text-xs text-on-surface-variant line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      
                      {product.stock <= 0 ? (
                        <span className="w-full block text-center text-on-surface-variant text-xs uppercase tracking-widest font-extrabold py-2.5 bg-outline/10 border border-outline/5">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-full bg-primary hover:bg-primary-container text-white py-2.5 font-display text-xs tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> ADD TO BAG
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
