import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, Tags, LogOut, Menu, X, LayoutDashboard, ShoppingCart, Ticket, Settings, ShieldAlert, Flame } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'categories', label: 'Categories', icon: Tags, path: '/admin/categories' },
  { id: 'coupons', label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex font-body-md">
      {/* Mobile Top App Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between px-6 z-40">
        <div className="font-bold text-lg text-primary flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary fill-current" />
          <span className="font-extrabold tracking-tight">Rebel Admin</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside 
        className={`w-64 bg-surface-container-low flex flex-col fixed h-full z-40 border-r border-outline-variant/20 shadow-md transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <Flame className="w-5 h-5 fill-current text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-on-surface tracking-tight block leading-tight">
                Rebel Admin
              </span>
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                HQ Control
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = location.pathname.includes(n.id);
              return (
                <Link
                  key={n.id}
                  to={n.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-on-secondary-container' : 'text-outline'}`} />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-auto p-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6 bg-surface-container rounded-xl p-3 border border-outline-variant/10">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-extrabold text-sm uppercase shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">{user?.name || 'Admin User'}</span>
              <span className="text-[10px] font-medium text-on-surface-variant truncate">{user?.email || 'hq@rebel.co'}</span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-xs font-bold text-red-650 hover:bg-red-50 transition-all cursor-pointer border border-red-200/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 flex-1 p-6 sm:p-10 lg:p-12 pt-24 md:pt-12 w-full max-w-full overflow-x-hidden min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
