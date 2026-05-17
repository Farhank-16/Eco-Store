import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import * as api from "../api/index.js";
import { Package, Plus, Edit2, Trash2, Tag, Loader2, Image as ImageIcon, Search } from "lucide-react";
import axios from "axios"; // Using axios directly for admin API to attach token if needed, or api/index.js if it handles it. 

const EMPTY = {
  name: "",
  originalPrice: "",
  discountedPrice: "",
  image: null,
  description: "",
  category: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Use the auth state to get token if your api file doesn't intercept it
  // Assuming api/index.js handles the cookies appropriately since verifyToken uses req.cookies

  const load = async () => {
    try {
      const [pd, cd] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(pd.products || []);
      setCategories(cd.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(EMPTY);
    setPreview("");
    setError("");
    setModal("add");
  };

  const openEdit = (p) => {
    setSelected(p);
    setForm({
      name: p.name,
      originalPrice: p.price || p.originalPrice, // Fallback if API uses 'price' instead of 'originalPrice'
      discountedPrice: p.discountedPrice || "",
      image: null,
      description: p.description || "",
      category: p.category?._id || "",
    });
    setPreview(p.image);
    setError("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setPreview("");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.originalPrice || !form.category) {
      return setError("Name, price and category are required");
    }
    if (modal === "add" && !form.image) {
      return setError("Product image is required");
    }
    if (Number(form.discountedPrice) > Number(form.originalPrice)) {
      return setError("Discount price cannot be greater than original price");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("originalPrice", Number(form.originalPrice));
      formData.append("discountedPrice", Number(form.discountedPrice) || 0);
      formData.append("description", form.description);
      formData.append("category", form.category);
      if (form.image) formData.append("image", form.image);

      if (modal === "add") {
        await api.addProduct(formData);
      } else {
        await api.updateProduct(selected._id, formData);
      }

      await load();
      closeModal();
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      await load();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm";
  const labelCls = "text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2";

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    (p.category?.name && p.category.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Products</h1>
          <p className="text-slate-500 mt-1">Manage your store inventory</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          
          <button
            onClick={openAdd}
            className="bg-indigo-600 shrink-0 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No products found {debouncedSearch ? `matching "${debouncedSearch}"` : ''}</p>
          <button onClick={openAdd} className="mt-4 text-indigo-600 font-medium hover:underline">Add your first product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div key={p._id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
              <div className="relative aspect-video bg-slate-50 border-b border-slate-100">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                  <Tag className="w-3 h-3 text-indigo-500" />
                  {p.category?.name || "Uncategorized"}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{p.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{p.description || "No description provided."}</p>
                
                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-col">
                    {p.discountedPrice && p.discountedPrice < p.originalPrice ? (
                      <div className="flex items-end gap-2">
                        <span className="font-bold text-lg text-slate-900">₹{p.discountedPrice}</span>
                        <span className="text-sm text-slate-400 line-through">₹{p.originalPrice}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-lg text-slate-900">₹{p.originalPrice}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-medium text-sm transition-colors border border-slate-200">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium text-sm transition-colors border border-red-100">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "Add New Product" : "Edit Product"} onClose={closeModal}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
            <div>
              <label className={labelCls}>Product Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Wireless Headphones" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Original Price (₹)</label>
                <input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Discounted Price (₹)</label>
                <input type="number" value={form.discountedPrice} onChange={(e) => set("discountedPrice", e.target.value)} placeholder="0.00 (Optional)" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Product Image</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group overflow-hidden">
                <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {preview ? (
                  <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                )}
                <span className="text-sm font-medium text-slate-600 relative z-0">{preview ? 'Click to change image' : 'Click or drag image here'}</span>
              </div>
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={`${inputCls} cursor-pointer appearance-none`}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Write a brief description..." className={`${inputCls} resize-none`} />
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center">{error}</div>}

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}