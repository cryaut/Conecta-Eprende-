import { Outlet, Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function RootLayout() {
  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden text-slate-800 font-sans bg-slate-50">
      <header className="shrink-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <Link to="/" className="text-xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
          <span>Conecta Emprende AI</span>
        </Link>
        <nav className="flex space-x-6">
          <Link to="/buscar" className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-slate-100">
            <Search className="w-4 h-4" /> Buscar Proveedores
          </Link>
          <Link to="/dashboard/cotizaciones" className="hidden md:block px-4 py-2 text-sm font-medium text-white transition-opacity bg-blue-600 rounded-full hover:opacity-90">
            Ingresar
          </Link>
        </nav>
      </header>
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
