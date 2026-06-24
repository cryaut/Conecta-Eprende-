import { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle, ChevronLeft, Paperclip, MoreVertical, Search, Archive, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function QuotesPage() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ threadId, status }: { threadId: string, status: string }) => {
       const res = await fetch(`/api/quotes/${threadId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status })
       });
       return res.json();
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['quotes'] });
    }
  });

  const filteredThreads = threads.filter((t: any) => {
    const matchesSearch = t.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

              <div className="flex gap-2 mb-4">
                 {(['ALL', 'OPEN', 'CLOSED'] as const).map(f => (
                   <button
                     key={f}
                     onClick={() => setStatusFilter(f)}
                     className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                   >
                     {f === 'ALL' ? 'Todas' : f === 'OPEN' ? 'Activas' : 'Cerradas'}
                   </button>
                 ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                      ? 'bg-blue-50/60 border-blue-600 shadow-inner'
                      : 'border-transparent hover:bg-slate-50'
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
                      {thread.messages[thread.messages.length -1]?.text}
                    </div>
                  </div>
                </button>
              ))}
              {filteredThreads.length === 0 && (
                 <div className="p-10 text-center text-slate-400 font-medium">No se encontraron cotizaciones.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#F8FAFC] h-full ${!activeThread ? 'hidden md:flex' : 'flex'} relative z-10 w-full`}>
        {activeThread ? (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveThreadId(null)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{activeThread.clientAvatar}</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{activeThread.clientName}</h3>
                    <div className="text-sm font-medium text-slate-500">{activeThread.subject}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeThread.status === 'OPEN' ? (
                  <button 
                    onClick={() => updateStatusMutation.mutate({ threadId: activeThread.id, status: 'CLOSED' })}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full border border-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Resolver
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatusMutation.mutate({ threadId: activeThread.id, status: 'OPEN' })}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full border border-blue-100 transition-all flex items-center gap-2"
                  >
                    Reabrir
                  </button>
                )}
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              {activeThread.messages.map((msg: any, i: number) => {
                const isMine = msg.author === 'provider';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-5 py-3 text-[15px] shadow-sm max-w-[80%] ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{msg.time}</div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={activeThread.status === 'CLOSED'}
                  placeholder={activeThread.status === 'CLOSED' ? "Conversación cerrada." : "Escribe un mensaje..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium h-12 flex items-center"
                />
                <button
                  onClick={() => { if(reply.trim()) { sendMutation.mutate({ threadId: activeThread.id, text: reply }); setReply(""); } }}
                  disabled={activeThread.status === 'CLOSED' || !reply.trim()}
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 transition-all shadow-lg active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">Selecciona un mensaje.</div>
        )}
      </div>
    </div>
  );
}
