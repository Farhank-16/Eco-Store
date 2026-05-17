import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert("Proceeding to checkout...");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3 space-y-4">
          {items.map((item) => {
            const currentPrice = item.discountedPrice && item.discountedPrice < item.originalPrice ? item.discountedPrice : item.originalPrice;
            
            return (
              <div key={item._id} className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                <Link to={`/product/${item.slug || item._id}`} className="w-full sm:w-32 h-32 shrink-0 bg-slate-50 rounded-2xl overflow-hidden block">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </Link>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${item.slug || item._id}`} className="font-bold text-lg text-slate-800 hover:text-indigo-600 line-clamp-1">{item.name}</Link>
                    <span className="font-bold text-lg text-slate-900">₹{(currentPrice * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-4">{item.category?.name || 'General'}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 sticky top-28">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((a,c) => a + c.quantity, 0)} items)</span>
                <span className="font-medium text-slate-800">₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping estimate</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax estimate</span>
                <span className="font-medium text-slate-800">₹0.00</span>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-slate-800 text-lg">Order Total</span>
              <span className="font-extrabold text-3xl text-indigo-600">₹{getTotalPrice().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mb-3"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            <Link 
              to="/"
              className="w-full py-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
