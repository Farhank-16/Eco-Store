import { useEffect, useState } from 'react';
import { getAllOrders, getProducts } from '../api';
import toast from 'react-hot-toast';
import { IndianRupee, ShoppingCart, TrendingUp, Package, Loader2, ArrowUpRight, ArrowDownRight, Users, Eye, Sparkles, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getAllOrders(),
          getProducts()
        ]);
        setOrders(ordersData || []);
        setProducts(productsData?.products || []);
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyRevenue = orders
    .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyRevenue = orders
    .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalOrders = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== "Delivered").length;
  const uniqueBuyersCount = new Set(orders.map(o => o.buyer?._id).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body-md text-on-surface">
      {/* Page Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display-lg">Dashboard Overview</h2>
          <p className="text-sm text-on-surface-variant font-body-md mt-1">Real-time performance metrics for Rebel ECommerce.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all">
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue KPI */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-secondary font-bold text-xs flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-on-surface font-display-lg mt-0.5">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="w-full h-6 mt-3 overflow-hidden opacity-35 flex items-end gap-1">
            <div className="w-full bg-primary h-[40%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[50%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[75%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[90%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[85%] rounded-t-sm"></div>
          </div>
        </div>

        {/* Orders KPI */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-secondary-container/20 rounded-xl text-primary">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-secondary font-bold text-xs flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Active Orders</p>
            <h3 className="text-2xl font-extrabold text-on-surface font-display-lg mt-0.5">{activeOrdersCount} / {totalOrders}</h3>
          </div>
          <div className="w-full h-6 mt-3 overflow-hidden opacity-35 flex items-end gap-1">
            <div className="w-full bg-secondary h-[30%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[45%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[70%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[80%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[95%] rounded-t-sm"></div>
          </div>
        </div>

        {/* Customers KPI */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-secondary-container/20 rounded-xl text-secondary">
              <Users className="w-5 h-5 text-secondary animate-pulse" />
            </div>
            <span className="text-secondary font-bold text-xs flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.1%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-on-surface font-display-lg mt-0.5">{uniqueBuyersCount}</h3>
          </div>
          <div className="w-full h-6 mt-3 overflow-hidden opacity-35 flex items-end gap-1">
            <div className="w-full bg-secondary h-[20%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[40%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[50%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[35%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-secondary h-[85%] rounded-t-sm"></div>
          </div>
        </div>

        {/* Weekly Volume */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary animate-bounce">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-red-500 font-bold text-xs flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> -0.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Weekly Revenue</p>
            <h3 className="text-2xl font-extrabold text-on-surface font-display-lg mt-0.5">₹{weeklyRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="w-full h-6 mt-3 overflow-hidden opacity-35 flex items-end gap-1">
            <div className="w-full bg-primary h-[80%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[70%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[65%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[85%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[95%] rounded-t-sm"></div>
          </div>
        </div>
      </section>

      
        

        {/* Categories Distribution */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col justify-between">
          <h4 className="text-base font-extrabold text-on-surface">Distribution</h4>
          <div className="flex items-center justify-center py-4">
            <div className="w-32 h-32 rounded-full border-[12px] border-surface-container flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[12px] border-primary border-r-transparent border-b-transparent -rotate-45"></div>
              <div className="absolute inset-0 rounded-full border-[12px] border-secondary border-l-transparent border-t-transparent rotate-12"></div>
              <div className="text-center">
                <span className="block text-xl font-extrabold text-on-surface font-display-lg">{totalOrders}</span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Orders</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs font-bold text-on-surface">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-on-surface-variant font-medium"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Hoodies & Fleeces</span>
              <span>45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-on-surface-variant font-medium"><span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span> Graphic Tees</span>
              <span>35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-on-surface-variant font-medium"><span className="w-2.5 h-2.5 rounded-full bg-outline inline-block"></span> Cargo & Accessories</span>
              <span>20%</span>
            </div>
          </div>
        </div>
      

      {/* Activity and Top Products Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders activity list */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-base font-extrabold text-on-surface">Recent Activity</h4>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live Log</span>
          </div>

          <div className="space-y-4">
            {orders.slice(0, 4).map((order, idx) => (
              <div key={order._id} className="flex gap-4 p-3 hover:bg-surface-container-low rounded-2xl transition-colors duration-150 border border-transparent hover:border-outline-variant/10">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface font-extrabold">New Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] text-on-surface-variant truncate mt-0.5">Purchased by {order.buyer?.name || 'Customer'} • ₹{order.totalAmount}</p>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full self-center tracking-wider shrink-0 ${
                  order.status === 'delivered' ? 'bg-[#7cf994]/20 text-[#006e2d]' : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-6">No recent activity detected.</p>
            )}
          </div>
        </div>

        {/* Top Product Inventory Stats */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-base font-extrabold text-on-surface">Top Products</h4>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Performance</span>
          </div>

          <div className="space-y-4">
            {products.slice(0, 3).map((prod) => {
              const prodImg = prod.image || (prod.images && prod.images[0]);
              return (
                <div key={prod._id} className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-2xl transition-all duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/10">
                      {prodImg ? (
                        <img src={prodImg} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-on-surface truncate">{prod.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{prod.category?.name || "Inventory"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-on-surface">₹{prod.discountedPrice || prod.originalPrice}</p>
                    <span className="text-[8px] bg-secondary-container text-on-secondary-container font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide mt-1 inline-block">In Stock</span>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-6">No products found in catalog.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
