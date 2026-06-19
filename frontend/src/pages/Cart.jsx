import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, Loader2, X, Shield, Flame, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey, applyCoupon, getActiveCoupons } from '../api';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, addToCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount, discountValue, discountType }
  const [couponLoading, setCouponLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);

  // Recommendation states
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/product/get`);
        const allProducts = res.data.products || [];
        
        // Filter out items already in the cart
        const cartIds = new Set(items.map(item => item._id));
        const filtered = allProducts.filter(p => !cartIds.has(p._id));
        
        // Take up to 4 items
        setRecommendations(filtered.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch recommended products", error);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
  }, [items]);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      if (!user) return;
      try {
        const data = await getActiveCoupons();
        if (data && data.success) {
          setActiveCoupons(data.coupons || []);
        }
      } catch (error) {
        console.error("Failed to fetch active coupons", error);
      }
    };
    fetchActiveCoupons();
  }, [user]);

  const handleApplyDirect = async (code) => {
    setCouponLoading(true);
    try {
      const data = await applyCoupon(code, subtotal);
      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
        discountValue: data.coupon.discountValue,
        discountType: data.coupon.discountType,
      });
      setCouponCode(code);
      toast.success("COUPON APPLIED SUCCESSFULLY!");
    } catch (error) {
      toast.error(error.response?.data?.message || "INVALID COUPON CODE");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleAddRecommendation = (e, product) => {
    e.preventDefault();
    if (!user) {
      toast.error('PLEASE LOG IN');
      navigate('/login');
    } else {
      addToCart(product);
      toast.success('PIECE ADDED TO BAG');
    }
  };

  const subtotal = getTotalPrice();
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("ENTER COUPON CODE");
    setCouponLoading(true);
    try {
      const data = await applyCoupon(couponCode, subtotal);
      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
        discountValue: data.coupon.discountValue,
        discountType: data.coupon.discountType,
      });
      toast.success("COUPON APPLIED SUCCESSFULLY!");
    } catch (error) {
      toast.error(error.response?.data?.message || "INVALID COUPON CODE");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("COUPON REMOVED");
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("PLEASE LOG IN");
      navigate('/login');
      return;
    }

    try {
      if (finalTotal <= 0) return toast.error("INVALID AMOUNT");

      // Fetch dynamic key from backend
      const { key } = await getRazorpayKey();
      
      const order = await createRazorpayOrder(finalTotal);
      
      const options = {
        key: key, 
        amount: order.amount,
        currency: order.currency,
        name: 'REBEL',
        description: appliedCoupon ? `Applied Coupon: ${appliedCoupon.code}` : 'REBEL Checkout',
        order_id: order.id,
        handler: async function (response) {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: items,
              amount: finalTotal,
              couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            });
            toast.success("PAYMENT SUCCESSFUL!");
            useCartStore.getState().clearCart();
          } catch (err) {
            toast.error("PAYMENT VERIFICATION FAILED!");
          }
        },
        prefill: {
          name: user.name || 'Collector',
          email: user.email || 'collector@rebel.co',
          contact: '9999999999'
        },
        theme: {
          color: '#FF2D55' // REBEL primary electric red key color
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        toast.error(response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      toast.error("ERROR INITIATING PAYMENT");
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-background pt-20 pb-24">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        
        {items.length === 0 ? (
          <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center text-center bg-surface border border-outline/10 p-8">
            <div className="w-20 h-20 mb-6 bg-background border border-outline/15 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl tracking-widest text-on-surface mb-2 uppercase">YOUR BAG IS EMPTY</h2>
            <p className="text-on-surface-variant text-xs uppercase tracking-wider max-w-sm mx-auto mb-8 leading-relaxed font-semibold">
              Looks like you haven't added any premium drop archives yet. Let's find something special.
            </p>
            <Link to="/products" className="px-8 py-3.5 bg-primary text-on-surface font-display text-xs tracking-widest uppercase hover:bg-primary-container transition-colors">
              SHOP THE DROP
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 mb-20">
            {/* Cart Items Section */}
            <div className="flex-1 space-y-6">
              <div className="flex items-end justify-between border-b border-outline/10 pb-4">
                <h1 className="font-display text-4xl font-extrabold tracking-widest text-on-surface uppercase">YOUR BAG</h1>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {items.reduce((a,c) => a + c.quantity, 0)} PIECES
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const currentPrice = item.discountedPrice && item.discountedPrice < item.originalPrice ? item.discountedPrice : item.originalPrice;
                  return (
                    <div key={item._id} className="group relative flex flex-col sm:flex-row gap-5 p-5 bg-surface border border-outline/10 transition-all duration-300">
                      <Link to={`/product/${item.slug || item._id}`} className="w-full sm:w-28 h-28 overflow-hidden bg-background flex-shrink-0 block border border-outline/10">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      </Link>

                      <div className="flex flex-col flex-grow justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link to={`/product/${item.slug || item._id}`} className="font-display text-lg text-on-surface hover:text-primary transition-colors line-clamp-1 uppercase tracking-wider">
                              {item.name}
                            </Link>
                            <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 inline-block mt-1 font-bold uppercase tracking-widest">
                              {item.category?.name || "STREETWEAR"}
                            </span>
                          </div>
                          <p className="font-extrabold text-lg text-on-surface">₹{(currentPrice * item.quantity)}</p>
                        </div>

                        <div className="mt-4 sm:mt-0 pt-4 flex items-center justify-between border-t border-outline/5">
                          <div className="flex items-center bg-background p-1 border border-outline/15">
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-surface text-on-background transition-colors disabled:opacity-40 active:scale-90 cursor-pointer"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 font-bold text-xs text-on-surface">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-surface text-on-background transition-colors active:scale-90 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer uppercase tracking-widest"
                          >
                            <Trash2 className="w-4 h-4 text-primary" /> REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="w-full lg:w-[400px]">
              <div className="sticky top-24 space-y-6">
                {/* Summary Card */}
                <div className="bg-surface p-6 sm:p-8 border border-outline/10">
                  <h2 className="font-display text-xl tracking-widest text-on-surface mb-6 uppercase border-b border-outline/10 pb-3">ORDER SUMMARY</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
                      <span>Subtotal ({items.reduce((a,c) => a + c.quantity, 0)} items)</span>
                      <span className="font-extrabold text-on-surface">₹{subtotal}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center bg-primary/10 text-primary px-3.5 py-2.5 border border-primary/20">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest">{appliedCoupon.code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold">-₹{discountAmount}</span>
                          <button onClick={handleRemoveCoupon} className="text-on-background hover:text-primary cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
                      <span>Estimated Shipping</span>
                      <span className="text-primary font-bold">Free</span>
                    </div>

                    <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
                      <span>Tax Estimate</span>
                      <span className="font-extrabold text-on-surface">₹0.00</span>
                    </div>

                    <div className="pt-4 border-t border-outline/10 flex justify-between items-end font-extrabold text-on-surface">
                      <span className="text-xs uppercase tracking-widest">Total</span>
                      <span className="text-2xl text-primary font-display">₹{finalTotal}</span>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  {!appliedCoupon && (
                    <div className="mb-6 pt-4 border-t border-outline/10">
                      <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest block mb-2">PROMO CODE</label>
                      <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          placeholder="ENTER CODE" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-background border border-outline/25 px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all uppercase tracking-widest"
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="bg-background border border-outline/15 text-on-surface px-5 py-2.5 font-display text-xs tracking-widest uppercase hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {couponLoading && <Loader2 className="w-3 h-3 animate-spin" />} Apply
                        </button>
                      </div>

                      {/* Display active coupons to click and apply */}
                      {activeCoupons.length > 0 && (
                        <div className="space-y-2 mt-4 pt-3 border-t border-outline/5">
                          <p className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-primary" /> AVAILABLE DROPS / COUPONS
                          </p>
                          <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
                            {activeCoupons.map((c) => {
                              const isEligible = subtotal >= c.minCartAmount;
                              return (
                                <button
                                  key={c._id}
                                  disabled={!isEligible}
                                  onClick={() => handleApplyDirect(c.code)}
                                  className={`text-left p-2.5 border transition-all duration-300 w-full flex flex-col justify-center rounded-none relative overflow-hidden group select-none ${
                                    isEligible 
                                      ? 'border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer hover:border-primary' 
                                      : 'border-outline/5 bg-surface-container-low opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="text-[10px] font-extrabold text-white uppercase tracking-widest font-display">{c.code}</span>
                                    <span className="text-[10px] font-extrabold text-primary uppercase">
                                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center gap-2 mt-1">
                                    <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-wider">
                                      {c.minCartAmount > 0 ? `MIN SPEND: ₹${c.minCartAmount}` : 'NO MIN SPEND'}
                                    </p>
                                    {!isEligible && (
                                      <p className="text-[8px] text-primary/70 font-extrabold uppercase tracking-widest">
                                        NEED ₹{c.minCartAmount - subtotal} MORE
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary-container text-white py-4 font-display text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="mt-6 flex items-start gap-3 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider leading-relaxed">
                    <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p>Secure checkout processed securely. Your drop specifications will be emailed to you.</p>
                  </div>
                </div>

                {/* Drop Assurance Panel */}
                <div className="bg-primary/10 p-6 border border-primary/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xs font-extrabold text-primary flex items-center gap-2 mb-2 uppercase tracking-widest">
                      <Flame className="w-4 h-4 animate-pulse" /> REBEL DROP SPECIFICATION
                    </h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider leading-relaxed font-bold">
                      Limited batch pieces. Orders are processed instantly. Secure your piece before stock is fully depleted.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Complete The Drop Section */}
        <section className="mt-16 border-t border-outline/10 pt-12">
          <h2 className="font-display text-2xl tracking-widest text-on-surface mb-8 uppercase">
            COMPLETE THE DROP
          </h2>
          {recLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">No recommendations available.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map((product) => {
                const currentPrice = product.discountedPrice && product.discountedPrice < product.originalPrice 
                  ? product.discountedPrice 
                  : product.originalPrice;
                const hasPDiscount = !!(product.discountedPrice && product.discountedPrice < product.originalPrice);
                return (
                  <div key={product._id} className="group relative bg-surface border border-outline/10 hover:border-primary/20 transition-all duration-300 p-4 flex flex-col justify-between">
                    {/* Image */}
                    <Link 
                      to={`/product/${product.slug || product._id}`} 
                      className="aspect-square bg-background overflow-hidden block relative border border-outline/5"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      {/* Quick Add Overlay */}
                      {product.stock > 0 && (
                        <button
                          onClick={(e) => handleAddRecommendation(e, product)}
                          className="absolute bottom-2.5 right-2.5 bg-primary text-white p-2 rounded-none hover:bg-primary-container active:scale-95 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                    </Link>
 
                    {/* Meta */}
                    <div className="mt-4 flex flex-col justify-between flex-grow">
                      <div>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-1">{product.category?.name || "STREETWEAR"}</p>
                        <Link 
                          to={`/product/${product.slug || product._id}`} 
                          className="font-display text-base text-on-surface hover:text-primary transition-colors line-clamp-1 uppercase tracking-wider block mb-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                      
                      <div className="pt-2 flex items-center justify-between border-t border-outline/5 mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-on-surface">₹{currentPrice}</span>
                          {hasPDiscount && (
                            <span className="text-[10px] text-on-surface-variant line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        {product.stock <= 0 ? (
                          <span className="text-[9px] font-bold text-on-surface-variant bg-outline/10 border border-outline/5 px-2 py-1.5 uppercase tracking-widest">
                            SOLD OUT
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleAddRecommendation(e, product)}
                            className="text-[9px] font-bold text-white bg-primary hover:bg-primary-container px-3 py-1.5 transition-colors cursor-pointer uppercase tracking-widest"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
