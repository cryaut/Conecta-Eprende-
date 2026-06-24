import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean DB
  await prisma.quoteMessage.deleteMany();
  await prisma.quoteThread.deleteMany();
  await prisma.formalizationChecklist.deleteMany();
  await prisma.trustScore.deleteMany();
  await prisma.review.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaning finished.');

  // Create Users
  const clientUser = await prisma.user.create({
    data: {
      id: 'client-user',
      email: 'cliente@ejemplo.com',
      name: 'Cliente de Prueba',
      role: 'USER'
    }
  });

  const providerUser1 = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'estudio@managua.ni',
      name: 'Estudio Creativo',
      role: 'PROVIDER'
    }
  });

  const providerUser2 = await prisma.user.create({
    data: {
      id: 'user-2',
      email: 'plomeria@leon.ni',
      name: 'Plomero Rápido',
      role: 'PROVIDER'
    }
  });

  const providerUser3 = await prisma.user.create({
    data: {
      id: 'user-3',
      email: 'carpinteria@granada.ni',
      name: 'Muebles Artesanales',
      role: 'PROVIDER'
    }
  });

  // Providers
  const p1 = await prisma.provider.create({
    data: {
      id: '1',
      userId: 'user-1',
      displayName: 'Estudio Creativo Managua',
      bio: 'Somos un estudio especializado en branding, diseño de interfaces y marketing digital para pymes en Nicaragua.',
      category: 'Diseño Gráfico',
      city: 'MANAGUA',
      lat: 12.1328,
      lng: -86.2504,
      availability: 'DISPONIBLE',
      responseTimeHrs: 2.5,
      verified: true,
      formalizationStatus: 'MIPYME_REGISTRADO',
      profileCompleteness: 90,
      photos: JSON.stringify(["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800","https://images.unsplash.com/photo-1542744094-24638ea0b5b5?w=800"])
    }
  });

  const p2 = await prisma.provider.create({
    data: {
      id: '2',
      userId: 'user-2',
      displayName: 'Plomería El Rápido',
      bio: 'Servicio de plomería urgente. Atendemos fugas, destape de tuberías y más.',
      category: 'Plomería',
      city: 'LEON',
      lat: 12.4346,
      lng: -86.8796,
      availability: 'OCUPADO',
      responseTimeHrs: 1,
      verified: false,
      formalizationStatus: 'INFORMAL'
    }
  });

  const p3 = await prisma.provider.create({
    data: {
      id: '3',
      userId: 'user-3',
      displayName: 'Muebles Artesanales',
      bio: 'Fabricación de muebles finos de madera. Diseños a la medida.',
      category: 'Carpintería',
      city: 'GRANADA',
      lat: 11.9344,
      lng: -85.9560,
      availability: 'DISPONIBLE',
      responseTimeHrs: 48,
      verified: true,
      formalizationStatus: 'MIPYME_REGISTRADO'
    }
  });

  // TrustScores
  await prisma.trustScore.create({
    data: {
      providerId: '1',
      scoreCompleteness: 90,
      scoreTransactions: 85,
      scoreResponseTime: 95,
      scoreReviews: 92,
      scoreFormalization: 100,
      finalScore: 92
    }
  });

  await prisma.trustScore.create({
    data: {
      providerId: '2',
      scoreCompleteness: 60,
      scoreTransactions: 80,
      scoreResponseTime: 100,
      scoreReviews: 0,
      scoreFormalization: 40,
      finalScore: 85
    }
  });

  await prisma.trustScore.create({
    data: {
      providerId: '3',
      scoreCompleteness: 95,
      scoreTransactions: 90,
      scoreResponseTime: 70,
      scoreReviews: 0,
      scoreFormalization: 100,
      finalScore: 96
    }
  });

  // Formalization
  await prisma.formalizationChecklist.create({
    data: {
      providerId: '1',
      steps: JSON.stringify([
        { id: "mific", title: "Registro en MIFIC", description: "Inscripción en el Ministerio de Fomento, Industria y Comercio.", status: "completed" },
        { id: "dgi", title: "Inscripción DGI (RUC)", description: "Obtención del Registro Único del Contribuyente.", status: "current" },
        { id: "alcaldia", title: "Matrícula de Alcaldía", description: "Inscripción en la municipalidad local.", status: "pending" }
      ])
    }
  });

  // Quotes
  const q1 = await prisma.quoteThread.create({
    data: {
      id: 't1',
      senderId: 'client-user',
      providerId: '1',
      subject: 'Diseño de Menú para Restaurante',
      status: 'OPEN'
    }
  });

  await prisma.quoteMessage.createMany({
    data: [
      { threadId: 't1', authorId: 'client-user', body: 'Hola, necesito el diseño de un menú de 4 páginas.' },
      { threadId: 't1', authorId: 'user-1', body: '¡Claro! El costo aproximado es de 3000 NIO.' },
      { threadId: 't1', authorId: 'client-user', body: 'Me parece perfecto. ¿Para cuándo los tendrías?' }
    ]
  });

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
