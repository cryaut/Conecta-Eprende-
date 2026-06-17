import { z } from 'zod';

export const quoteDraftRequestSchema = z.object({
  idea: z.string().min(5, "La idea debe tener al menos 5 caracteres"),
  providerName: z.string().min(1, "El nombre del proveedor es obligatorio"),
});

export const quoteRequestSchema = z.object({
  providerId: z.string().min(1, "providerId es obligatorio"),
  subject: z.string().optional(),
  body: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export const searchProviderSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
});

export const aiSearchProviderSchema = z.object({
  query: z.string().min(2, "La consulta debe tener al menos 2 caracteres"),
});

export const formalizationUpdateSchema = z.object({
  providerId: z.string(),
  stepId: z.string(),
  status: z.enum(["completed", "current", "pending", "informal"]),
});

export const enhanceBioSchema = z.object({
  bio: z.string().min(10, "La biografía debe tener al menos 10 caracteres"),
  category: z.string()
});
