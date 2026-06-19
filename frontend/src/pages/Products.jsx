import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import * as api from "../api/index.js";
import { Package, Plus, Edit2, Trash2, Tag, Loader2, Image as ImageIcon, Search, Check, AlertTriangle, ArrowUpDown, X } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = {
  name: "",
  originalPrice: "",
  discountedPrice: "",
  images: [],
  description: "",
  category: "",
  collectionType: "none",
  gender: "unisex",
  rebelProfile: "",
  specifications: [],
  stock: 10,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [bulkJson, setBulkJson] = useState("");
  const [bulkErrors, setBulkErrors] = useState([]);

  const load = async () => {
    try {
      const [pd, cd, colld] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCollectionConfigs().catch(() => ({ configs: [] })),
      ]);
      setProducts(pd.products || []);
      setCategories(cd.categories || []);
      setCollections(colld.configs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm({ ...EMPTY, images: [] });
    setError("");
    setModal("add");
  };

  const openEdit = (p) => {
    setSelected(p);
    const initialImages = p.images && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);

    setForm({
      name: p.name,
      originalPrice: p.price || p.originalPrice,
      discountedPrice: p.discountedPrice || "",
      images: initialImages.map((url) => ({ id: Math.random().toString(), file: null, url })),
      description: p.description || "",
      category: p.category?._id || "",
      collectionType: p.collectionType || "none",
      gender: p.gender || "unisex",
      rebelProfile: p.rebelProfile || "",
      specifications: p.specifications || [],
      stock: p.stock !== undefined ? p.stock : 10,
    });
    setError("");
    setModal("edit");
  };

  const closeModal = () => {
    form.images.forEach((img) => {
      if (img.file) URL.revokeObjectURL(img.url);
    });
    setModal(null);
    setSelected(null);
    setBulkJson("");
    setBulkErrors([]);
  };

  const openBulkAdd = () => {
    setBulkJson("");
    setBulkErrors([]);
    setError("");
    setModal("bulk");
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setBulkJson(JSON.stringify(parsed, null, 2));
        setBulkErrors([]);
        setError("");
        toast.success("JSON file loaded successfully!");
      } catch (err) {
        toast.error("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    try {
      setBulkErrors([]);
      setError("");
      
      let parsed = null;
      try {
        parsed = JSON.parse(bulkJson);
      } catch (err) {
        return setError("Invalid JSON syntax. Please verify commas and braces.");
      }

      if (!Array.isArray(parsed)) {
        return setError("JSON must be a valid array of product objects.");
      }

      setLoading(true);
      const res = await api.addBulkProducts(parsed);
      toast.success(res.message || "Bulk products imported successfully!");
      
      await load();
      closeModal();
    } catch (e) {
      if (e.response?.data?.errors) {
        setBulkErrors(e.response.data.errors);
      } else {
        setError(e.response?.data?.message || e.message || "Something went wrong during import");
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      id: Math.random().toString(),
      file,
      url: URL.createObjectURL(file),
    }));

    set("images", [...form.images, ...newImages]);
  };

  const removeImage = (id) => {
    const imgToRemove = form.images.find((img) => img.id === id);
    if (imgToRemove && imgToRemove.file) {
      URL.revokeObjectURL(imgToRemove.url);
    }
    set("images", form.images.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.originalPrice || !form.category) {
      return setError("Name, price and category are required");
    }
    if (modal === "add" && form.images.length === 0) {
      return setError("At least one product image is required");
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
      formData.append("collectionType", form.collectionType || "none");
      formData.append("gender", form.gender || "unisex");
      formData.append("rebelProfile", form.rebelProfile || "");
      formData.append("specifications", JSON.stringify(form.specifications || []));
      formData.append("stock", Number(form.stock) !== undefined ? Number(form.stock) : 0);

      const existingUrls = [];
      form.images.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file);
        } else {
          existingUrls.push(img.url);
        }
      });

      formData.append("existingImages", JSON.stringify(existingUrls));

      if (modal === "add") {
        await api.addProduct(formData);
        toast.success("Product added successfully");
      } else {
        await api.updateProduct(selected._id, formData);
        toast.success("Product updated successfully");
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
      toast.success("Product deleted successfully");
      await load();
    } catch (e) {
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategoryFilter === "all") return matchesSearch;
    return matchesSearch && p.category?._id === selectedCategoryFilter;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Row */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display-lg">Products</h2>
          <p className="text-sm text-on-surface-variant font-body-md mt-1">Manage and monitor your store inventory.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
            />
          </div>

          <button
            onClick={openAdd}
            className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>

          <button
            onClick={openBulkAdd}
            className="w-full sm:w-auto bg-surface border border-outline-variant/30 hover:bg-surface-container-high text-on-surface px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Package className="w-4 h-4 text-primary" /> Bulk Import
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-on-surface-variant mr-2 whitespace-nowrap">Category:</span>
        <button 
          onClick={() => setSelectedCategoryFilter("all")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedCategoryFilter === "all"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button 
            key={cat._id}
            onClick={() => setSelectedCategoryFilter(cat._id)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategoryFilter === cat._id
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Data Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 flex flex-col items-center justify-center border border-outline-variant/15 shadow-sm">
          <div className="w-16 h-16 bg-secondary-container/20 text-primary rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <p className="text-on-surface font-bold text-base">
            No products found {searchQuery ? `matching "${searchQuery}"` : ""}
          </p>
          <button onClick={openAdd} className="mt-4 text-primary font-bold hover:underline text-sm cursor-pointer">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/10 font-bold">
                <tr>
                  <th className="py-4 px-6 uppercase tracking-wider">Image</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Product Name</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Price</th>
                  <th className="py-4 px-6 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredProducts.map((p) => {
                  const productImg = p.image || (p.images && p.images[0]);
                  return (
                    <tr key={p._id} className="hover:bg-surface-container-low transition-colors duration-150">
                      <td className="py-4 px-6">
                        {productImg ? (
                          <img src={productImg} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-surface-container border border-outline-variant/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-outline">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-on-surface line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono mt-0.5">SKU: REB-{p._id ? p._id.slice(-6).toUpperCase() : "STOCK"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {p.category?.name || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {p.discountedPrice && p.discountedPrice < p.originalPrice ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-on-surface text-sm">₹{p.discountedPrice}</span>
                            <span className="text-outline line-through text-[10px]">₹{p.originalPrice}</span>
                          </div>
                        ) : (
                          <span className="text-on-surface text-sm font-bold">₹{p.originalPrice}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {p.stock > 0 ? (
                          <div className="bg-[#7cf994]/20 text-[#006e2d] border border-[#006e2d]/10 px-3 py-1 rounded-full text-[9px] uppercase font-bold text-center inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> {p.stock} In Stock
                          </div>
                        ) : (
                          <div className="bg-red-500/15 text-red-500 border border-red-500/10 px-3 py-1 rounded-full text-[9px] uppercase font-bold text-center inline-flex items-center gap-1">
                            <X className="w-3 h-3" /> Out of Stock
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          <button 
                            onClick={() => openEdit(p)} 
                            className="text-on-surface-variant hover:text-primary font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)} 
                            className="text-red-500 hover:text-red-750 p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Showing {filteredProducts.length} of {products.length} Products
            </span>
          </div>
        </div>
      )}

      {/* Modal Overlay for Add/Edit Product */}
      {modal && modal !== "bulk" && (
        <Modal title={modal === "add" ? "Add New Product" : "Edit Product"} onClose={closeModal}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Product Name</label>
              <input 
                value={form.name} 
                onChange={(e) => set("name", e.target.value)} 
                placeholder="e.g. Heavyweight Baggy Hoodie" 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Original Price (₹)</label>
                <input 
                  type="number" 
                  value={form.originalPrice} 
                  onChange={(e) => set("originalPrice", e.target.value)} 
                  placeholder="0.00" 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Discounted Price (₹)</label>
                <input 
                  type="number" 
                  value={form.discountedPrice} 
                  onChange={(e) => set("discountedPrice", e.target.value)} 
                  placeholder="0.00 (Optional)" 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold" 
                />
              </div>
            </div>

            {/* Images Uploader Section */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-2">Product Images</label>
              
              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {form.images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container shadow-sm group">
                      <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-650 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-xs font-bold"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group overflow-hidden">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImages}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <ImageIcon className="w-8 h-8 text-outline mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-on-surface">Click or drag images here</span>
                <span className="text-[9px] text-on-surface-variant mt-1">Upload one or multiple images</span>
              </div>

              <div className="mt-3">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Add Image by URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="imageUrlInput"
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("imageUrlInput");
                      const url = input?.value?.trim();
                      if (url) {
                        set("images", [...(form.images || []), { id: Math.random().toString(), file: null, url }]);
                        input.value = "";
                        toast.success("Image URL added!");
                      } else {
                        toast.error("Please enter a valid URL");
                      }
                    }}
                    className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-sm shadow-primary/10"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Category</label>
                <select 
                  value={form.category} 
                  onChange={(e) => set("category", e.target.value)} 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold cursor-pointer appearance-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Stock Count</label>
                <input 
                  type="number"
                  min="0"
                  value={form.stock} 
                  onChange={(e) => set("stock", e.target.value)} 
                  placeholder="0" 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Collection</label>
                <select 
                  value={form.collectionType} 
                  onChange={(e) => set("collectionType", e.target.value)} 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold cursor-pointer"
                >
                  <option value="none">None</option>
                  {collections.map((c) => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Target Gender</label>
                <select 
                  value={form.gender} 
                  onChange={(e) => set("gender", e.target.value)} 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold cursor-pointer"
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => set("description", e.target.value)} 
                rows={4} 
                placeholder="Write a brief product description..." 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold resize-none" 
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Rebel Profile</label>
              <textarea 
                value={form.rebelProfile} 
                onChange={(e) => set("rebelProfile", e.target.value)} 
                rows={3} 
                placeholder="Describe the aesthetic/streetwear narrative for this garment..." 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold resize-none" 
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Piece Specifications</label>
              
              <div className="space-y-2">
                {form.specifications && form.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      value={spec.title} 
                      onChange={(e) => {
                        const newSpecs = [...form.specifications];
                        newSpecs[index].title = e.target.value;
                        set("specifications", newSpecs);
                      }} 
                      placeholder="Title (e.g. 450 GSM COTTON)" 
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold" 
                    />
                    <input 
                      value={spec.value} 
                      onChange={(e) => {
                        const newSpecs = [...form.specifications];
                        newSpecs[index].value = e.target.value;
                        set("specifications", newSpecs);
                      }} 
                      placeholder="Detail (e.g. Heavy, high-drape cotton)" 
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold" 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newSpecs = form.specifications.filter((_, i) => i !== index);
                        set("specifications", newSpecs);
                      }}
                      className="text-red-500 hover:text-red-750 p-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={() => {
                  set("specifications", [...(form.specifications || []), { title: "", value: "" }]);
                }}
                className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Specification
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-6">
              <button 
                onClick={closeModal} 
                className="flex-1 bg-surface border border-outline-variant/30 text-on-surface-variant font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-75 flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm shadow-primary/10"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "bulk" && (
        <Modal title="Bulk Import Products" onClose={closeModal}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">
                Upload JSON File
              </label>
              <input 
                type="file"
                accept=".json"
                onChange={handleBulkFileChange}
                className="w-full text-xs text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-container cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block">
                  Paste JSON Array
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const sample = [
                      {
                        name: "Premium Oversized Streetwear Hoodie",
                        originalPrice: 2999,
                        discountedPrice: 2499,
                        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
                        description: "Heavyweight drop tailored for comfortable everyday wear.",
                        category: "Hoodies",
                        collectionType: "none",
                        gender: "unisex",
                        rebelProfile: "Dark and sleek silhouette.",
                        specifications: [
                          { title: "Fabric", value: "450 GSM French Terry Cotton" }
                        ],
                        stock: 25
                      }
                    ];
                    setBulkJson(JSON.stringify(sample, null, 2));
                  }}
                  className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider cursor-pointer"
                >
                  Load Sample Template
                </button>
              </div>
              <textarea 
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                rows={10}
                placeholder='[ { "name": "...", "originalPrice": 2999, ... } ]'
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>

            {bulkErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold space-y-1">
                <p className="font-bold flex items-center gap-1 mb-1 text-red-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Import Errors:
                </p>
                <ul className="list-disc pl-4 space-y-1 max-h-[120px] overflow-y-auto">
                  {bulkErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-6">
              <button 
                onClick={closeModal} 
                className="flex-1 bg-surface border border-outline-variant/30 text-on-surface-variant font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkSubmit} 
                disabled={loading || !bulkJson} 
                className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-75 flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm shadow-primary/10"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Importing..." : "Import Products"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}