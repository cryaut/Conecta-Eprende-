import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, ShieldCheck, Clock, MessageSquare, ArrowLeft, Send, Sparkles, CheckCircle, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

async function fetchProvider(id: string) {
  const res = await fetch(`/api/providers/${id}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
}

export default function ProviderPage() {
  const { id } = useParams();
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteBody, setQuoteBody] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiIdea, setAiIdea] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  
  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const data = await fetchProvider(id!);
      if (data && data.success && data.data) return data.data;
      throw new Error('Not found');
    }
  });

  const handleSendQuote = async () => {
    if (!quoteBody.trim()) return;
    setQuoteStatus("loading");
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          subject: "Nueva solicitud de cotización",
          body: quoteBody
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuoteStatus("success");
      } else {
        setQuoteStatus("error");
      }
    } catch (e) {
      setQuoteStatus("error");
    }
  };

  const handleGenerateDraft = async () => {
    if (!aiIdea.trim()) return;
    setIsAiDrafting(true);
    try {
      const res = await fetch('/api/quotes/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: aiIdea,
          providerName: provider.displayName
        })
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setQuoteBody(data.draft);
        setShowAiInput(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiDrafting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!provider) {
    return <div className="p-8 text-center text-red-500 font-bold">Proveedor no encontrado</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto bg-white selection:bg-blue-600/10 selection:text-blue-700"
    >
      <div className="max-w-7xl mx-auto py-12 px-6 sm:px-10 relative">
        <Link to="/buscar" className="group inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 font-bold mb-10 transition-all">
          <div className="w-10 h-10 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 group-hover:-translate-x-1 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Volver a explorar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Col - Profile details */}
          <div className="col-span-1 lg:col-span-8 space-y-16 pb-32 lg:pb-10">
            {/* Header section */}
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-[900] uppercase tracking-widest border border-blue-100/50">
                      {provider.category}
                    </span>
                    {provider.verified && (
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-[900] uppercase tracking-widest border border-emerald-100/50 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/20" /> Verificado
                      </span>
                    )}
                  </div>
                  <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 tracking-[-0.04em] leading-[0.95] mb-6">
                    {provider.displayName}
                  </h1>
                  <div className="flex items-center gap-6 text-lg font-bold text-slate-400">
                    <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600 stroke-[3]" /> {provider.city}</span>
                    <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-300 stroke-[3]" /> {provider.responseTimeHrs}h respuesta</span>
                  </div>
                </div>
                <div className="shrink-0">
                   <div className="w-32 h-32 bg-slate-900 text-white rounded-[3rem] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group transition-transform hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                      <span className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-tighter">Trust</span>
                      <span className="text-4xl font-[900] tracking-tighter">{provider.score}</span>
                   </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-[3rem] p-10 md:p-12 border border-slate-100">
                <h3 className="text-sm font-[900] text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-blue-600"></div> Biografía Profesional
                </h3>
                <p className="text-xl md:text-2xl font-medium text-slate-600 leading-[1.6] italic">
                   "{provider.bio}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
                <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-[900] text-slate-400 uppercase tracking-widest mb-4">Disponibilidad</span>
                  <div className="font-[900] text-slate-900 flex items-center gap-3 text-lg">
                    <span className={`w-3.5 h-3.5 rounded-full ${provider.availability === 'DISPONIBLE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]'}`}></span>
                    {provider.availability}
                  </div>
                </div>
                <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-[900] text-slate-400 uppercase tracking-widest mb-4">Categoría Fiscal</span>
                  <div className="font-[900] text-slate-900 text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      {provider.formalizationStatus.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                  <span className="text-xs font-[900] text-slate-500 uppercase tracking-widest mb-4">Ubicación</span>
                  <div className="font-[900] text-lg">
                    {provider.city}, Nicaragua
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Grid */}
            <div className="space-y-10">
              <div className="flex items-end justify-between px-2">
                <h3 className="text-4xl font-[900] text-slate-900 tracking-tight">Portafolio</h3>
                <p className="text-slate-400 font-bold mb-1">Muestra de trabajos previos</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {provider.photos.map((photo: string, i: number) => (
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    key={i} 
                    className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-slate-100 relative group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                       <Search className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    <img src={photo} alt="Portafolio" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-yellow-50 flex items-center justify-center rounded-[1.5rem]">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <h3 className="text-2xl font-[900] text-slate-900 tracking-tight">Reseñas</h3>
              </div>
              
              <div className="space-y-6">
                {provider.reviews.map((r: any, i: number) => (
                  <div key={r.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-[900] text-slate-700 shadow-sm">
                           {r.author.charAt(0)}
                         </div>
                         <div>
                           <div className="font-[900] text-slate-900 text-sm">{r.author}</div>
                           <div className="flex items-center gap-0.5 mt-0.5">
                             {Array.from({length: 5}).map((_, j) => (
                                <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                             ))}
                           </div>
                         </div>
                       </div>
                       <div className="text-xs font-bold text-slate-400">{r.date}</div>
                    </div>
                    <p className="text-slate-600 text-[15px] font-medium leading-relaxed md:ml-13">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col - Sticky CTA */}
          <div className="col-span-1 lg:col-span-4 fixed bottom-0 left-0 w-full lg:static lg:w-auto p-4 lg:p-0 bg-white lg:bg-transparent border-t lg:border-none z-40 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] lg:shadow-none">
            <div className="lg:sticky lg:top-12 bg-white rounded-[3rem] lg:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] lg:border border-slate-100 lg:p-10 p-2 max-w-5xl mx-auto overflow-hidden">
              {!isQuoting ? (
                <>
                  <div className="hidden lg:block text-center mb-6">
                    <h3 className="font-[900] text-2xl text-slate-900 mb-2 tracking-tight">¿Interesado?</h3>
                    <p className="text-slate-500 text-[15px] font-bold leading-relaxed">
                      Escríbele para recibir una propuesta formal y comenzar a trabajar juntos.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setIsQuoting(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-[900] rounded-3xl hover:bg-blue-700 transition-all mb-4 shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-5 h-5" /> 
                    <span>Pedir Cotización</span>
                  </button>

                  <div className="hidden lg:flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Contacto seguro</span>
                  </div>
                </>
              ) : (
                <AnimatePresence mode="wait">
                  {quoteStatus === "success" ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="font-[900] text-2xl text-slate-900 mb-3 tracking-tight">¡Enviado!</h3>
                      <p className="text-slate-500 font-bold mb-8 text-[15px] max-w-[250px] mx-auto leading-relaxed">
                        El proveedor se pondrá en contacto pronto.
                      </p>
                      <button 
                        onClick={() => { setIsQuoting(false); setQuoteStatus("idle"); setQuoteBody(""); }}
                        className="text-blue-600 font-[900] hover:text-blue-800 transition-colors w-full py-3 bg-blue-50 rounded-[1.5rem]"
                      >
                        Volver
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-[900] text-xl text-slate-900 tracking-tight">Redactar Mensaje</h3>
                        <button onClick={() => setIsQuoting(false)} className="text-slate-400 hover:bg-slate-50 hover:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold transition-all">
                          Cerrar
                        </button>
                      </div>

                      {showAiInput ? (
                        <div className="mb-6 p-5 rounded-[2rem] border border-purple-100 bg-purple-50 shadow-inner">
                           <div className="flex items-center gap-2 mb-3 text-purple-700 font-[900] text-sm uppercase tracking-widest">
                             <Sparkles className="w-4 h-4 fill-purple-700" /> Asistente IA
                           </div>
                           <textarea
                             autoFocus
                             value={aiIdea}
                             onChange={(e) => setAiIdea(e.target.value)}
                             placeholder="¿Qué necesitas? Ej: Quiero un logo minimalista..."
                             className="w-full p-4 border-2 border-transparent rounded-[1.5rem] focus:border-purple-600/20 focus:outline-none text-[15px] font-bold mb-4 resize-none bg-white shadow-sm placeholder:text-slate-300"
                             rows={3}
                           ></textarea>
                           <div className="flex justify-between items-center">
                             <button onClick={() => setShowAiInput(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all">Cancelar</button>
                             <button 
                               onClick={handleGenerateDraft}
                               disabled={isAiDrafting || !aiIdea.trim()}
                               className="px-6 py-2 text-sm font-[900] bg-purple-600 text-white rounded-[1.5rem] flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                             >
                               {isAiDrafting ? "Generando..." : "Borrador"}
                             </button>
                           </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <button 
                            onClick={() => setShowAiInput(true)}
                            className="w-full justify-center text-sm font-bold text-purple-700 bg-purple-50 border border-purple-100 px-4 py-4 rounded-[1.5rem] flex items-center gap-2 hover:bg-purple-100 transition-all shadow-sm active:scale-[0.98]"
                          >
                            <Sparkles className="w-4 h-4" /> Escribir con IA
                          </button>
                        </div>
                      )}

                      <div className="relative mb-6">
                        <textarea 
                          value={quoteBody}
                          onChange={(e) => setQuoteBody(e.target.value)}
                          placeholder="Hola, me gustaría solicitar una cotización para..."
                          className="w-full min-h-[160px] p-6 border-2 border-slate-50 rounded-[2rem] focus:border-blue-600/20 focus:outline-none resize-none text-[15px] text-slate-800 font-bold bg-slate-50/50 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                        ></textarea>
                      </div>
                      
                      <button 
                        disabled={quoteStatus === "loading" || quoteBody.trim() === ""}
                        onClick={handleSendQuote}
                        className="w-full flex items-center justify-center gap-2 py-5 px-6 bg-slate-900 text-white font-[900] rounded-[2rem] hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-[0.98] shadow-2xl"
                      >
                        {quoteStatus === "loading" ? 'Enviando...' : <><Send className="w-5 h-5 stroke-[3]" /> Enviar Solicitud</>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
