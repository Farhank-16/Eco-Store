import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  Flame,
  Camera
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, login } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("PLEASE LOGIN");
      navigate("/login");
    }
  }, [user, navigate]);

  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("PLEASE SELECT AN IMAGE FILE");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setImageUploading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/auth/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      login(res.data.user);
      toast.success("PROFILE PHOTO UPDATED");
    } catch (err) {
      toast.error(err.response?.data?.message || "FAILED TO UPLOAD IMAGE");
    } finally {
      setImageUploading(false);
    }
  };

  // Password Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sync form states with user store updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("NAME AND EMAIL REQUIRED");
      return;
    }
    setProfileLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/auth/profile`,
        { name: profileForm.name, email: profileForm.email },
        { withCredentials: true }
      );
      login(res.data.user);
      toast.success("PROFILE UPDATED");
    } catch (err) {
      toast.error(err.response?.data?.message || "FAILED TO UPDATE PROFILE");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("ALL FIELDS REQUIRED");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("PASSWORDS DO NOT MATCH");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/auth/profile`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(res.data.message || "PASSWORD UPDATED");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "FAILED TO UPDATE PASSWORD");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  // Format member date
  const memberDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "June 2026";

  return (
    <div className="bg-background min-h-screen text-on-background pt-20 pb-24">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        
        {/* Profile Banner Card */}
        <div className="bg-surface border border-outline/10 p-6 sm:p-10 relative overflow-hidden mb-12">
          {/* Rebel subtle red gradient overlay */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image Avatar with Upload Hover */}
            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-none bg-background border border-outline/20 flex items-center justify-center shrink-0 select-none overflow-hidden">
              {imageUploading ? (
                <div className="absolute inset-0 bg-background/85 flex items-center justify-center z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : null}
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "RB"}
                </div>
              )}
              {/* Upload Overlay */}
              <label 
                htmlFor="avatar-file-input" 
                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200"
              >
                <Camera className="w-5 h-5 text-white mb-1.5" />
                <span className="text-[9px] font-extrabold text-white uppercase tracking-widest text-center px-2">
                  UPLOAD
                </span>
                <input 
                  type="file" 
                  id="avatar-file-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                />
              </label>
            </div>
            
            <div className="text-center md:text-left space-y-2 flex-grow">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-on-surface">{user.name}</h1>
                <span className="bg-primary/25 border border-primary/45 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-primary">
                  {user.role === "admin" ? "ADMINISTRATOR" : "VERIFIED COLLECTOR"}
                </span>
              </div>
              <p className="text-on-surface-variant text-xs flex items-center justify-center md:justify-start gap-2 uppercase tracking-wider font-bold">
                <Mail className="w-4 h-4 text-primary" /> {user.email}
              </p>
              <p className="text-on-surface-variant text-xs flex items-center justify-center md:justify-start gap-2 uppercase tracking-wider font-bold">
                <Calendar className="w-4 h-4 text-primary" /> MEMBER SINCE {memberDate.toUpperCase()}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              <button 
                onClick={() => navigate("/my-orders")}
                className="bg-primary hover:bg-primary-container text-white px-8 py-3.5 font-display text-xs tracking-widest uppercase transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                MY ORDERS <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Details and Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sub Navigation */}
          <div className="lg:col-span-1 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveSubTab("details")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left border cursor-pointer ${
                activeSubTab === "details"
                  ? "bg-primary text-white border-primary"
                  : "bg-surface border-outline/10 text-on-surface-variant hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              EDIT PROFILE
            </button>

            <button
              onClick={() => setActiveSubTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left border cursor-pointer ${
                activeSubTab === "security"
                  ? "bg-primary text-white border-primary"
                  : "bg-surface border-outline/10 text-on-surface-variant hover:text-white"
              }`}
            >
              <Lock className="w-4 h-4" />
              PASSWORD & SECURITY
            </button>
          </div>

          {/* Main SubTab Content Card */}
          <div className="lg:col-span-3 bg-surface border border-outline/10 p-6 sm:p-10 min-h-[380px]">
            
                       {/* Edit Profile Form */}
            {activeSubTab === "details" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl tracking-widest text-on-surface uppercase">ACCOUNT PROFILE</h2>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">Update basic account identification credentials.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-on-surface-variant block uppercase tracking-widest">FULL NAME</label>
                    <input 
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-background border border-outline/25 text-on-surface focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                      placeholder="JANE DOE"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-on-surface-variant block uppercase tracking-widest">EMAIL ADDRESS</label>
                    <input 
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-background border border-outline/25 text-on-surface focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                      placeholder="JANE@REBEL.CO"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-primary hover:bg-primary-container text-white px-8 py-3.5 font-display text-xs tracking-widest uppercase transition-colors cursor-pointer mt-4"
                  >
                    {profileLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "SAVE DETAILS"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Change Password Form */}
            {activeSubTab === "security" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl tracking-widest text-on-surface uppercase flex items-center gap-2">
                    PASSWORD & SECURITY <ShieldAlert className="w-6 h-6 text-primary" />
                  </h2>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">Update login validation passwords regularly.</p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-on-surface-variant block uppercase tracking-widest">CURRENT PASSWORD</label>
                    <input 
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-background border border-outline/25 text-on-surface focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-on-surface-variant block uppercase tracking-widest">NEW PASSWORD</label>
                    <input 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-background border border-outline/25 text-on-surface focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-on-surface-variant block uppercase tracking-widest">CONFIRM NEW PASSWORD</label>
                    <input 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-background border border-outline/25 text-on-surface focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-primary hover:bg-primary-container text-white px-8 py-3.5 font-display text-xs tracking-widest uppercase transition-colors cursor-pointer mt-4"
                  >
                    {passwordLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "CHANGE PASSWORD"
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
