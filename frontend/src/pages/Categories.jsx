import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import * as api from "../api/index";
import { Plus, Edit2, Trash2, Tags, Loader2, FolderHeart, Info, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null); // "add" | "edit"
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setName(""); setError(""); setModal("add"); };
  const openEdit = (cat) => { setSelected(cat); setName(cat.name); setError(""); setModal("edit"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Name is required");
    setLoading(true);
    try {
      if (modal === "add") await api.addCategory({ name });
      else await api.updateCategory(selected._id, { name });
      await load();
      closeModal();
      toast.success("Category saved successfully!");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.deleteCategory(id);
      await load();
      toast.success("Category deleted successfully");
    } catch (e) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display-lg">Categories</h1>
          <p className="text-sm text-on-surface-variant font-body-md mt-1">Organize your products effectively</p>
        </div>

        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Stats Summary (Asymmetric Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container-low rounded-3xl p-6 sm:p-8 flex items-end justify-between overflow-hidden relative group border border-outline-variant/10 shadow-sm">
          <div className="z-10">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Overview</span>
            <h3 className="text-xl sm:text-2xl font-extrabold mt-1 text-on-surface font-display-lg">Product Distribution</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mt-3 leading-relaxed">
              Our catalog is categorized into the premium street garments and accessories drops.
            </p>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
            <Tags className="w-32 h-32 text-primary" />
          </div>
        </div>

        <div className="bg-secondary-container text-on-secondary-container rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-secondary-container/20 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Active Categories</span>
            <h3 className="text-4xl sm:text-5xl font-extrabold mt-2 leading-none font-display-lg">{categories.length}</h3>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[10px] font-bold uppercase tracking-wider opacity-85">
            <ArrowUpRight className="w-4 h-4" /> Live Catalog Categories
          </div>
        </div>
      </section>

      {/* Grid List */}
      {categories.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 flex flex-col items-center justify-center border border-outline-variant/15 shadow-sm">
          <div className="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mb-4">
            <Tags className="w-8 h-8" />
          </div>
          <p className="text-on-surface font-bold text-base">No categories found</p>
          <button onClick={openAdd} className="mt-4 text-primary font-bold hover:underline text-sm cursor-pointer">Create your first category</button>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat._id} 
              className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/15 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between min-h-[180px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-secondary-container/20 rounded-2xl flex items-center justify-center text-primary">
                  <Tags className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEdit(cat)}
                    className="p-2 hover:bg-surface-container rounded-lg text-outline hover:text-primary transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-outline hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-extrabold text-lg text-on-surface line-clamp-1">{cat.name}</h4>
                <p className="text-[10px] text-on-surface-variant font-mono tracking-wider mt-1">/{cat.slug}</p>
              </div>
            </div>
          ))}

          {/* Add Category Card Trigger */}
          <button 
            onClick={openAdd}
            className="border-2 border-dashed border-outline-variant/40 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary transition-all duration-300 group cursor-pointer min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant">Add New Category</span>
          </button>
        </section>
      )}

      {/* Modal Dialog */}
      {modal && (
        <Modal title={modal === "add" ? "Create New Category" : "Edit Category"} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                Category Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Hoodies, Tees, Cargo..."
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
              />
              {error && <p className="text-red-550 text-xs mt-2 font-medium flex items-center gap-1"><Info className="w-3.5 h-3.5 shrink-0" /> {error}</p>}
            </div>
            <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-6">
              <button 
                onClick={closeModal} 
                className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container disabled:opacity-70 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-primary/10"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}