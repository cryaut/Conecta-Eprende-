import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, LayoutDashboard, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function RootLayout() {
  const location = useLocation();
  const isSearch = location.pathname === '/buscar';

  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden text-slate-900 font-sans bg-slate-50 selection:bg-blue-600/10 selection:text-blue-700">
      <header className={`shrink-0 z-[100] flex items-center justify-between px-6 py-4 transition-all duration-300 ${isSearch ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60' : 'bg-transparent'}`}>
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
             <Sparkles className="w-6 h-6 text-white fill-white/20" />
          </div>
          <span className="text-xl font-[900] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Conecta<span className="text-blue-600">Emprende</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            to="/buscar"
            className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-bold transition-all rounded-3xl ${
              location.pathname === '/buscar'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Explorar</span>
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

          <Link
            to="/dashboard/cotizaciones"
            className="flex items-center gap-2 px-6 py-2.5 text-[14px] font-bold text-white bg-slate-900 rounded-3xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 opacity-70" />
            <span className="hidden sm:inline">Mi Portal</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
        </nav>
      </header>
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
