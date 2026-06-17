import { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle, ChevronLeft, Paperclip, MoreVertical, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function QuotesPage() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const res = await fetch('/api/quotes');
      const json = await res.json();
      return json.data || [];
    }
  });

  const activeThread = threads.find((t: any) => t.id === activeThreadId);

  useEffect(() => {
    if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const sendMutation = useMutation({
    mutationFn: async ({ threadId, text }: { threadId: string, text: string }) => {
       const res = await fetch(`/api/quotes/${threadId}/messages`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ text })
       });
       return res.json();
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['quotes'] });
    }
  });

  const closeMutation = useMutation({
    mutationFn: async (threadId: string) => {
       const res = await fetch(`/api/quotes/${threadId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: 'CLOSED' })
       });
       return res.json();
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['quotes'] });
    }
  });

  const filteredThreads = threads.filter((t: any) => 
    t.clientName.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Cargando sala de chat...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 overflow-hidden relative">
      {/* Threads List Sidebar */}
      <AnimatePresence initial={false}>
        {(!activeThread || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={`w-full md:w-[350px] lg:w-[400px] h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 absolute md:static`}
          >
            <div className="p-5 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">Cotizaciones</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar mensajes..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto w-full">
              {filteredThreads.map((thread: any) => (
                <button 
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left p-5 transition-all outline-none border-l-4 ${
                    activeThread?.id === thread.id 
                      ? 'bg-blue-50/60 border-blue-600' 
                      : 'border-transparent hover:bg-slate-50 focus-visible:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                         thread.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {thread.clientAvatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[15px]">{thread.clientName}</div>
                        <div className="text-xs font-semibold text-slate-500">{thread.date}</div>
                      </div>
                    </div>
                  </div>
                  <div className="pl-13">
                    <div className="text-sm font-semibold text-slate-700 truncate mb-1.5">{thread.subject}</div>
                    <div className="text-xs text-slate-500 truncate max-w-full">
                      {thread.messages[thread.messages.length -1].text}
                    </div>
                    <div className="mt-3">
                      {thread.status === 'OPEN' 
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3"/> Activo</span>
                        : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> Cerrado</span>
                      }
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#F8FAFC] h-full ${!activeThread ? 'hidden md:flex' : 'flex'} relative z-10 w-full`}>
        {activeThread ? (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center shrink-0 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveThreadId(null)} 
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {activeThread.clientAvatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{activeThread.clientName}</h3>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {activeThread.subject}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeThread.status === 'OPEN' && (
                  <button 
                    onClick={() => closeMutation.mutate(activeThread.id)}
                    disabled={closeMutation.isPending}
                    className="text-sm font-bold text-slate-700 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors hidden sm:block disabled:opacity-50"
                  >
                    {closeMutation.isPending ? "Cerrando..." : "Marcar como completado"}
                  </button>
                )}
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                   <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              <div className="text-center text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
                INICIO DE LA CONVERSACIÓN
              </div>
              
              {activeThread.messages.map((msg: any, i: number) => {
                const isMine = msg.author === 'provider';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    key={msg.id} 
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                      {!isMine && (
                         <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                           {activeThread.clientAvatar}
                         </div>
                      )}
                      <div>
                        <div className={`rounded-3xl px-5 py-3.5 text-[15px] shadow-sm leading-relaxed ${
                          isMine 
                            ? 'bg-blue-600 border border-blue-700/50 text-white rounded-br-sm' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`text-xs font-semibold text-slate-400 mt-1.5 ${isMine ? 'text-right pr-1' : 'pl-1'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <button className="w-12 h-12 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={activeThread.status === 'CLOSED'}
                    placeholder={activeThread.status === 'CLOSED' ? "Esta cotización ha sido cerrada." : "Escribe tu respuesta comercial..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl pl-5 pr-14 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:bg-slate-100 font-medium resize-none max-h-32 shadow-sm transition-all"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (reply.trim() && activeThread.status !== 'CLOSED') {
                           setReply(""); // Reset on send
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if(reply.trim() && activeThread.status !== 'CLOSED') {
                        sendMutation.mutate({ threadId: activeThread.id, text: reply });
                        setReply("");
                      }
                    }}
                    disabled={activeThread.status === 'CLOSED' || !reply.trim() || sendMutation.isPending}
                    className="absolute right-2 bottom-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all shadow-md"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
               <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-700 mb-2">Tus Cotizaciones</h3>
            <p className="font-medium text-slate-500">Selecciona un mensaje del panel para comenzar a responder.</p>
          </div>
        )}
      </div>
    </div>
  );
}
