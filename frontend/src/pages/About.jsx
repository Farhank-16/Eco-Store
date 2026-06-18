import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Flame, 
  ShieldCheck, 
  BookOpen, 
  Mail, 
  FileText, 
  Cookie, 
  Compass, 
  Send,
  CheckCircle2,
  Lock
} from "lucide-react";
import toast from "react-hot-toast";

export default function About() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("mission");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  // Parse query param to set active tab on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["mission", "sustainability", "journal", "contact", "privacy", "terms", "cookies"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("PLEASE FILL ALL FIELDS");
      return;
    }
    toast.success("TRANSMISSION RECEIVED. WE WILL RESPOND.");
    setSubmitted(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const tabs = [
    { id: "mission", label: "THE MANIFESTO", icon: Compass, category: "Company" },
    { id: "journal", label: "REBEL JOURNAL", icon: BookOpen, category: "Company" },
    { id: "contact", label: "CONTACT CO.", icon: Mail, category: "Company" },
    { id: "sustainability", label: "ETHICAL SOURCE", icon: Flame, category: "Resources" },
    { id: "privacy", label: "PRIVACY RULES", icon: ShieldCheck, category: "Legal" },
    { id: "terms", label: "TERMS OF USE", icon: FileText, category: "Legal" },
    { id: "cookies", label: "COOKIES POLICY", icon: Cookie, category: "Legal" },
  ];

  return (
    <div className="bg-background min-h-screen text-white pt-20 pb-24">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        
        {/* Page Header */}
        <div className="border-b border-outline/10 pb-8 mb-12">
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 inline-block mb-3">
            REBEL SYSTEM INFORMATION
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-widest uppercase">
            ABOUT REBEL
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm uppercase tracking-wider mt-2 max-w-2xl font-semibold">
            Explore the core manifesto, local sourcing specifications, and legal operational agreements.
          </p>
        </div>

        {/* Tab Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Company Section */}
            <div>
              <h3 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-widest mb-3">COMPANY</h3>
              <div className="flex flex-col gap-1.5">
                {tabs.filter(t => t.category === "Company").map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left border cursor-pointer ${
                        isActive
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-outline/10 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resources Section */}
            <div>
              <h3 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-widest mb-3">RESOURCES</h3>
              <div className="flex flex-col gap-1.5">
                {tabs.filter(t => t.category === "Resources").map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left border cursor-pointer ${
                        isActive
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-outline/10 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legal Section */}
            <div>
              <h3 className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-widest mb-3">LEGAL RULES</h3>
              <div className="flex flex-col gap-1.5">
                {tabs.filter(t => t.category === "Legal").map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left border cursor-pointer ${
                        isActive
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-outline/10 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-surface border border-outline/10 p-6 sm:p-10 min-h-[400px]">
            
            {/* Tab: Our Mission */}
            {activeTab === "mission" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <Compass className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">THE REBEL MANIFESTO</h2>
                </div>
                <div className="text-on-surface-variant text-xs sm:text-sm uppercase tracking-wider font-semibold space-y-4 leading-relaxed">
                  <p>
                    WE DO NOT CREATE CLOTHING. WE DRAFT STATEMENTS. FOUNDED IN 2026, REBEL IS AN ACCIDENT OF YOUTH CULTURE, AN AGGRESSIVE COUNTER-ACTION AGAINST THE MAINSTREAM HIGH STREET TEMPLATES.
                  </p>
                  <p>
                    OUR DESIGNS INCORPORATE OVERSIZED CUTS, HIGH-DENSITY FABRICATIONS, AND UNAPOLOGETIC INDUSTRIAL ACCENTS. WE WORK IN DROPS AND EXTREMELY LIMITED BATCHES TO MAINTAIN ARCHIVAL RARITY.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="p-6 bg-primary/10 border border-primary/20">
                    <h3 className="font-display text-lg text-primary tracking-wider mb-2 uppercase">1% FOR THE STREETS</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold leading-relaxed">
                      We channel 1% of gross revenue to youth arts, underground music foundations, and creative grants for independent designers.
                    </p>
                  </div>
                  <div className="p-6 bg-surface-container-high border border-outline/10">
                    <h3 className="font-display text-lg text-white tracking-wider mb-2 uppercase">INDEPENDENT LABS</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold leading-relaxed">
                      All drops undergo strict specification testing: pre-shrunk washes, high durability embroidery, and ethical factory validation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Journal */}
            {activeTab === "journal" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">REBEL JOURNAL</h2>
                </div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">LATEST UPDATES FROM THE CORE DEV LABS.</p>
                
                <div className="space-y-6 pt-2">
                  <article className="group border-b border-outline/10 pb-6 cursor-pointer">
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest">CLAN STYLE — JUNE 12, 2026</span>
                    <h3 className="font-display text-xl text-white group-hover:text-primary transition-colors mt-1 mb-2 uppercase tracking-wide">HOW TO ARCHIVE YOUR HEAVYWEIGHT DROP</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Tips on washing raw dye garments, keeping neck ribbings rigid, and protecting custom graphic prints.
                    </p>
                  </article>
                  
                  <article className="group border-b border-outline/10 pb-6 cursor-pointer">
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest">TRANSPARENCY — MAY 28, 2026</span>
                    <h3 className="font-display text-xl text-white group-hover:text-primary transition-colors mt-1 mb-2 uppercase tracking-wide">GARMENT PRICING & FACTORY ALLOCATION</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Full breakdown of cost structure: premium loopback cotton raw cost, printing setup fees, and shipping carbon offset metrics.
                    </p>
                  </article>
                </div>
              </div>
            )}

            {/* Tab: Contact Us */}
            {activeTab === "contact" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">CONTACT CO.</h2>
                </div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">
                  TRANSMIT AN ENQUIRY REGARDING YOUR ORDER, A BULK CUSTOM REQUEST, OR COLLABORATION ENQUIRIES.
                </p>

                {submitted ? (
                  <div className="bg-primary/10 border border-primary/20 text-primary p-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display text-sm tracking-wider uppercase font-extrabold">TRANSMISSION RECEIVED!</h4>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mt-1">
                        Our administration team will reply via encrypted email within 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-on-surface-variant block mb-1 uppercase tracking-widest">NAME</label>
                        <input 
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-background border border-outline/25 text-white focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                          placeholder="JANE DOE"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-on-surface-variant block mb-1 uppercase tracking-widest">EMAIL</label>
                        <input 
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-background border border-outline/25 text-white focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3"
                          placeholder="JANE@REBEL.CO"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-on-surface-variant block mb-1 uppercase tracking-widest">TRANSMISSION MESSAGE</label>
                      <textarea 
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-background border border-outline/25 text-white focus:outline-none focus:border-primary text-xs uppercase tracking-widest px-4 py-3 min-h-[120px]"
                        placeholder="ENTER MESSAGE DETAILED REQUESTS..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-container text-white px-8 py-3.5 font-display text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      SEND TRANSMISSION <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Tab: Sustainability */}
            {activeTab === "sustainability" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <Flame className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">ETHICAL SOURCE</h2>
                </div>
                
                <div className="space-y-6 text-xs sm:text-sm uppercase tracking-wider font-semibold text-on-surface-variant">
                  <section>
                    <h3 className="font-display text-lg text-white mb-2 uppercase">REACTION-DYED COTTON</h3>
                    <p className="leading-relaxed">
                      We dye all textiles using environment-compliant reactive dyes. This locks the color deep within our heavy-knit cotton threads, minimizing wastewater discharge while preventing colors from fading.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-display text-lg text-white mb-2 uppercase">CARBON BALANCED SHIPPING</h3>
                    <p className="leading-relaxed">
                      All delivery runs are wrapped in 100% recyclable, minimal packaging to save volume space. Remaining freight impact is balanced by offsets supporting urban green initiatives.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-display text-lg text-white mb-2 uppercase">LIFE CYCLE DURABILITY</h3>
                    <p className="leading-relaxed">
                      Rather than cheap fast-fashion, REBEL pieces are designed to hold their premium weight shape for years of heavy rotation, lowering overall consumer consumption footprint.
                    </p>
                  </section>
                </div>
              </div>
            )}

            {/* Tab: Privacy Policy */}
            {activeTab === "privacy" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <Lock className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">PRIVACY RULES</h2>
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-on-surface-variant space-y-4 leading-relaxed">
                  <p><strong>LAST UPDATED: JUNE 12, 2026</strong></p>
                  <p>
                    REBEL ("we", "us", or "our") values user data privacy. This privacy policy explains data collection, encryption, and secure checkout processes.
                  </p>
                  <h4 className="font-display text-base text-white mt-4 uppercase">1. ENCRYPTED INFORMATION</h4>
                  <p>
                    We collect secure billing details, shipping addresses, and profiles to process orders. Data keys are isolated to prevent third party breaches.
                  </p>
                  <h4 className="font-display text-base text-white mt-4 uppercase">2. CART DATA PERSISTENCE</h4>
                  <p>
                    User cart and wishlist states are stored via per-user local storage keys to ensure absolute session privacy.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Terms of Service */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">TERMS OF USE</h2>
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-on-surface-variant space-y-4 leading-relaxed">
                  <p><strong>LAST UPDATED: JUNE 12, 2026</strong></p>
                  <p>
                    Please read these terms of service before using the REBEL platform. By purchasing, you agree to comply with our release conditions.
                  </p>
                  <h4 className="font-display text-base text-white mt-4 uppercase">1. DROP QUANTITY LIMITS</h4>
                  <p>
                    We reserve the right to limit cart quantities during high-demand limited drops to prevent bot scalping.
                  </p>
                  <h4 className="font-display text-base text-white mt-4 uppercase">2. LIABILITY AGREEMENTS</h4>
                  <p>
                    Items are provided as-released. All graphic prints are produced using artisan processes; minor texture variations are intentional.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Cookies Policy */}
            {activeTab === "cookies" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-outline/10 pb-4">
                  <Cookie className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl tracking-widest text-white uppercase">COOKIES POLICY</h2>
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-on-surface-variant space-y-4 leading-relaxed">
                  <p><strong>LAST UPDATED: JUNE 12, 2026</strong></p>
                  <p>
                    REBEL uses essential cookies to track your token authorization status and secure local cart persistence.
                  </p>
                  <h4 className="font-display text-base text-white mt-4 uppercase">COOKIE CATEGORIES</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>ESSENTIAL AUTHORIZATION:</strong> Needed for active login profiles.</li>
                    <li><strong>CART INTEGRATION:</strong> Secures and holds item details in memory.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
