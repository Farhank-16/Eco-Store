import { useEffect, useState } from 'react';
import { getUserOrders } from '../api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (error) {
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-100 shadow-sm flex flex-col items-center">
          <Package className="w-16 h-16 text-stone-300 mb-4" />
          <h3 className="text-xl font-bold text-stone-800">No orders found</h3>
          <p className="text-stone-500 mt-2 mb-6">Looks like you haven't placed any orders yet.</p>
          <Link to="/" className="px-8 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl border border-stone-100 shadow-[0_2px_15px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="bg-stone-50/50 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100">
                <div>
                  <p className="text-sm text-stone-500 mb-1">Order ID: #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="font-medium text-stone-800">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <p className="font-bold text-lg text-stone-800">Total: ₹{order.totalAmount?.toFixed(2)}</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {order.products.map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link to={`/product/${item.product?.slug}`} className="font-semibold text-stone-800 hover:text-rose-600 line-clamp-1">
                          {item.product?.name || 'Product unavailable'}
                        </Link>
                        <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium text-stone-800">
                        ₹{item.price?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
