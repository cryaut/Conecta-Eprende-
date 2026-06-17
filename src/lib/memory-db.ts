// src/lib/memory-db.ts

export const providers = [
  { id: "1", displayName: "Estudio Creativo Managua", bio: "Somos un estudio especializado en branding, diseño de interfaces y marketing digital para pymes en Nicaragua. Llevamos más de 5 años transformando marcas locales en referentes regionales.", category: "Diseño Gráfico", city: "Managua", lat: 12.1328, lng: -86.2504, score: 92, availability: "DISPONIBLE", responseTimeHrs: 2.5, photos: ["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1542744094-24638ea0b5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"], verified: true, formalizationStatus: "MIPYME_REGISTRADO", reviews: [{ id: "r1", author: "Juan P.", rating: 5, text: "Excelente trabajo con el logo de mi restaurante.", date: "Hace 2 semanas" }, { id: "r2", author: "María C.", rating: 4, text: "Muy profesionales.", date: "Hace 1 mes" }] },
  { id: "2", displayName: "Plomería El Rápido", bio: "Servicio de plomería urgente. Atendemos fugas, destape de tuberías y más.", category: "Plomería", city: "León", lat: 12.4346, lng: -86.8796, score: 85, availability: "OCUPADO", responseTimeHrs: 1, photos: [], verified: false, formalizationStatus: "INFORMAL", reviews: [] },
  { id: "3", displayName: "Muebles Artesanales", bio: "Fabricación de muebles finos de madera. Diseños a la medida.", category: "Carpintería", city: "Granada", lat: 11.9344, lng: -85.9560, score: 96, availability: "DISPONIBLE", responseTimeHrs: 48, photos: [], verified: true, formalizationStatus: "CONSTITUIDO", reviews: [] }
];

export const quotes = [
  {
    id: "t1",
    providerId: "1",
    subject: "Diseño de Menú para Restaurante",
    clientName: "Hotel Estrella",
    clientAvatar: "HE",
    status: "OPEN",
    date: "Ayer",
    messages: [
      { id: "m1", author: "client", text: "Hola, necesito el diseño de un menú de 4 páginas. Queremos algo moderno, similar a nuestro branding actual.", time: "10:00 AM" },
      { id: "m2", author: "provider", text: "¡Claro! El costo aproximado es de 3000 NIO. Te puedo preparar un par de bocetos iniciales sin compromiso para que veas la línea gráfica.", time: "11:30 AM" },
      { id: "m3", author: "client", text: "Me parece perfecto. ¿Para cuándo los tendrías?", time: "1:00 PM" }
    ]
  },
  {
    id: "t2",
    providerId: "1",
    subject: "Campaña en Redes Sociales",
    clientName: "Café Verde",
    clientAvatar: "CV",
    status: "CLOSED",
    date: "Hace 1 semana",
    messages: [
      { id: "m4", author: "client", text: "Quisiéramos una campaña para el día de la madre.", time: "09:00 AM" },
      { id: "m5", author: "provider", text: "Te propongo un paquete de 10 posts y $50 en pauta.", time: "10:00 AM" }
    ]
  }
];

export const formalizations: Record<string, any[]> = {
  "1": [
      { id: "mific", title: "Registro en MIFIC", description: "Inscripción en el Ministerio de Fomento, Industria y Comercio. Protege tu marca comercial.", status: "completed" },
      { id: "dgi", title: "Inscripción DGI (RUC)", description: "Obtención del Registro Único del Contribuyente para operar formalmente.", status: "current" },
      { id: "alcaldia", title: "Matrícula de Alcaldía", description: "Inscripción en la municipalidad local para tu licencia de operaciones.", status: "pending" },
      { id: "inss", title: "Registro Patronal INSS", description: "Apertura de registro para beneficios de seguridad social de empleados.", status: "pending" }
  ]
};

export function updateFormalizationStep(providerId: string, stepId: string, status: string) {
  if (!formalizations[providerId]) return false;
  
  const rules = formalizations[providerId];
  let nextCurrentIndex = -1;
  let didUpdate = false;

  for (let i = 0; i < rules.length; i++) {
    if (rules[i].id === stepId) {
      rules[i].status = status;
      didUpdate = true;
      if (status === 'completed') {
         nextCurrentIndex = i + 1;
      }
    }
  }

  // Auto advance next pending step to current
  if (nextCurrentIndex !== -1 && nextCurrentIndex < rules.length) {
     if (rules[nextCurrentIndex].status === 'pending') {
        rules[nextCurrentIndex].status = 'current';
     }
  }

  return didUpdate;
}
