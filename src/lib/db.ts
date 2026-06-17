// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | any };

export const prisma = globalForPrisma.prisma || (process.env.DATABASE_URL ? new PrismaClient({
    log: ['query'],
}) : {
    provider: {
        findMany: async () => { throw new Error("DATABASE_URL no configurada"); },
        findUnique: async () => { throw new Error("DATABASE_URL no configurada"); }
    },
    quoteThread: {
        create: async () => { throw new Error("DATABASE_URL no configurada"); }
    }
});

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
    globalForPrisma.prisma = prisma;
}

