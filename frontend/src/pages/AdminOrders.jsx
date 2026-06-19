import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../api";
import { Search, ChevronLeft, ChevronRight, Download, Eye, FileText, Check, Clock, AlertCircle, ShoppingBag, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const load = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => ({ ...o, status: newStatus }));
      }
      toast.success("Order status updated");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColorClass = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
      case "packed":
        return "bg-secondary-container/20 text-on-secondary-container";
      case "dispatched":
      case "shipped":
        return "bg-surface-variant/40 text-on-surface-variant";
      case "out for delivery":
      case "delivered":
        return "bg-[#7cf994]/20 text-[#006e2d]";
      case "cancelled":
        return "bg-error-container/30 text-on-error-container";
      default:
        return "bg-surface-container text-on-surface-variant";
    }
  };

  // Filters
  const filteredOrders = orders.filter((o) => {
    const buyerName = o.buyer?.name || "";
    const email = o.buyer?.email || "";
    const orderIdShort = o._id ? o._id.slice(-6).toUpperCase() : "";
    const matchesSearch =
      buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderIdShort.includes(searchQuery.toUpperCase());

    const matchesStatus =
      statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate =
      !dateFilter ||
      new Date(o.createdAt).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats calculation
  const totalOrdersCount = orders.length;
  const completedTodayCount = orders.filter(
    (o) =>
      o.status.toLowerCase() === "delivered" &&
      new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const pendingProcessingCount = orders.filter(
    (o) => o.status.toLowerCase() === "processing"
  ).length;
  const issuesCount = orders.filter(
    (o) => o.status.toLowerCase() === "cancelled"
  ).length;

  return (
    <div className="space-y-8 text-on-surface font-body-md">
      {/* Top Title/Header Row */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display-lg">Order Management</h2>
          <p className="text-sm text-on-surface-variant font-body-md mt-1">Manage and track customer streetwear purchases.</p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search Order ID, customer name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Table Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 flex flex-col items-center justify-center border border-outline-variant/15 shadow-sm">
          <div className="w-16 h-16 bg-secondary-container/20 text-primary rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <p className="text-on-surface font-bold text-base">No orders match your filter criteria.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/10 font-bold">
                <tr>
                  <th className="py-4 px-6 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Total</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Payment</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginatedOrders.map((o) => {
                  const initial = o.buyer?.name ? o.buyer.name.charAt(0).toUpperCase() : "?";
                  return (
                    <tr key={o._id} className="hover:bg-surface-container-low transition-colors duration-150 group">
                      <td className="py-4 px-6 font-bold text-primary">
                        #RB-{o._id ? o._id.slice(-6).toUpperCase() : "ORDER"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container/30 text-on-secondary-container flex items-center justify-center font-bold text-[10px]">
                            {initial}
                          </div>
                          <div>
                            <p className="font-extrabold text-on-surface">{o.buyer?.name || "Anonymous"}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{o.buyer?.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 font-bold text-on-surface text-sm">
                        ₹{o.totalAmount}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-[#7cf994]/20 text-[#006e2d] border border-[#006e2d]/10 px-3 py-1 rounded-full text-[10px] font-bold">
                          {o.payment?.status || "Paid"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative inline-block text-left w-36">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className={`w-full ${getStatusColorClass(
                              o.status
                            )} px-3 py-1.5 rounded-lg font-bold border-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors appearance-none`}
                          >
                            {["Processing", "Packed", "Dispatched", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-surface-container-low border-t border-outline-variant/10 px-6 py-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Showing {paginatedOrders.length} of {filteredOrders.length} orders
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 border border-outline-variant/30 rounded-lg bg-surface-container-lowest text-on-surface disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface px-1.5">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 border border-outline-variant/30 rounded-lg bg-surface-container-lowest text-on-surface disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics Bento Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm border-l-4 border-primary">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Orders Catalog</p>
          <h3 className="text-2xl font-extrabold text-on-surface mt-1.5 font-display-lg">{totalOrdersCount}</h3>
          <p className="text-[#006e2d] text-[10px] font-bold flex items-center mt-2.5">
            +12% from last week
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm border-l-4 border-[#006e2d]">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Completed Today</p>
          <h3 className="text-2xl font-extrabold text-on-surface mt-1.5 font-display-lg">{completedTodayCount}</h3>
          <p className="text-on-surface-variant text-[10px] font-bold flex items-center mt-2.5">
            On track with targets
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm border-l-4 border-secondary-container">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pending Processing</p>
          <h3 className="text-2xl font-extrabold text-on-surface mt-1.5 font-display-lg">{pendingProcessingCount}</h3>
          <p className="text-on-surface-variant text-[10px] font-bold flex items-center mt-2.5">
            Avg: 4h response time
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm border-l-4 border-error">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Returns / Cancelled</p>
          <h3 className="text-2xl font-extrabold text-on-surface mt-1.5 font-display-lg">{issuesCount}</h3>
          <p className="text-error text-[10px] font-bold flex items-center mt-2.5">
            Requires attention
          </p>
        </div>
      </section>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 border border-outline-variant/20 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-on-surface mb-6 border-b border-outline-variant/10 pb-3">
              Order Details #RB-{selectedOrder._id.slice(-6).toUpperCase()}
            </h3>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-on-surface-variant">Customer Info</h4>
                  <p className="font-extrabold text-on-surface mt-1">{selectedOrder.buyer?.name || "N/A"}</p>
                  <p className="text-on-surface-variant mt-0.5">{selectedOrder.buyer?.email || "No email"}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-on-surface-variant">Order Date</h4>
                  <p className="font-extrabold text-on-surface mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-on-surface-variant mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[9px] uppercase tracking-wider text-on-surface-variant mb-3">Order Status</h4>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColorClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface font-semibold focus:outline-none cursor-pointer"
                  >
                    {["Processing", "Packed", "Dispatched", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[9px] uppercase tracking-wider text-on-surface-variant mb-2.5">Items Purchased</h4>
                <div className="space-y-3 bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/10">
                  {selectedOrder.products?.map((item, idx) => {
                    const productObj = item.product || item;
                    const prodName = productObj?.name || item.name || "Unknown Streetwear Product";
                    const prodPrice = productObj?.discountedPrice || productObj?.originalPrice || item.price || 0;
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 overflow-hidden bg-background shrink-0 border border-outline-variant/15 rounded-lg">
                            {productObj?.image || item.image ? (
                              <img 
                                src={productObj?.image || item.image} 
                                alt={prodName} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-container-high">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-on-surface truncate">{prodName}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">Quantity: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="font-bold text-on-surface text-right shrink-0">
                          ₹{(prodPrice * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/10 pt-4">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Amount</span>
                <span className="text-lg font-extrabold text-primary">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
