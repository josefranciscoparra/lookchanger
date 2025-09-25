# AI Look Try-On — Starter (Next.js 14 + Supabase + Gemini 2.5 Flash Image)

Genera fotos de una **misma modelo** con **vestidos, zapatos y complementos** usando **Gemini 2.5 Flash Image** (“Nano Banana”).  
Este repo está listo para abrir en **VS Code / Cursor / Claude Code** y empezar.

## 🧱 Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (básico)
- Supabase (Storage + opcional Auth/DB)
- Cola opcional con Upstash QStash (webhooks)
- Gemini 2.5 Flash Image (google-genai SDK)

## 🚀 Puesta en marcha (local)
1) Clona o descomprime este repo.  
2) Crea `.env.local` copiando de `.env.example` y completa:
   - `GEMINI_API_KEY` (Google AI Studio)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (proyecto Supabase)
   - `SUPABASE_SERVICE_ROLE` (si usas server-side para limpieza/colas, opcional)
3) Instala deps:
```bash
npm i
npm run db:prep   # crea tablas en Supabase (opcional)
npm run dev
```
4) Abre `http://localhost:3000`

## 🧭 Flujo
- Sube 1–N fotos de **modelo** (página **/models**).
- Sube 1–N fotos de **prendas** (página **/garments**).
- Crea un **outfit** combinando modelo + prendas (página **/outfits**).
- Lanza generación: el backend llama a **Gemini** y guarda PNGs en Storage.

## 🗃️ Tablas (Supabase)
- `models (id, user_id, image_url, created_at)`
- `garments (id, user_id, category, image_url, created_at)`
- `outfit_jobs (id, user_id, model_ids, garment_ids, style_json, status, cost_cents, created_at)`
- `outputs (id, job_id, image_url, meta, created_at)`

Ejecuta `npm run db:prep` para crear las tablas (SQL sencillo).

## 🔑 Auth
- Por simplicidad, el UI funciona sin login.  
- Si quieres Auth rápida: habilita **Supabase Auth** y protege rutas en `middleware.ts`.

## 🧩 Notas
- El endpoint `/app/api/outfits/run` ya prepara la llamada a `gemini-2.5-flash-image-preview`.
- Ajusta el **prompt** en `lib/gemini.ts` para tu estilo (studio, ecommerce, street).
- Si prefieres un **gateway** (p.ej. piapi/kie), cambia la implementación en `lib/gemini.ts`.

## 🧪 Prueba rápida sin Supabase
- Setea solo `GEMINI_API_KEY`.
- Las subidas guardan en memoria/temporal y el resultado se muestra inline (modo demo).

## 📦 Deploy
- Vercel (frontend + API routes).  
- Supabase gestionado para Storage/Auth/DB.  
- QStash/Vercel Cron para colas.

---

© 2025 — Starter preparado para iterar rápido.