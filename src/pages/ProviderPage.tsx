import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, ShieldCheck, Clock, MessageSquare, ArrowLeft, Send, Sparkles, CheckCircle } from "lucide-react";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-y-auto bg-slate-50 selection:bg-blue-100 selection:text-blue-900"
    >
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 relative">
        <Link to="/buscar" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a la búsqueda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Col - Profile details */}
          <div className="col-span-1 lg:col-span-8 space-y-10 pb-32 lg:pb-10">
            {/* Header section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                      {provider.displayName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-[15px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" /> {provider.city}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> {provider.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50 rounded-2xl items-center gap-2 font-bold shadow-sm">
                      <ShieldCheck className="w-5 h-5" /> Trust Score: {provider.score}
                    </div>
                    {provider.verified && (
                      <span className="text-xs font-bold uppercase tracking-wider text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Verificado
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose prose-slate prose-p:leading-relaxed prose-p:text-slate-600 max-w-none mb-8 text-[15px]">
                  <p>{provider.bio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
                  <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Disponibilidad</span>
                    <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                      <span className={`w-2.5 h-2.5 shadow-sm rounded-full ${provider.availability === 'DISPONIBLE' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                      {provider.availability}
                    </div>
                  </div>
                  <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Respuesta</span>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-blue-500" /> {provider.responseTimeHrs} hrs
                    </div>
                  </div>
                  <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estado</span>
                    <div className="font-bold text-slate-900 text-sm">
                      {provider.formalizationStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Grid */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden p-8 md:p-10">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Portafolio Destacado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {provider.photos.map((photo: string, i: number) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={i} 
                    className="aspect-video rounded-2xl overflow-hidden bg-slate-100 relative group cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img src={photo} alt="Portafolio" className="object-cover w-full h-full" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-yellow-50 flex items-center justify-center rounded-xl">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Reseñas</h3>
              </div>
              
              <div className="space-y-6">
                {provider.reviews.map((r: any, i: number) => (
                  <div key={r.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm">
                           {r.author.charAt(0)}
                         </div>
                         <div>
                           <div className="font-bold text-slate-900 text-sm">{r.author}</div>
                           <div className="flex items-center gap-0.5 mt-0.5">
                             {Array.from({length: 5}).map((_, j) => (
                                <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                             ))}
                           </div>
                         </div>
                       </div>
                       <div className="text-xs font-semibold text-slate-400">{r.date}</div>
                    </div>
                    <p className="text-slate-600 text-[15px] leading-relaxed md:ml-13">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col - Sticky CTA */}
          <div className="col-span-1 lg:col-span-4 fixed bottom-0 left-0 w-full lg:static lg:w-auto p-4 lg:p-0 bg-white lg:bg-transparent border-t lg:border-none z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
            <div className="lg:sticky lg:top-8 bg-white rounded-[2rem] lg:shadow-xl lg:shadow-slate-200/50 lg:border border-slate-200 lg:p-8 p-2 max-w-5xl mx-auto">
              {!isQuoting ? (
                <>
                  <div className="hidden lg:block text-center mb-6">
                    <h3 className="font-extrabold text-2xl text-slate-900 mb-2 tracking-tight">¿Interesado?</h3>
                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                      Escríbele para recibir una propuesta formal y comenzar a trabajar juntos.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setIsQuoting(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all mb-4 shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-5 h-5" /> 
                    <span>Pedir Cotización</span>
                  </button>

                  <div className="hidden lg:flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Transacción y contacto seguros</span>
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
                      <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="font-extrabold text-2xl text-slate-900 mb-3 tracking-tight">¡Enviado con Éxito!</h3>
                      <p className="text-slate-500 font-medium mb-8 text-[15px] max-w-[250px] mx-auto leading-relaxed">
                        El proveedor ha sido notificado y se pondrá en contacto pronto.
                      </p>
                      <button 
                        onClick={() => { setIsQuoting(false); setQuoteStatus("idle"); setQuoteBody(""); }}
                        className="text-blue-600 font-bold hover:text-blue-800 transition-colors w-full py-3 bg-blue-50 rounded-xl"
                      >
                        Enviar otro mensaje
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Redactar Mensaje</h3>
                        <button onClick={() => setIsQuoting(false)} className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                          Cancelar
                        </button>
                      </div>

                      {showAiInput ? (
                        <div className="mb-6 p-5 rounded-2xl border border-purple-200 bg-purple-50 shadow-inner">
                           <div className="flex items-center gap-2 mb-3 text-purple-700 font-extrabold text-sm tracking-tight">
                             <Sparkles className="w-4 h-4 fill-purple-700" /> Asistente de IA
                           </div>
                           <textarea
                             autoFocus
                             value={aiIdea}
                             onChange={(e) => setAiIdea(e.target.value)}
                             placeholder="¿Qué necesitas? Ej: Quiero un logo minimalista..."
                             className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-[15px] font-medium mb-4 resize-none bg-white shadow-sm placeholder:text-slate-400"
                             rows={3}
                           ></textarea>
                           <div className="flex justify-between items-center">
                             <button onClick={() => setShowAiInput(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cerrar</button>
                             <button 
                               onClick={handleGenerateDraft}
                               disabled={isAiDrafting || !aiIdea.trim()}
                               className="px-5 py-2 text-sm font-bold bg-purple-600 text-white rounded-xl flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md hover:shadow-purple-600/30 active:scale-95"
                             >
                               {isAiDrafting ? "Generando..." : "Borrador"}
                             </button>
                           </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <button 
                            onClick={() => setShowAiInput(true)}
                            className="w-full justify-center text-sm font-bold text-purple-700 bg-purple-50 border border-purple-100 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-purple-100 transition-all shadow-sm active:scale-[0.98]"
                          >
                            <Sparkles className="w-4 h-4" /> Escribir usando Inteligencia Artificial
                          </button>
                        </div>
                      )}

                      <div className="relative mb-6">
                        <textarea 
                          value={quoteBody}
                          onChange={(e) => setQuoteBody(e.target.value)}
                          placeholder="Hola, me gustaría solicitar una cotización para..."
                          className="w-full min-h-[160px] p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none resize-none text-[15px] text-slate-700 font-medium bg-slate-50 focus:bg-white transition-all shadow-inner placeholder:font-normal"
                        ></textarea>
                      </div>
                      
                      <button 
                        disabled={quoteStatus === "loading" || quoteBody.trim() === ""}
                        onClick={handleSendQuote}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg hover:shadow-slate-900/20"
                      >
                        {quoteStatus === "loading" ? 'Enviando...' : <><Send className="w-5 h-5 -ml-1" /> Enviar Solicitud</>}
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
