import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import * as api from "../api/index";
import { Plus, Edit2, Trash2, Tags, Loader2 } from "lucide-react";

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
    } catch (e) {
      alert("Failed to delete category");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1">Organize your products effectively</p>
        </div>

        <button
          onClick={openAdd}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Tags className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No categories found</p>
          <button onClick={openAdd} className="mt-4 text-indigo-600 font-medium hover:underline">Create your first category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Tags className="w-6 h-6 text-indigo-600" />
              </div>
              
              <h3 className="font-bold text-slate-800 text-xl mb-1">{cat.name}</h3>
              <p className="text-slate-400 font-mono text-xs mb-6">/{cat.slug}</p>
              
              <div className="mt-auto flex gap-2">
                <button 
                  onClick={() => openEdit(cat)} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(cat._id)} 
                  className="flex-none flex items-center justify-center w-10 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "Create New Category" : "Edit Category"} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Category Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Electronics, Clothing..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
              {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
              <button 
                onClick={closeModal} 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}