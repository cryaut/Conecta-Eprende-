import { useSearchStore } from "../stores/search-store";
import ProviderMap from "../components/map/ProviderMap";
import { Search, Zap, MapPin, Sparkles, Filter, AlertCircle } from "lucide-react";
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
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 relative overflow-hidden">
      
      {/* Left Sidebar - Search & List */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`w-full md:w-[450px] lg:w-[480px] flex flex-col bg-white border-t md:border-t-0 border-slate-200 z-10 relative shadow-[10px_0_40px_-10px_rgba(0,0,0,0.1)] shrink-0 h-full md:rounded-tr-3xl md:border-r ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="px-6 md:px-8 py-6 border-b border-slate-100 shrink-0 bg-white md:rounded-tr-3xl relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buscar</h2>
            <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
               <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative mb-5 flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Ej: diseñador en managua..." 
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-[15px] shadow-sm"
              />
            </div>
            <button 
              onClick={handleAiSearch}
              disabled={isAiSearching || !localQuery.trim()}
              title="Búsqueda Inteligente"
              className="px-5 py-4 bg-purple-600 text-white shadow-md hover:shadow-purple-600/30 hover:bg-purple-700 rounded-2xl transition-all disabled:opacity-50 active:scale-95"
            >
               <Zap className={`w-5 h-5 ${isAiSearching ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {aiIntent && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="text-xs font-medium bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 flex items-start gap-3 shadow-inner">
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
                className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all shrink-0 snap-start ${
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={p.id}
                  onMouseEnter={() => setHoveredProviderId(p.id)}
                  onMouseLeave={() => setHoveredProviderId(null)}
                >
                  <Link to={`/proveedor/${p.id}`} className={`block p-5 border rounded-[1.25rem] shadow-sm hover:shadow-xl hover:-translate-y-1 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer group outline-none overflow-hidden relative ${hoveredProviderId === p.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' : 'bg-white border-slate-200'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50/20 translate-x-12 -translate-y-8 rounded-full blur-2xl group-hover:bg-blue-100/40 transition-colors"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{p.displayName}</h3>
                        <span className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200/50 text-green-700 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap shadow-sm">
                          {p.score} Trust
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4">
                         <div className="text-[13px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg inline-flex">
                           {p.category}
                         </div>
                         <div className="text-[13px] font-semibold text-slate-400 flex items-center gap-1.5">
                           <MapPin className="w-3.5 h-3.5" />
                           {p.city}
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
