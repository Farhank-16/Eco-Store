import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Loader2, Eye, EyeOff, Flame } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true },
      );
      login(res.data.user);
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-surface text-on-surface">
      {/* Left Side: Visual/Branding */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Rebel Streetwear" 
            className="w-full h-full object-cover opacity-75" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwChnc5XlcnVPeS6axat2-VWCHI0n351o7UdT5XXMNAwR3rDSLJPfQ3iWIZrcQ5xNM8gVwhf14uqck1YPG0epq01h4SNWE7hYJEutsYn1m9BoppTQAcz537gE0BhcMIIKFASS4i-j0oAGsBcyyddEK4cdTOFlYc6n0mpgQrbI5UtkAGPgXJmvrFgcoNsMUOM1B7i3gKPUbQHpDCmmMtq9PpM-PcxL25_L1zK9waB3cJoGyIkrt2gKRwbPtB8EFTkBJo6Xn4IfPTG0"
          />
        </div>
        
        {/* Branding Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white bg-gradient-to-t from-black/40 via-transparent to-black/20">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-secondary-fixed fill-current" />
            <h1 className="text-2xl font-bold tracking-tight">Rebel</h1>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold mb-4 leading-tight font-display-lg">
              BREAK THE RULES.
            </h2>
            <p className="text-base text-white/90 font-body-lg">
              Join the underground movement. Streetwear for the ones who never follow.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-3">
              <img 
                alt="User" 
                className="w-9 h-9 rounded-full border-2 border-white object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYob7bAqIPeIBWP43Da3midbJZk3K0bVKJVWASUVFdFCzeurI-vTDPd6m5BInED3lvDwAVEVkN04epms9Z2p1Z5438OG4_iuZmMoB0kSEXWo7LGCqAR_RoA6przOU-ENmvewj-XpLxs2Q8W77-Gq-8vakoL0MR7Nv00NI73qJ0aWQkhdfS-RpZIWaQY54l5uUPwnrRZ1dIkymyWmQlfa_z5jkFdqrShJnbTpSY4qXw9OK5TsJVIJyabMLuQ_0Ca43qMU-TIZ3JvY8"
              />
              <img 
                alt="User" 
                className="w-9 h-9 rounded-full border-2 border-white object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwyjJIn6e3xC8RFgYOq-zcnA-BsXcPNBQ2Kpe_FOWdxewlKTJQP7s_zXnUqtDxF_inwSCuAzPJ0I8tCEmP8NgX8bV9yqI1ItobpLJw_qEP0UEcRc0BNRjXyC5-pTrQ3Z8im6Ct3Wzy_MXAHCU2gOJZa2ZKJK5vnt5Ek5oTdKkWGJuvTaDX2da3U952T3PeNwXuKwFHPoF0SCUcqGp6LCUU205YXEC8ruKJjkFhAO0qSXMv79h9PeolmFEYrAAb76OQXVSxvZxa0tI"
              />
              <div className="w-9 h-9 rounded-full border-2 border-white bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">
                +12k
              </div>
            </div>
            <span className="text-xs text-white/80">Rebels joined this month</span>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 bg-surface relative">
        <div className="w-full max-w-[420px] py-12">
          <header className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-on-surface mb-2 font-display-lg">Welcome back</h2>
            <p className="text-sm text-on-surface-variant font-body-md">Please enter your details to sign in.</p>
          </header>

          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-xl mb-6 text-xs text-center border border-error/10 font-medium">
              {error}
            </div>
          )}

          {/* Social Logins */}
          {/* <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition-all duration-200 active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button 
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition-all duration-200 active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.33 16.92 3.65 10.87 6.1 8.35c1.23-1.28 2.58-1.4 3.52-1.34 1 .06 1.7.38 2.25.4.55.02 1.5-.4 2.7-.35 1.25.06 2.3.45 3 1.48-2.6 1.44-2.15 4.88.58 6-1 2.38-2.3 4.2-3.4 5.34l.3-.6zM12.03 7.25c-.02-2.45 2-4.5 4.34-4.5.15 2.65-2.23 4.63-4.34 4.5z"></path>
              </svg>
              Apple
            </button>
          </div> */}

          {/* Divider */}
          {/* <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            <span className="text-[10px] font-bold text-on-surface-variant/50 tracking-wider">OR SIGN IN WITH EMAIL</span>
            <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
          </div> */}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hq@rebel.co" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Password</label>
                <a className="text-xs font-bold text-primary hover:underline transition-all" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-11 pr-12 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary cursor-pointer" 
              />
              <label className="text-xs font-semibold text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Rebel"}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                Create account
              </Link>
            </p>
          </footer>
        </div>

        {/* Legal Links */}
        <div className="absolute bottom-6 flex gap-4 text-xs font-medium text-on-surface-variant/40">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
        </div>
      </section>
    </div>
  );
}
