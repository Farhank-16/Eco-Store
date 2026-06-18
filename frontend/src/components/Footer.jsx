import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("WELCOME TO THE UNDERGROUND. WELCOME TO REBEL.");
  };

  return (
    <footer className="bg-surface-container-lowest border-t border-outline/10 text-on-surface font-sans">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-1">
              <span className="font-display text-3xl font-extrabold tracking-widest">REBEL</span>
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            </div>
            <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed uppercase tracking-wider text-[11px]">
              REBEL IS NOT A CLOTHING BRAND. IT'S A STATEMENT. AN ATTITUDE. A SUB-CULTURE OF THOSE WHO REFUSE TO CONFORM.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-3 max-w-sm">
              <h4 className="font-display text-xs tracking-widest text-on-surface uppercase font-bold">JOIN THE INNER CIRCLE</h4>
              <form onSubmit={handleSubscribe} className="flex relative">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL..." 
                  className="w-full bg-surface-container-high border border-outline/25 text-on-surface placeholder-on-surface-variant/70 text-xs px-4 py-3 rounded-l-none focus:outline-none focus:border-primary uppercase tracking-widest"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-container text-white px-5 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-7 gap-8">
            
            <div className="space-y-4">
              <h4 className="font-display text-xs tracking-widest text-on-surface uppercase font-extrabold">COLLECTIONS</h4>
              <ul className="flex flex-col gap-3 text-xs tracking-wider font-semibold text-on-surface-variant">
                <li><Link className="hover:text-primary transition-colors uppercase" to="/products?collection=midnight">MIDNIGHT CHAOS</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/products?collection=urban">URBAN FUTURE</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/products?collection=limited">LIMITED DROP</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/products">ALL PIECES</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-xs tracking-widest text-on-surface uppercase font-extrabold">COMPANY</h4>
              <ul className="flex flex-col gap-3 text-xs tracking-wider font-semibold text-on-surface-variant">
                <li><Link className="hover:text-primary transition-colors uppercase" to="/about">THE MANIFESTO</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/about?tab=journal">REBEL JOURNAL</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/about?tab=contact">GET IN TOUCH</Link></li>
              </ul>
            </div>

            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="font-display text-xs tracking-widest text-on-surface uppercase font-extrabold">LEGAL</h4>
              <ul className="flex flex-col gap-3 text-xs tracking-wider font-semibold text-on-surface-variant">
                <li><Link className="hover:text-primary transition-colors uppercase" to="/about?tab=privacy">PRIVACY RULES</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/about?tab=terms">TERMS OF USE</Link></li>
                <li><Link className="hover:text-primary transition-colors uppercase" to="/about?tab=cookies">COOKIES</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom copyright and Socials */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-outline/10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-on-surface-variant text-[10px] tracking-widest uppercase">
            © 2026 REBEL STREETWEAR CO. ALL RULES BROKEN.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" title="Instagram">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" title="Twitter">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" title="Youtube">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12a9.5 9.5 0 0 1 19 0 9.5 9.5 0 0 1-19 0z"/><polygon points="10 9 15 12 10 15 10 9"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
