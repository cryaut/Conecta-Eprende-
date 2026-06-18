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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // GET Providers Search
  app.get("/api/providers/search", async (req, res) => {
    try {
      const parsed = searchProviderSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Parámetros de búsqueda inválidos", details: parsed.error.issues });
      }
      const { q, city, n, s, e, w } = parsed.data;
      
      const filters: any = { AND: [] };

      if (city) {
        filters.AND.push({ city: { equals: city.toUpperCase() } });
      }
      if (q) {
        filters.AND.push({
          OR: [
            { displayName: { contains: q } },
            { category: { contains: q } },
            { bio: { contains: q } }
          ]
        });
      }

      if (n && s && e && w) {
        filters.AND.push({ lat: { lte: parseFloat(n), gte: parseFloat(s) } });
        filters.AND.push({ lng: { lte: parseFloat(e), gte: parseFloat(w) } });
      }

      if (filters.AND.length === 0) delete filters.AND;

      const results = await prisma.provider.findMany({
        where: filters,
        include: { trustScore: true }
      });

      // Format for frontend
      const data = results.map(p => ({
        ...p,
        score: p.trustScore?.finalScore || 0,
        photos: p.photos ? JSON.parse(p.photos) : []
      }));

      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Error" });
    }
  });

  // POST Providers AI Search
  app.post("/api/providers/ai-search", async (req, res) => {
    try {
      const parsed = aiSearchProviderSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Solicitud inválida" });

      const { query } = parsed.data;
      const intent = await extractIntent(query);
      
      const filters: any = { OR: [] };
      if (intent.city) filters.city = { equals: intent.city.toUpperCase() };

      if (intent.category) {
        filters.OR.push({ category: { contains: intent.category } });
      }
      if (intent.keywords && intent.keywords.length > 0) {
        intent.keywords.forEach(kw => {
          filters.OR.push({ displayName: { contains: kw } });
          filters.OR.push({ bio: { contains: kw } });
        });
      }
      if (filters.OR.length === 0) delete filters.OR;

      const results = await prisma.provider.findMany({
        where: filters,
        include: { trustScore: true }
      });

      const data = results.map(p => ({
        ...p,
        score: p.trustScore?.finalScore || 0,
        photos: p.photos ? JSON.parse(p.photos) : []
      }));

      res.json({ success: true, intent, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal Error" });
    }
  });

  // GET Provider by ID
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await prisma.provider.findUnique({
        where: { id: req.params.id },
        include: { trustScore: true, reviewsReceived: true }
      });
      if (!provider) return res.status(404).json({ success: false, message: "No encontrado" });
      
      res.json({
        success: true,
        data: {
          ...provider,
          score: provider.trustScore?.finalScore || 0,
          photos: provider.photos ? JSON.parse(provider.photos) : [],
          reviews: provider.reviewsReceived // Simple mapping for now
        }
      });
    } catch (error) {
       res.status(500).json({ success: false });
    }
  });

  // GET Quotes (Filtered by provider '1' for the demo)
  app.get("/api/quotes", async (req, res) => {
    try {
      const threads = await prisma.quoteThread.findMany({
        where: { providerId: "1" },
        include: { messages: true, sender: true }
      });

      const data = threads.map(t => ({
        id: t.id,
        providerId: t.providerId,
        subject: t.subject,
        clientName: t.sender.name || "Cliente",
        clientAvatar: (t.sender.name || "C").substring(0, 2).toUpperCase(),
        status: t.status,
        date: t.createdAt.toLocaleDateString(),
        messages: t.messages.map(m => ({
          id: m.id,
          author: m.authorId === t.senderId ? 'client' : 'provider',
          text: m.body,
          time: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      }));

      res.json({ success: true, data });
    } catch (error) {
       res.status(500).json({ success: false });
    }
  });

  // POST Request Quote
  app.post("/api/quotes", async (req, res) => {
    try {
      const parsed = quoteRequestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Faltan campos" });
      
      const { providerId, subject, body } = parsed.data;

      const thread = await prisma.quoteThread.create({
        data: {
          senderId: 'client-user',
          providerId,
          subject: subject || "Solicitud de cotización",
          status: "OPEN",
          messages: {
            create: {
              authorId: 'client-user',
              body: body
            }
          }
        },
        include: { messages: true, sender: true }
      });

      res.json({ success: true, data: thread });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  // POST Message to Quote Thread
  app.post("/api/quotes/:id/messages", async (req, res) => {
    try {
      const authorId = req.body.author === 'client' ? 'client-user' : 'user-1';
      const msg = await prisma.quoteMessage.create({
        data: {
          threadId: req.params.id,
          authorId: authorId,
          body: req.body.text
        }
      });
      res.json({ success: true, data: msg });
    } catch (e) {
      res.status(500).json({ error: "Server Error" });
    }
  });

  // PUT Update Quote Thread Status
  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const thread = await prisma.quoteThread.update({
        where: { id: req.params.id },
        data: { status: req.body.status }
      });
      res.json({ success: true, data: thread });
    } catch (e) {
      res.status(500).json({ error: "Server Error" });
    }
  });

  // POST Generate AI Enhanced Bio
  app.post("/api/providers/enhance-bio", async (req, res) => {
    try {
      const parsed = enhanceBioSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Campos inválidos" });
      const enhanced = await generateEnhancedBio(parsed.data.bio, parsed.data.category);
      res.json({ success: true, bio: enhanced });
    } catch (error) {
      res.status(500).json({ error: "IA Error" });
    }
  });

  // PUT Update Profile
  app.put("/api/providers/:id", async (req, res) => {
     try {
        const updated = await prisma.provider.update({
          where: { id: req.params.id },
          data: {
            displayName: req.body.displayName,
            bio: req.body.bio,
            category: req.body.category,
            city: req.body.city
          }
        });
        res.json({ success: true, data: updated });
     } catch(e) {
        res.status(500).json({ error: "Update Error" });
     }
  });

  // GET Formalization Checklist
  app.get("/api/providers/:id/formalization", async (req, res) => {
    try {
      const checklist = await prisma.formalizationChecklist.findUnique({
        where: { providerId: req.params.id }
      });
      const steps = checklist ? JSON.parse(checklist.steps) : [];
      res.json({ success: true, data: { steps } });
    } catch (error) {
      res.status(500).json({ error: "Internal error" });
    }
  });

  // PUT Formalization Checklist
  app.put("/api/providers/:id/formalization", async (req, res) => {
    try {
      const { stepId, status } = req.body;
      const checklist = await prisma.formalizationChecklist.findUnique({
        where: { providerId: req.params.id }
      });
      if (!checklist) return res.status(404).json({ error: "Not found" });

      let steps = JSON.parse(checklist.steps);
      let nextIndex = -1;
      steps = steps.map((s: any, i: number) => {
        if (s.id === stepId) {
          s.status = status;
          if (status === 'completed') nextIndex = i + 1;
        }
        return s;
      });

      if (nextIndex !== -1 && nextIndex < steps.length && steps[nextIndex].status === 'pending') {
        steps[nextIndex].status = 'current';
      }

      await prisma.formalizationChecklist.update({
        where: { providerId: req.params.id },
        data: { steps: JSON.stringify(steps) }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Vite / Static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Conecta Emprende AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
