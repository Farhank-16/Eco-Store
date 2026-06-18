import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import * as api from "../api/index";
import { Image as ImageIcon, Edit2, Sliders, Loader2, Info, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [selectedConfig, setSelectedConfig] = useState(null);
  
  // Form state
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getCollectionConfigs();
      setConfigs(data.configs || []);
    } catch (e) {
      console.error("Failed to load collection configs", e);
      toast.error("Failed to load collection settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setSelectedConfig(null);
    setKey("");
    setName("");
    setSubtitle("");
    setImageUrl("");
    setImageFile(null);
    setPreviewUrl("");
    setError("");
    setModal("add");
  };

  const openEdit = (config) => {
    setSelectedConfig(config);
    setKey(config.key);
    setName(config.name);
    setSubtitle(config.subtitle || "");
    setImageUrl(config.imageUrl);
    setImageFile(null);
    setPreviewUrl(config.imageUrl);
    setError("");
    setModal("edit");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (modal === "add" && !key.trim()) return setError("Key is required");
    if (!name.trim()) return setError("Name is required");
    if (modal === "add" && !imageFile && !imageUrl) return setError("Image is required");
    
    setSubmitLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("subtitle", subtitle);
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("imageUrl", imageUrl);
      }

      if (modal === "add") {
        formData.append("key", key.trim().toLowerCase());
        await api.addCollectionConfig(formData);
        toast.success("Collection created successfully!");
      } else {
        await api.updateCollectionConfig(selectedConfig.key, formData);
        toast.success("Collection settings updated successfully!");
      }
      setModal(null);
      load();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to save configuration");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (keyToDelete) => {
    if (!confirm(`Are you sure you want to delete the collection "${keyToDelete}"?`)) return;
    try {
      await api.deleteCollectionConfig(keyToDelete);
      toast.success("Collection deleted successfully");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display-lg">Collection Settings</h1>
          <p className="text-sm text-on-surface-variant font-body-md mt-1">Manage marketing imagery and details of collections on the homepage</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Collection
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {configs.map((config) => (
            <div 
              key={config.key}
              className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 flex flex-col justify-between group hover:border-primary/30 transition-all duration-350 shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                      {config.subtitle || `COLLECTION: ${config.key}`}
                    </span>
                    <h3 className="text-xl font-extrabold text-on-surface mt-0.5 uppercase tracking-wide">
                      {config.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(config)}
                      className="p-2.5 rounded-full bg-surface-container hover:bg-primary hover:text-white text-on-surface-variant transition-all cursor-pointer"
                      title="Edit Collection"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.key)}
                      className="p-2.5 rounded-full bg-surface-container hover:bg-red-650 hover:text-white text-on-surface-variant transition-all cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Preview */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black/40 border border-outline-variant/10 group mb-4">
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors z-10" />
                  <img 
                    src={config.imageUrl} 
                    alt={config.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="text-[8px] font-bold text-primary tracking-widest uppercase">{config.subtitle}</span>
                    <h4 className="text-md font-bold tracking-wider text-white uppercase">{config.name}</h4>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/5 text-xs text-on-surface-variant">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold uppercase tracking-wider">Key: {config.key}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === "add" ? "Create New Collection" : `Edit ${selectedConfig?.name} settings`} onClose={() => setModal(null)}>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {modal === "add" && (
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Collection Key (Lowercase Slug)</label>
                <input
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  placeholder="e.g. limited"
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Collection Title</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MIDNIGHT CHAOS"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold uppercase"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Collection Subtitle</label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. COLLECTION 01"
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold uppercase"
              />
            </div>

            {/* Image Upload/URL area */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-2">Collection Banner Image</label>
              
              {previewUrl && (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container mb-4">
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div className="relative border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <ImageIcon className="w-8 h-8 text-outline mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-on-surface">Click to upload new banner file</span>
                  <span className="text-[9px] text-on-surface-variant mt-1">Saves to Cloudinary storage</span>
                </div>

                <div className="text-center text-[10px] font-bold text-on-surface-variant my-1">- OR -</div>

                <div>
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1">Paste Image URL</label>
                  <input
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageFile(null);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-1">
                <Info className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 bg-surface border border-outline-variant/30 text-on-surface-variant font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-75 flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm shadow-primary/10"
              >
                {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {submitLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
