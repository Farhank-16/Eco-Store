import { useEffect, useState } from 'react';
import { getUserOrders } from '../api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Package, Loader2, Truck, Check, HelpCircle, MapPin, RefreshCw, ShoppingBag, Calendar, ShieldCheck, Flame } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        setOrders(data);
        if (data && data.length > 0) {
          setSelectedOrder(data[0]);
        }
      } catch (error) {
        toast.error("FAILED TO LOAD ORDERS");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-background text-white">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center text-center bg-surface border border-outline/10 p-8 my-12 text-white">
        <div className="w-20 h-20 mb-6 bg-background border border-outline/15 flex items-center justify-center">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl tracking-widest text-white mb-2 uppercase">NO COPS FOUND</h2>
        <p className="text-on-surface-variant text-xs uppercase tracking-wider max-w-sm mx-auto mb-8 leading-relaxed font-semibold">
          Looks like you haven't secured any drop pieces yet. Tap below to check current drops.
        </p>
        <Link to="/products" className="px-8 py-3.5 bg-primary text-white font-display text-xs tracking-widest uppercase hover:bg-primary-container transition-colors">
          SHOP THE DROP
        </Link>
      </div>
    );
  }

  // Helper to determine status classes and timeline indicators
  const getStatusStep = (status) => {
    const lower = (status || "").toLowerCase();
    if (lower === 'delivered') return 4;
    if (lower === 'shipped' || lower === 'in transit') return 3;
    if (lower === 'packed' || lower === 'processing') return 2;
    return 1; // Confirmed / Pending
  };

  const activeStep = selectedOrder ? getStatusStep(selectedOrder.status) : 1;

  return (
    <div className="bg-background min-h-screen text-white pt-20 pb-24">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Page Header */}
        <div className="mb-12 border-b border-outline/10 pb-6">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest text-white uppercase">ORDER ARCHIVE</h1>
          <p className="text-on-surface-variant text-xs sm:text-sm uppercase tracking-wider mt-2 font-semibold">
            Track, manage, and view the history of your premium drop cops.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Sidebar: Order List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">RECENT TRANSACTIONS</span>
            </div>

            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
              {orders.map((order) => {
                const isSelected = selectedOrder?._id === order._id;
                const totalItemsCount = order.products.reduce((acc, curr) => acc + curr.quantity, 0);
                const firstProduct = order.products[0]?.product;

                return (
                  <div 
                    key={order._id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-surface p-5 border cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-primary' 
                        : 'border-outline/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                          ID #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="font-display text-base text-white mt-1 uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                        order.status === 'delivered' 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'bg-white/10 text-white border border-white/20'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-outline/5">
                      <div className="w-12 h-12 overflow-hidden bg-background flex-shrink-0 border border-outline/10">
                        {firstProduct?.image || order.products[0]?.image ? (
                          <img 
                            src={firstProduct?.image || order.products[0]?.image} 
                            alt={firstProduct?.name || order.products[0]?.name || 'Product Image'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          {totalItemsCount} {totalItemsCount === 1 ? 'PIECE' : 'PIECES'} • ₹{order.totalAmount}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-widest mt-0.5">
                          {order.status === 'delivered' ? 'RELEASE COMPLETED' : 'IN TRANSIT'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Details Dashboard */}
          {selectedOrder && (
            <div className="lg:col-span-8 space-y-6">
              {/* Tracking Visualizer Card */}
              <section className="bg-surface p-6 sm:p-8 border border-outline/10 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-outline/10 pb-6">
                  <div>
                    <h2 className="font-display text-2xl tracking-widest text-white uppercase">ORDER TRACKING</h2>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">
                      CURRENT RELEASE STATUS: <span className="text-primary">{selectedOrder.status.toUpperCase()}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white text-[10px] font-display tracking-widest uppercase transition-colors flex items-center gap-1.5 cursor-pointer">
                      <Truck className="w-4 h-4" /> FULL TRACKING
                    </button>
                    <button className="px-5 py-2.5 border border-outline/15 text-on-surface-variant text-[10px] font-display tracking-widest uppercase hover:text-white hover:border-white/50 transition-colors cursor-pointer">
                      NEED HELP?
                    </button>
                  </div>
                </div>

                {/* Horizontal Timeline */}
                <div className="relative flex justify-between items-start pt-4 px-2 mb-4">
                  {/* Background progress bar line */}
                  <div className="absolute top-[30px] left-[12%] right-[12%] h-0.5 bg-background -z-0">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                    />
                  </div>

                  {/* Timeline Nodes */}
                  <div className="flex flex-col items-center text-center relative z-10 w-1/4">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-all border ${
                      activeStep >= 1 ? 'bg-primary text-white border-primary' : 'bg-surface text-on-surface-variant border-outline/10'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2">CONFIRMED</span>
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">DAY 1</span>
                  </div>

                  <div className="flex flex-col items-center text-center relative z-10 w-1/4">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-all border ${
                      activeStep >= 2 ? 'bg-primary text-white border-primary' : 'bg-surface text-on-surface-variant border-outline/10'
                    }`}>
                      {activeStep >= 2 ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2">PROCESSING</span>
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">DAY 1-2</span>
                  </div>

                  <div className="flex flex-col items-center text-center relative z-10 w-1/4">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-all border ${
                      activeStep >= 3 ? 'bg-primary text-white border-primary' : 'bg-surface text-on-surface-variant border-outline/10'
                    }`}>
                      {activeStep >= 3 ? <Check className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2">IN TRANSIT</span>
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">DAY 3</span>
                  </div>

                  <div className="flex flex-col items-center text-center relative z-10 w-1/4">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-all border ${
                      activeStep >= 4 ? 'bg-primary text-white border-primary' : 'bg-surface text-on-surface-variant border-outline/10'
                    }`}>
                      {activeStep >= 4 ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2">DELIVERED</span>
                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">COMPLETED</span>
                  </div>
                </div>
              </section>

              {/* Package Contents */}
              <div className="bg-surface p-6 sm:p-8 border border-outline/10">
                <div className="flex items-center justify-between mb-6 border-b border-outline/10 pb-4">
                  <h3 className="font-display text-lg tracking-widest text-white uppercase">PACKAGE CONTENTS</h3>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">ORDER TOTAL: ₹{selectedOrder.totalAmount}</span>
                </div>

                <div className="space-y-4">
                  {selectedOrder.products.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border border-outline/5 hover:border-outline/15 transition-all">
                      <div className="w-16 h-16 overflow-hidden bg-background shrink-0 border border-outline/10">
                        {item.product?.image || item.image ? (
                          <img 
                            src={item.product?.image || item.image} 
                            alt={item.product?.name || item.name || 'Product Image'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        {item.product ? (
                          <Link to={`/product/${item.product.slug || item.product._id}`} className="font-display text-base text-white hover:text-primary transition-colors line-clamp-1 uppercase tracking-wide">
                            {item.product.name}
                          </Link>
                        ) : (
                          <span className="font-display text-base text-on-surface-variant line-clamp-1 uppercase tracking-wide">
                            {item.name || 'Deleted Product'}
                          </span>
                        )}
                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-0.5">
                          {item.product?.category?.name || 'STREETWEAR'}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline/10">
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">QTY: {item.quantity}</p>
                        <p className="font-extrabold text-sm text-white sm:mt-1">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
