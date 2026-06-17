import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { prisma } from "./src/lib/db";
import { extractIntent } from "./src/lib/ai/extract-intent";
import { generateQuoteDraft } from "./src/lib/ai/quote-draft";
import { generateEnhancedBio } from "./src/lib/ai/enhance-bio";
import { 
  quoteDraftRequestSchema, 
  quoteRequestSchema, 
  searchProviderSchema, 
  aiSearchProviderSchema,
  enhanceBioSchema,
  formalizationUpdateSchema
} from "./src/lib/api-schema";

import {
  providers,
  quotes,
  formalizations,
  updateFormalizationStep
} from "./src/lib/memory-db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body Parsing Middleware
  app.use(express.json());

  // === API ROUTES (Mounted FIRST) ===
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GET Providers Search
  app.get("/api/providers/search", async (req, res) => {
    try {
      const parsed = searchProviderSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Parámetros de búsqueda inválidos", details: parsed.error.issues });
      }
      const { q, city, n, s, e, w } = parsed.data;
      
      // Map memory providers slightly adjusting their properties to match Prisma types where requested
      const results = providers.filter(p => {
        let match = true;
        if (city) {
          match = match && p.city.toUpperCase() === city.toUpperCase();
        }
        if (q) {
          const lowerQ = q.toLowerCase();
          match = match && (p.displayName.toLowerCase().includes(lowerQ) || p.category.toLowerCase().includes(lowerQ));
        }

        // Bounding box filter
        if (n && s && e && w) {
          const north = parseFloat(n);
          const south = parseFloat(s);
          const east = parseFloat(e);
          const west = parseFloat(w);

          match = match && (p.lat <= north && p.lat >= south && p.lng <= east && p.lng >= west);
        }

        return match;
      });

      res.json({ success: true, data: results });
    } catch (error) {
      res.json({ success: false, error: "Internal Error" });
    }
  });

  // POST Providers AI Search
  app.post("/api/providers/ai-search", async (req, res) => {
    try {
      const parsed = aiSearchProviderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Solicitud inválida", details: parsed.error.issues });
      }
      const { query } = parsed.data;

      const intent = await extractIntent(query);
      
      const filters: any = {};
      if (intent.city) {
        filters.city = intent.city.toUpperCase().trim();
      }
      if (intent.category) {
        filters.category = { contains: intent.category, mode: 'insensitive' };
      } else if (intent.keywords && intent.keywords.length > 0) {
        // Fallback or broader search
        filters.OR = [
          { displayName: { contains: intent.keywords[0], mode: 'insensitive' } },
          { category: { contains: intent.keywords[0], mode: 'insensitive' } }
        ];
      }

      let results = providers;
      if (intent.city) {
         results = results.filter(p => p.city.toUpperCase() === intent.city!.toUpperCase());
      }
      if (intent.category) {
         results = results.filter(p => p.category.toLowerCase().includes(intent.category!.toLowerCase()));
      } else if (intent.keywords && intent.keywords.length > 0) {
         const kw = intent.keywords[0].toLowerCase();
         results = results.filter(p => p.displayName.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw));
      }

      res.json({ success: true, intent, data: results });

    } catch (error) {
      res.json({ success: false, error: "Internal Error" });
    }
  });

  // GET Provider by ID
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = providers.find(p => p.id === req.params.id);
      if (!provider) return res.status(404).json({ success: false, message: "No encontrado" });
      
      res.json({ success: true, data: provider });
    } catch (error) {
       res.status(500).json({ success: false });
    }
  });

  // GET Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const activeQuotes = quotes.filter(q => q.providerId === "1");
      res.json({ success: true, data: activeQuotes });
    } catch (error) {
       res.json({ success: false });
    }
  });

  // POST Generate AI Quote Draft (Left intact as it hits external API or mocked local)
  app.post("/api/quotes/draft", async (req, res) => {
    try {
      const parsed = quoteDraftRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Campos inválidos", details: parsed.error.issues });
      }
      const { idea, providerName } = parsed.data;

      const draft = await generateQuoteDraft(idea, providerName);
      res.json({ success: true, draft });
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error al intentar redactar la cotización. Por favor, intenta de nuevo." });
    }
  });

  // POST Request Quote
  app.post("/api/quotes", async (req, res) => {
    try {
      const parsed = quoteRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Faltan campos obligatorios", details: parsed.error.issues });
      }
      
      const { providerId, subject, body } = parsed.data;

      const newQuote = {
        id: "t" + Date.now(),
        providerId: providerId,
        subject: subject || "Solicitud de cotización",
        clientName: "Cliente Nuevo",
        clientAvatar: "CN",
        status: "OPEN",
        date: "Justo ahora",
        messages: [
          { id: "m" + Date.now(), author: "client", text: body, time: "Ahora" }
        ]
      };
      
      quotes.unshift(newQuote);
      res.json({ success: true, data: newQuote });
    } catch (error: any) {
      res.json({ success: false, error: "Internal Error" });
    }
  });

  // POST Message to Quote Thread
  app.post("/api/quotes/:id/messages", async (req, res) => {
    try {
      const threadId = req.params.id;
      const thread = quotes.find(q => q.id === threadId);
      if (!thread) return res.status(404).json({ error: "Thread not found" });

      const newMsg = {
         id: "m" + Date.now(),
         author: req.body.author || 'provider',
         text: req.body.text,
         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      thread.messages.push(newMsg);
      res.json({ success: true, data: newMsg });
    } catch (e) {
      res.status(500).json({ error: "Server Error" });
    }
  });

  // PUT Update Quote Thread Status
  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const thread = quotes.find(q => q.id === req.params.id);
      if (!thread) return res.status(404).json({ error: "Thread not found" });

      if (req.body.status) {
         thread.status = req.body.status;
      }
      res.json({ success: true, data: thread });
    } catch (e) {
      res.status(500).json({ error: "Server Error" });
    }
  });

  // POST Generate AI Enhanced Bio
  app.post("/api/providers/enhance-bio", async (req, res) => {
    try {
      const parsed = enhanceBioSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Campos inválidos", details: parsed.error.issues });
      }
      const { bio, category } = parsed.data;

      const enhanced = await generateEnhancedBio(bio, category);
      res.json({ success: true, bio: enhanced });
    } catch (error) {
      res.status(500).json({ error: "No pudimos conectar con la Inteligencia Artificial para mejorar el texto. Inténtalo de nuevo más tarde." });
    }
  });

  // PUT Update Profile
  app.put("/api/providers/:id", async (req, res) => {
     try {
        const providerId = req.params.id;
        const index = providers.findIndex(p => p.id === providerId);
        if (index === -1) return res.status(404).json({ error: "Provider not found" });
        
        providers[index] = { ...providers[index], ...req.body };
        res.json({ success: true, data: providers[index] });
     } catch(e) {
        res.status(500).json({ error: "Internal Server Error" });
     }
  });

  // GET Formalization Checklist
  app.get("/api/providers/:id/formalization", async (req, res) => {
    try {
      const rules = formalizations[req.params.id] || [];
      res.json({ success: true, data: { steps: rules } });
    } catch (error) {
      res.status(500).json({ error: "Internal error" });
    }
  });

  // PUT Formalization Checklist
  app.put("/api/providers/:id/formalization", async (req, res) => {
    try {
      const parsed = formalizationUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Datos de formalización inválidos", details: parsed.error.issues });
      }

      const { stepId, status } = parsed.data;
      
      const updated = updateFormalizationStep(req.params.id, stepId, status);
      
      if (!updated) {
         return res.status(404).json({ error: "Step not found" });
      }

      res.json({ success: true, message: "Estado de formalización actualizado" });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor al actualizar formalización" });
    }
  });

  // === VITE MIDDLEWARE OR STATIC SERVING ===
  if (process.env.NODE_ENV !== "production") {
    // Development mode via Vite SSR middleware
    console.log("Setting up Vite dev server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start the actual express server on host 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Conecta Emprende AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
