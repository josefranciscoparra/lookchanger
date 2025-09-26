# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANTE**: El usuario prefiere recibir todas las respuestas en castellano/español.

**IMPORTANTE**: Cuando hagas consultas a la base de datos o devuelvas información sobre imágenes, NO incluyas los datos completos de las imágenes (como URLs data: o contenido binario) ya que supera el límite de contexto. Solo devuelve nombres de archivos, IDs o metadatos básicos.

## Project Overview

This is an AI-powered virtual try-on application built with Next.js 14 that allows users to generate photos of models wearing different clothing items using Google's Gemini 2.5 Flash Image model. The app enables users to upload model photos, garment images, and create outfit combinations through AI generation.

## Architecture

### Core Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **State Management**: Zustand for global state persistence
- **AI Integration**: Google Gemini 2.5 Flash Image (`@google/generative-ai` package)
- **Storage**: Supabase (optional, fallback to in-memory/demo mode)
- **Database**: PostgreSQL via Supabase with 4 main tables

### Key Components

**Main Pages:**
- `/` - Landing page
- `/models` - Upload and manage model photos
- `/garments` - Upload and manage clothing items
- `/outfits` - Create and generate outfit combinations

**API Routes:**
- `/api/upload` - Handle file uploads
- `/api/list` - List stored items
- `/api/outfits/run` - Generate AI outfit combinations

**Core Libraries:**
- `lib/gemini.ts` - Handles Gemini AI integration and prompt engineering
- `lib/storage.ts` - Manages file storage (demo mode with data URLs)
- `lib/store.ts` - Zustand global state store for models and garments

### State Management with Zustand

The application uses Zustand for global state management to ensure data persistence across page navigations:

**Store Structure (`lib/store.ts`):**
- `models: Model[]` - Array of uploaded model photos
- `garments: Garment[]` - Array of uploaded garment images  
- `isLoading: boolean` - Global loading state
- `isInitialized: boolean` - Whether store has loaded initial data

**Key Actions:**
- `initialize()` - Loads models and garments from API on app start
- `addModels()` / `addGarments()` - Add new items after upload
- `removeModel()` / `removeGarment()` - Remove items from store
- `loadModelsFromApi()` / `loadGarmentsFromApi()` - Sync with Supabase

**Usage Pattern:**
```typescript
const { models, garments, addModels, initialize } = useAppStore()

useEffect(() => {
  initialize() // Load existing data on component mount
}, [initialize])
```

**Data Flow:**
1. User uploads files → API saves to Supabase → Store updates
2. Page navigation → Store persists data using Zustand persistence middleware
3. App restart → Store loads from localStorage + API sync

### Database Schema (Supabase)

```sql
models (id, user_id, image_url, created_at)
garments (id, user_id, category, image_url, created_at)
outfit_jobs (id, user_id, model_ids, garment_ids, style_json, status, cost_cents, created_at)
outputs (id, job_id, image_url, meta, created_at)
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run format

# Initialize Supabase database (optional)
npm run db:prep
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for AI functionality
GEMINI_API_KEY=your_google_ai_studio_key

# Optional - enables persistent storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
```

**Note**: The app works in demo mode without Supabase - it uses in-memory storage and data URLs for testing.

## Key Implementation Details

### AI Integration
- Uses Gemini 2.5 Flash Image model for virtual try-on generation
- Prompt engineering focuses on preserving model's face/hair while fitting garments naturally
- Supports multiple variants per generation (default: 2)
- Fallback demo mode returns original garment images when API key is missing

### File Handling
- Demo mode: Converts uploads to base64 data URLs
- Production mode: Uses Supabase Storage for persistent file storage
- Supports common image formats (PNG, JPG, etc.)

### Application Flow
1. Upload model photos (`/models`)
2. Upload garment photos (`/garments`)  
3. Create outfit combinations (`/outfits`)
4. Generate AI try-on results via `/api/outfits/run`

## Development Notes

- The app is designed for rapid iteration and can work completely offline in demo mode
- **State persists across page navigations** thanks to Zustand global store
- No authentication required by default (can be added via Supabase Auth)
- UI is in Spanish (`lang="es"` in layout)
- Uses simple file-based storage in demo mode for quick testing
- Database initialization handled by `scripts/supabase-init.js`

## Common Development Tasks

When working on this codebase:
- Test both demo mode (no env vars) and full Supabase integration
- Verify AI generation with different model/garment combinations
- Ensure file uploads work in both storage modes
- **Always use Zustand store** (`useAppStore`) for managing models and garments instead of local state
- Check prompt engineering in `lib/gemini.ts` for quality improvements