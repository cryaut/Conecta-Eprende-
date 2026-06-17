import { CheckCircle, Circle, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FormalizationStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending" | "informal";
}

export default function FormalizationPage() {
  const providerId = "1"; // In a real app this comes from auth context
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['formalization', providerId],
    queryFn: async () => {
      const res = await fetch(`/api/providers/${providerId}/formalization`);
      const json = await res.json();
      return json.data.steps as FormalizationStep[];
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (stepId: string) => {
      const res = await fetch(`/api/providers/${providerId}/formalization`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ providerId: providerId, stepId, status: "completed" })
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formalization', providerId] });
    }
  });

  const steps = data || [];

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Cargando rutas de formalización...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Mi Ruta de Formalización</h1>
        <p className="text-slate-600 max-w-2xl text-lg">
          Te guiamos paso a paso para legalizar tu emprendimiento en Nicaragua. Un negocio formal genera más confianza y aumenta tu Trust Score.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-10 mb-8">
        <h2 className="font-bold text-xl text-slate-900 mb-8">Progreso actual</h2>
        
        <div className="relative">
          {/* Vertical line connector */}
          <div className="absolute left-[23px] top-4 bottom-10 w-0.5 bg-slate-100"></div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              
              return (
                <div key={step.id} className="relative flex items-start gap-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-600' : 'bg-slate-200'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5 text-white" /> : <div className={`font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}>{index + 1}</div>}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 pt-2 pb-6 ${index !== steps.length -1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <h3 className={`font-bold text-lg ${isCurrent ? 'text-blue-700' : 'text-slate-900'}`}>
                        {step.title}
                      </h3>
                      {isCompleted && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 w-fit"><CheckCircle className="w-3.5 h-3.5" /> Completado</span>}
                      {isCurrent && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 w-fit">En proceso</span>}
                    </div>
                    <p className="text-slate-600 text-sm mb-4 max-w-xl">{step.description}</p>
                    
                    {isCurrent && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4">
                        <h4 className="font-bold text-sm text-slate-900 mb-2">Siguiente acción requerida:</h4>
                        <p className="text-sm text-slate-600 mb-4">Debes presentarte a la administración de rentas con tu cédula y recibo de luz para solicitar tu número RUC.</p>
                        <button 
                          onClick={() => mutation.mutate(step.id)}
                          disabled={mutation.isPending}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {mutation.isPending ? "Actualizando..." : "Marcar como completado"} <ArrowRight className="w-4 h-4"/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-indigo-900">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 opacity-70" /> Impacto en tu Trust Score
        </h3>
        <p className="text-sm opacity-80">
          Completar la inscripción en la DGI sumará <strong>+15 puntos</strong> a tu nivel de confianza en la plataforma, destacándote frente a clientes corporativos.
        </p>
      </div>

    </div>
  );
}
