import { Link } from "react-router-dom";
import { Search, MapPin, ShieldCheck, Zap, ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto bg-white relative selection:bg-blue-600/10 selection:text-blue-700">
      {/* Background Ornaments */}
      <div className="absolute top-0 inset-x-0 h-[1000px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <div className="flex flex-col items-center justify-center min-h-full px-6 pt-24 pb-32 relative z-10">
        <div className="max-w-5xl text-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-slate-600 font-bold text-sm mb-10"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            </div>
            Directorio Inteligente de Nicaragua
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-[900] tracking-[-0.04em] text-slate-900 mb-10 leading-[0.95]"
          >
            El talento local <br />
            <span className="text-blue-600 relative inline-block">
               potenciado
               <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
            </span> con IA.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 mb-14 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Conectamos negocios nicaragüenses con proveedores verificados mediante búsqueda semántica y mapas de precisión.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-32"
          >
            <Link
              to="/buscar"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 text-lg font-[900] text-white transition-all bg-blue-600 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_60px_-10px_rgba(37,99,235,0.5)] hover:-translate-y-1 hover:bg-blue-700 active:scale-95 group"
            >
              <Search className="w-6 h-6 stroke-[3]" />
              Empezar Búsqueda
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              to="/dashboard/perfil"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-slate-800 transition-all bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:bg-slate-50 hover:border-slate-200 active:scale-95"
            >
              <LayoutDashboard className="w-6 h-6 opacity-70" />
              Soy Proveedor
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left relative z-10 w-full max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-8 p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group cursor-default"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              <MapPin className="w-12 h-12 text-blue-500 mb-8 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-3xl font-[900] mb-4 tracking-tight">Geolocalización de Precisión</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                Encuentra expertos cerca de ti con nuestro mapa interactivo. Filtra por ciudad, categoría o deja que la IA te sugiera lo mejor.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-4 p-10 bg-blue-50 rounded-[3rem] border border-blue-100/50 flex flex-col justify-between group cursor-default"
            >
              <Zap className="w-12 h-12 text-blue-600 mb-8 group-hover:rotate-12 transition-transform" />
              <div>
                <h3 className="text-2xl font-[900] text-slate-900 mb-3 tracking-tight">Búsqueda Semántica</h3>
                <p className="text-blue-900/60 font-bold leading-relaxed">
                  "Necesito un carpintero en Granada para arreglar una puerta antigua." — Entendemos tu necesidad.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="md:col-span-4 p-10 bg-white border-2 border-slate-100 rounded-[3rem] group cursor-default"
            >
              <ShieldCheck className="w-12 h-12 text-emerald-500 mb-8 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-[900] text-slate-900 mb-3 tracking-tight">Vínculo de Confianza</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Trust Score basado en formalización real y reseñas verificadas. Seguridad en cada conexión.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="md:col-span-8 p-10 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center gap-10 group cursor-default"
            >
              <div className="flex-1">
                <h3 className="text-3xl font-[900] mb-4 tracking-tight">Cotizaciones Inteligentes</h3>
                <p className="text-white/70 text-lg font-medium leading-relaxed">
                  Generamos borradores profesionales para que solo tengas que revisar y enviar. Ahorra tiempo y formaliza tus acuerdos.
                </p>
              </div>
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                 <Sparkles className="w-16 h-16 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
