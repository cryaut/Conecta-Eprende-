import { Link } from "react-router-dom";
import { Search, MapPin, ShieldCheck, Zap, ArrowRight, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 relative selection:bg-blue-100 selection:text-blue-900">
      {/* Background Ornaments */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/3 pointer-events-none z-0"></div>
      
      <div className="flex flex-col items-center justify-center min-h-full px-6 pt-20 pb-24 relative z-10">
        <div className="max-w-4xl text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-8 border border-blue-100/50 shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            Hackathon Build — Versión 1.0
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-900 mb-8 leading-[1.1] md:leading-[1.1]"
          >
            Conectamos el talento local con el poder de la <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Inteligencia Artificial</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium"
          >
            Descubre proveedores de servicios formalizados en Nicaragua. Búsqueda semántica, mapas interactivos y cotizaciones sin fricción en una sola plataforma.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <Link
              to="/buscar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-2xl shadow-[0_10px_30px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95 group"
            >
              <Search className="w-5 h-5" />
              Explorar Directorio
              <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard/perfil"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 transition-all bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              <LayoutDashboard className="w-5 h-5 opacity-70" />
              Portal de Proveedores
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left relative z-10 w-full">
            {[
              {
                icon: MapPin,
                color: "blue",
                title: "Búsqueda Local",
                description: "Explora a través del mapa interactivo miles de proveedores formalizados en tu ciudad."
              },
              {
                icon: ShieldCheck,
                color: "emerald",
                title: "Trust Score",
                description: "Métricas de confianza algorítmicas basadas en reseñas reales y avances de formalización."
              },
              {
                icon: Zap,
                color: "purple",
                title: "Inteligencia Artificial",
                description: "Escribe lo que necesitas naturalmente. Extraemos intenciones y generamos cotizaciones."
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                  key={feature.title} 
                  className="p-8 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 focus-within:ring-4 focus-within:ring-slate-100 transition-all group"
                >
                  <div className={`w-14 h-14 mb-6 flex items-center justify-center bg-${feature.color}-100/50 text-${feature.color}-600 rounded-2xl border border-${feature.color}-100 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
