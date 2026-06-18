import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, Check, Flame, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Password strength checker states
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("Security Level: Minimal");
  const [strengthColor, setStrengthColor] = useState("text-on-surface-variant bg-outline-variant/30");

  const checkPasswordStrength = (pass) => {
    setPassword(pass);
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    
    setStrength(score);
    if (score <= 25) {
      setStrengthText("Security Level: Low");
      setStrengthColor("text-red-500 bg-red-500");
    } else if (score <= 50) {
      setStrengthText("Security Level: Moderate");
      setStrengthColor("text-amber-500 bg-amber-500");
    } else if (score <= 75) {
      setStrengthText("Security Level: Strong");
      setStrengthColor("text-primary-container bg-primary-container");
    } else {
      setStrengthText("Security Level: Optimal");
      setStrengthColor("text-secondary bg-secondary");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-surface text-on-surface">
      {/* Left Side: Atmospheric Brand Section */}
      <section className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
          <img 
            className="w-full h-full object-cover opacity-75" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu071ev_CBvhYNRmwcckTJG5o6fmeSOGbhgk25VHEgLAXeaEaOIvUjfMnELCJFoHRGfME7-6kXgYL7iAgl0gJBU5OGOngBbpwfG9ivjBwgNwc2ALT1SB5m--EQodWKDxF7n3m5PH6KUCDsR8uh5Uxfw7QM0JkixAz98fBLuDp-qLQmoEStSI_Fr9inJpGrW74fKSGG8awV8X10ks33Jtt6AZ51cAvlraAFPIZEEHscOGWfcNCedL3xnxe6cURkgevJMUdgZAIb_KI"
            alt="Rebel Brand Atmospheric"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/80"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-primary-fixed fill-current" />
            <h1 className="text-2xl font-bold text-primary-fixed tracking-tight">Rebel</h1>
          </div>
        </div>

        <div className="relative z-10 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Join the Movement</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6 max-w-lg leading-tight font-display-lg">
            Streetwear for the ones who never follow.
          </h2>
          <div className="space-y-4 max-w-md text-sm text-white/80">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-secondary-fixed shrink-0" />
              <p>Exclusive drop access for verified members.</p>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-secondary-fixed shrink-0" />
              <p>Premium cuts and ultra-heavyweight fabrics.</p>
            </div>
            <div className="flex gap-3">
              <Flame className="w-5 h-5 text-secondary-fixed shrink-0" />
              <p>Aggressive streetwear aesthetics designed in-house.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white/60 text-xs font-semibold">
          <span>© 2026 Rebel Gen-Z ECommerce.</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 relative bg-surface">
        <div className="max-w-[440px] mx-auto w-full">
          <div className="mb-8 text-center sm:text-left">
            <h3 className="text-3xl font-extrabold text-on-surface mb-2 font-display-lg">Create an account</h3>
            <p className="text-sm text-on-surface-variant font-body-md">Shop the drop and define your style today.</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-xl mb-6 text-xs text-center border border-error/10 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="full_name">Full Name</label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-4 pr-11 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline"
                  id="full_name" 
                  type="text"
                  placeholder="Enter your name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-4 pr-11 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline"
                  id="email" 
                  type="email"
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              </div>
            </div>

            {/* Password Input + Strength */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline"
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password" 
                  value={password}
                  onChange={(e) => checkPasswordStrength(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthColor.split(' ')[1]}`} style={{ width: `${strength}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
                  <span className={`${strengthColor.split(' ')[0]}`}>{strengthText}</span>
                  <span className="text-outline">Min. 8 characters</span>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer" 
                  id="terms" 
                  type="checkbox" 
                  required
                />
              </div>
              <label className="text-xs font-medium text-on-surface-variant leading-normal cursor-pointer select-none" htmlFor="terms">
                I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a> including ethical sourcing standards.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Signup / Dividers */}
          {/* <div className="my-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">or sign up with</span>
            <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
          </div> */}

          {/* <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors group cursor-pointer text-xs font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path></svg>
              <span className="text-on-surface-variant">Google</span>
            </button>
            <button 
              type="button"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors group cursor-pointer text-xs font-bold"
            >
              <svg className="w-4 h-4 text-on-surface" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.548 0-1.711.516-1.711 1.564 0 .915.82 1.322 1.392 1.322.756 0 1.25-.497 1.25-1.322 0-1.018-1.026-1.564-1.127-1.564l.196-.001zm-1.062-4.47c0 1.12.87 2.474 2.129 2.474.135 0 .273-.01.404-.035C13.255 3.312 12.33 1.95 12.33.684c0-.07.003-.141.01-.211-1.243.056-2.425 1.411-2.425 1.953h.175zM17.25 18.3c-.63 0-1.155-.42-1.875-.42-.735 0-1.335.42-1.92.42-.87 0-3.645-1.725-3.645-5.22 0-3.195 2.01-4.875 3.915-4.875.765 0 1.395.345 1.95.345.48 0 1.17-.345 1.83-.345 1.11 0 3.36.63 4.215 2.145-2.625 1.155-2.22 4.41.345 5.565-.63 1.485-1.53 2.91-3.03 2.91z"></path></svg>
              <span className="text-on-surface-variant">Apple</span>
            </button>
          </div> */}

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Already have an account? <Link className="text-primary font-bold hover:underline" to="/login">Log In</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
