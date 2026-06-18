import { useState, useEffect } from "react";
import { getCoupons, addCoupon, deleteCoupon, updateCoupon } from "../api";
import { Plus, Trash2, Ticket, Check, X, Loader2, Calendar, TrendingUp, HelpCircle, ArrowUpRight, Percent, Award, AlertTriangle, Search, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minCartAmount, setMinCartAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data.coupons || []);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinCartAmount("");
    setExpiryDate("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinCartAmount(coupon.minCartAmount);
    setExpiryDate(coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "");
    setIsActive(coupon.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) return toast.error("Please fill all required fields");
    setSubmitting(true);

    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minCartAmount: Number(minCartAmount) || 0,
      expiryDate: expiryDate || undefined,
      isActive,
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await addCoupon(payload);
        toast.success("Coupon created successfully!");
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await updateCoupon(coupon._id, { ...coupon, isActive: !coupon.isActive });
      toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Title */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display-lg">Coupon Management</h2>
          <p className="text-sm text-on-surface-variant font-body-md mt-1">Manage and monitor Rebel drop coupon discounts.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </header>

      {/* Bento Grid Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Coupons</span>
            <Ticket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface font-display-lg mt-2">
              {coupons.filter(c => c.isActive).length}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Currently live on store</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Incentive Type</span>
            <Percent className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface font-display-lg mt-2">
              {coupons.filter(c => c.discountType === 'percentage').length}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Percentage rate discount codes</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Flat Savings</span>
            <Award className="w-5 h-5 text-primary-container" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface font-display-lg mt-2">
              {coupons.filter(c => c.discountType === 'flat').length}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Fixed rupee value deduction codes</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Inactive</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface font-display-lg mt-2">
              {coupons.filter(c => !c.isActive).length}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Temporarily disabled codes</p>
          </div>
        </div>
      </section>


      {/* Coupons Table / List */}
      {coupons.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/15 shadow-sm flex flex-col items-center">
          <Ticket className="w-12 h-12 text-outline mb-4" />
          <h3 className="text-base font-extrabold text-on-surface">No coupons found</h3>
          <p className="text-xs text-on-surface-variant mt-1 mb-6">Create promotional vouchers to boost Rebel drop conversion rates.</p>
          <button 
            onClick={openAddModal}
            className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-full transition-all cursor-pointer"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-on-surface">Active Vouchers</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input 
                type="text" 
                placeholder="Search codes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/10">
                  <th className="px-6 py-4 uppercase tracking-wider">Coupon Code</th>
                  <th className="px-6 py-4 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 uppercase tracking-wider">Min. Cart</th>
                  <th className="px-6 py-4 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-4 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-surface-container-low transition-colors duration-150">
                    <td className="px-6 py-4 font-extrabold text-primary flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary shrink-0" />
                      <span>{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% Off`
                        : `₹${coupon.discountValue} Off`}
                    </td>
                    <td className="px-6 py-4 font-medium text-on-surface-variant">
                      ₹{coupon.minCartAmount || 0}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-medium">
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : "No Expiration"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                          coupon.isActive
                            ? "bg-[#7cf994]/20 text-[#006e2d]"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="text-on-surface-variant hover:text-primary font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-500 hover:text-red-750 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupon Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 max-w-md w-full p-6 relative shadow-lg">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-extrabold text-primary mb-6 font-display-lg">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. REBEL20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Discount Value</label>
                  <input
                    type="number"
                    placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 150"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Min. Order (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={minCartAmount}
                    onChange={(e) => setMinCartAmount(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-outline-variant/30 text-primary focus:ring-primary cursor-pointer w-4 h-4 bg-surface-container-lowest"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-on-surface-variant cursor-pointer select-none">
                  Activate Coupon Immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-surface border border-outline-variant/30 text-on-surface-variant font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-75 flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm shadow-primary/10"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
