import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, Tags, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const NAV = [
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'categories', label: 'Categories', icon: Tags, path: '/admin/categories' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full shadow-[4px_0_24px_rgb(0,0,0,0.02)]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-indigo-600/20">
              A
            </div>
            <div>
              <span className="font-bold text-xl text-slate-800 tracking-tight block">Admin</span>
              <span className="text-xs text-slate-500 font-medium">Dashboard</span>
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
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
          </div>
          
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
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
      <main className="ml-64 flex-1 p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
