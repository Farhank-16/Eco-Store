import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, Tags, ArrowLeft, LogOut, Menu, X, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'categories', label: 'Categories', icon: Tags, path: '/admin/categories' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 z-40">
        <div className="font-bold text-lg text-stone-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          Admin
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-stone-600">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-stone-100 flex flex-col fixed h-full z-30 shadow-[4px_0_24px_rgb(0,0,0,0.02)] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          {/* <div className=" flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-indigo-600/20">
              A
            </div>
            <div>
              <span className="font-bold text-xl text-slate-800 tracking-tight block">Admin</span>
              <span className="text-xs text-slate-500 font-medium">Dashboard</span>
            </div>
          </div> */}
          <div className="invisible md:visible flex items-center gap-2 mb-8">
  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-rose-500/20">
    A
  </div>

  <div>
    <span className="font-bold text-xl text-stone-800 tracking-tight block">
      Admin
    </span>

    <span className="text-xs text-stone-500 font-medium">
      Dashboard
    </span>
  </div>
</div>

          <div className="space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = location.pathname.includes(n.id);
              return (
                <Link
                  key={n.id}
                  to={n.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-stone-400'}`} />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-stone-800">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-stone-500">{user?.email}</span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-4 sm:p-8 lg:p-12 pt-20 md:pt-8 w-full max-w-full overflow-hidden min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
