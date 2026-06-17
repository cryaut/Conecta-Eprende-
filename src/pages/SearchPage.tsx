import { useSearchStore } from "../stores/search-store";
import ProviderMap from "../components/map/ProviderMap";
import { Search, Zap, MapPin, Sparkles, Filter, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";

interface Provider {
  id: string;
  displayName: string;
  category: string;
  city: string;
  lat: number;
  lng: number;
  score: number;
}

export default function SearchPage() {
  const { query, setQuery, city, setCity, hoveredProviderId, setHoveredProviderId } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiIntent, setAiIntent] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Normal Sync back to store safely
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
         setQuery(localQuery);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localQuery, query, setQuery]);

  // Fetch Providers via API
  const { data: providers = [], isLoading, isError } = useQuery({
    queryKey: ['providers', query, city, aiIntent?.category, mapBounds],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (city) params.append('city', city);
      if (aiIntent?.category) params.append('q', aiIntent.category); // Use AI intent category if exists

      if (mapBounds) {
        params.append('n', mapBounds.getNorth().toString());
        params.append('s', mapBounds.getSouth().toString());
        params.append('e', mapBounds.getEast().toString());
        params.append('w', mapBounds.getWest().toString());
      }

      const res = await fetch(`/api/providers/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      return json.data as Provider[];
    }
  });

  const handleAiSearch = async () => {
    if (!localQuery.trim()) return;
    setIsAiSearching(true);
    setAiIntent(null);
    try {
      const res = await fetch('/api/providers/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: localQuery })
      });
      const data = await res.json();
      if (data.success && data.intent) {
        setAiIntent(data.intent);
        if (data.intent.city) {
          // Normalize city name
          const searchedCityLower = data.intent.city.toLowerCase().trim();
          const mappedCity = ["Managua", "León", "Granada", "Masaya", "Estelí", "Matagalpa", "Bluefields", "Juigalpa", "Nagarote", "San Juan de Oriente"]
            .find(c => c.toLowerCase() === searchedCityLower);
            
          if (mappedCity) {
            setCity(mappedCity);
          } else {
            setCity(data.intent.city); // If not perfectly mapped, use the string AI provided to let local search filter try.
          }
        } else {
          setCity(null);
        }
      }
    } catch (e) {
      console.warn("AI search failed", e);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-white relative overflow-hidden">
      
      {/* Left Sidebar - Search & List */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`w-full md:w-[460px] lg:w-[500px] flex flex-col bg-white border-t md:border-t-0 border-slate-100 z-10 relative shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)] shrink-0 h-full md:rounded-tr-[3rem] md:border-r ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="px-6 md:px-8 pt-8 pb-6 shrink-0 bg-white md:rounded-tr-[3rem] relative z-10">
          <div className="flex justify-between items-end mb-8 px-1">
            <div>
              <h2 className="text-4xl font-[900] text-slate-900 tracking-tight">Directorio</h2>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">Nicaragua Conecta</p>
            </div>
            <button className="w-12 h-12 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-90">
               <Filter className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative mb-6">
            <div className="relative group bg-slate-50 rounded-[2rem] p-1.5 border-2 border-slate-50 focus-within:border-blue-600/20 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-600/5 transition-all duration-300">
              <div className="flex items-center gap-3 pl-4 pr-1.5 py-1.5">
                <div className="w-10 h-10 rounded-[1.5rem] bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                  <Search className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <input
                  type="text"
                  placeholder="¿A quién buscas hoy?"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                  className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg text-slate-800 placeholder:text-slate-300 outline-none"
                />
                <button
                  onClick={handleAiSearch}
                  disabled={isAiSearching || !localQuery.trim()}
                  className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center transition-all ${isAiSearching ? 'bg-purple-100 text-purple-600' : 'bg-slate-900 text-white hover:bg-purple-600 shadow-md active:scale-95'}`}
                >
                  <Zap className={`w-5 h-5 ${isAiSearching ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
            <div className="mt-3 px-4 flex items-center gap-2">
               <Sparkles className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
               <p className="text-xs font-bold text-slate-400">Prueba: "Un electricista rápido en León"</p>
            </div>
          </div>

          <AnimatePresence>
            {aiIntent && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="text-xs font-medium bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-[1.5rem] border border-purple-100 flex items-start gap-3 shadow-inner">
                  <div className="bg-purple-200/50 p-1.5 rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 text-[13px] tracking-tight">Intención Detectada IA:</span>
                    <ul className="text-slate-600 text-[13px]">
                      {aiIntent.category && <li><span className="opacity-70">Buscas:</span> <strong className="text-slate-800">{aiIntent.category}</strong></li>}
                      {aiIntent.city && <li><span className="opacity-70">Ubicación:</span> <strong className="text-slate-800">{aiIntent.city}</strong></li>}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 snap-x">
            {["Managua", "León", "Granada", "Estelí"].map(c => (
              <button 
                key={c}
                onClick={() => setCity(city === c ? null : c)}
                className={`px-4 py-2 text-sm font-bold rounded-[1.5rem] border transition-all shrink-0 snap-start ${
                  city === c 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-4 bg-slate-50 relative">
          {isAiSearching || isLoading ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="py-12 flex flex-col items-center justify-center text-center"
             >
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-50"></div>
                  <div className="relative bg-white rounded-full p-4 shadow-sm border border-slate-100 z-10">
                    <Zap className="w-8 h-8 text-purple-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-2">Buscando Proveedores</h3>
                <p className="text-[15px] font-medium text-slate-500 max-w-[200px] leading-relaxed">Conectando con la red local...</p>
             </motion.div>
          ) : providers.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-6 h-6 text-slate-300" />
               </div>
               <p className="font-semibold text-[15px]">No se encontraron proveedores.</p>
               <p className="text-sm mt-1">Intenta ajustando los términos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">
                 {providers.length} proveedores encontrados
              </div>
              {providers.map((p, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, ease: "easeOut" }}
                  key={p.id}
                  onMouseEnter={() => setHoveredProviderId(p.id)}
                  onMouseLeave={() => setHoveredProviderId(null)}
                >
                  <Link
                    to={`/proveedor/${p.id}`}
                    className={`block p-6 border rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 focus:ring-4 focus:ring-blue-600/10 transition-all duration-300 cursor-pointer group outline-none overflow-hidden relative ${hoveredProviderId === p.id ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-600/5' : 'bg-white border-slate-100'}`}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 translate-x-12 -translate-y-8 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="font-[900] text-slate-900 text-xl leading-tight group-hover:text-blue-600 transition-colors mb-1">{p.displayName}</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tight">
                            <MapPin className="w-3 h-3 stroke-[3]" />
                            {p.city}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-3xl text-[13px] font-[900] shadow-sm border border-emerald-100/50 flex items-center gap-1.5 whitespace-nowrap">
                            <ShieldCheck className="w-3.5 h-3.5 fill-emerald-500/20" />
                            {p.score} Trust
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                         <div className="text-[13px] font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-[1.5rem] border border-slate-100">
                           {p.category}
                         </div>
                         <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-lg">
                           <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                         </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Right Content - Map */}
      <div className={`flex-1 bg-slate-200 relative min-h-0 md:min-h-full ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
        <ProviderMap
          providers={providers}
          focusCity={city}
          hoveredProviderId={hoveredProviderId}
          onBoundsChange={(bounds) => {
            setMapBounds(bounds);
            // Optionally switch to list if bounds change? No, better stay in map if user is moving map.
          }}
        />
      </div>

      {/* Mobile Toggle Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] md:hidden">
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-full shadow-2xl active:scale-95 transition-all"
        >
          {viewMode === 'list' ? (
            <><MapPin className="w-4 h-4" /> Ver Mapa</>
          ) : (
            <><Filter className="w-4 h-4" /> Ver Lista</>
          )}
        </button>
      </div>
    </div>
  );
}
