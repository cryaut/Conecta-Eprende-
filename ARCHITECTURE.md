# Conecta Emprende AI — Arquitectura Técnica Completa

> Documento de arquitectura original proporcionado por el usuario. Optimizado para: equipo pequeño, presupuesto cero, hackathon de 48h, y contexto nicaragüense.

## 1. Stack Overview

| Capa | Tecnología |
|---|---|
| **Frontend Framework** | React (Vite - Adaptado de Next.js por entorno) |
| **Lenguaje FE/BE** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui (conceptos) |
| **State (cliente)** | Zustand |
| **Mapas** | Leaflet + react-leaflet + OpenStreetMap |
| **Backend Framework** | Node.js + Express (Adaptado de Next.js API Routes) |
| **DB / ORM** | PostgreSQL + Prisma + PostGIS |
| **Auth** | (Planeado) |
| **LLM primario** | Groq API (Llama 3.1 70B) / Gemini |

## 2. Frontend
- Zustand para estado global (`useSearchStore`).
- Leaflet para mapas sin API Key.
- Tailwind para utilidades.

## 3. Database (Prisma)
- Proveedores, Usuarios, Cotizaciones, Reviews.
- Soporte para extensiones espaciales (PostGIS).

## 4. AI/LLM Integration
- Extracción de intenciones (Intent Extraction) usando Groq/Gemini con falback a keywords.

## 5. Fases de Desarrollo (Checklist)
1. Setup inicial de entorno, dependencias y arquitectura.
2. Core UI y mapa interactivo (Vista dividida).
3. Backend (Vite + Express) y base de datos (Prisma).
4. Cotizaciones y formalización.
5. Capa AI (Groq/Gemini).
