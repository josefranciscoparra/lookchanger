import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js'

const AUTH_CALLBACK_URL = '/api/auth/callback'
let authSubscription: Subscription | null = null

const syncAuthStateWithServer = async (event: AuthChangeEvent, session: Session | null) => {
  try {
    await fetch(AUTH_CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ event, session }),
    })
  } catch (error) {
    console.error('Error synchronizing auth state:', error)
  }
}

export interface Model {
  id?: string
  url: string
  created_at?: string
}

export type GarmentCategory = 'tops' | 'bottoms' | 'vestidos' | 'calzado' | 'abrigos' | 'accesorios'

export interface Garment {
  id?: string
  url: string
  category: GarmentCategory
  created_at?: string
}

interface AppState {
  // Estados de autenticación
  user: User | null
  isAuthLoading: boolean
  
  // Estados
  models: Model[]
  garments: Garment[]
  isLoading: boolean
  isInitialized: boolean
  
  // Acciones para modelos
  setModels: (models: Model[]) => void
  addModels: (models: Model[]) => void
  removeModel: (index: number) => void
  loadModelsFromApi: () => Promise<void>
  
  // Acciones para prendas
  setGarments: (garments: Garment[]) => void
  addGarments: (garments: Garment[]) => void
  removeGarment: (index: number) => void
  updateGarmentCategory: (index: number, category: GarmentCategory) => void
  getGarmentsByCategory: () => Record<GarmentCategory, Garment[]>
  loadGarmentsFromApi: () => Promise<void>
  
  // Acciones de autenticación
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
  
  // Acciones generales
  initialize: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthLoading: false,
      models: [],
      garments: [],
      isLoading: false,
      isInitialized: false,
      
      // Acciones para modelos
      setModels: (models) => set({ models }),
      
      addModels: (newModels) => set((state) => ({
        models: [...state.models, ...newModels]
      })),
      
      removeModel: (index) => set((state) => ({
        models: state.models.filter((_, i) => i !== index)
      })),
      
      loadModelsFromApi: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/list?type=model')
          const data = await response.json()
          
          if (response.ok && data.items) {
            const models: Model[] = data.items.map((item: any) => ({
              id: item.id,
              url: item.url,
              created_at: item.created_at
            }))
            set({ models })
          }
        } catch (error) {
          console.error('Error loading models:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Acciones para prendas
      setGarments: (garments) => set({ garments }),
      
      addGarments: (newGarments) => set((state) => ({
        garments: [...state.garments, ...newGarments]
      })),
      
      removeGarment: (index) => set((state) => ({
        garments: state.garments.filter((_, i) => i !== index)
      })),
      
      updateGarmentCategory: (index, category) => set((state) => ({
        garments: state.garments.map((garment, i) => 
          i === index ? { ...garment, category } : garment
        )
      })),
      
      getGarmentsByCategory: () => {
        const { garments } = get()
        const categories: GarmentCategory[] = ['tops', 'bottoms', 'vestidos', 'calzado', 'abrigos', 'accesorios']
        return categories.reduce((acc, category) => {
          acc[category] = garments.filter(garment => garment.category === category)
          return acc
        }, {} as Record<GarmentCategory, Garment[]>)
      },
      
      loadGarmentsFromApi: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/list?type=garment')
          const data = await response.json()
          
          if (response.ok && data.items) {
            const garments: Garment[] = data.items.map((item: any) => ({
              id: item.id,
              url: item.url,
              created_at: item.created_at,
              category: item.category
            }))
            set({ garments })
          }
        } catch (error) {
          console.error('Error loading garments:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Acciones de autenticación
      setUser: (user) => set({ user }),
      
      signOut: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, models: [], garments: [], isInitialized: false })
      },
      
      initializeAuth: async () => {
        const supabase = createClient()
        set({ isAuthLoading: true })
        
        try {
          const { data: { user } } = await supabase.auth.getUser()
          set({ user })
          
          authSubscription?.unsubscribe()

          // Escuchar cambios de autenticación y sincronizar cookies con el servidor
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            set({ user: session?.user ?? null })

            if (event === 'SIGNED_OUT') {
              set({ models: [], garments: [], isInitialized: false })
            }

            await syncAuthStateWithServer(event, session)
          })

          authSubscription = subscription
        } finally {
          set({ isAuthLoading: false })
        }
      },
      
      // Acciones generales
      initialize: async () => {
        const { user } = get()
        if (!user) return // Sin usuario, no cargar nada
        
        set({ isLoading: true })
        try {
          // Si hay usuario, SIEMPRE sincronizar con Supabase
          await Promise.all([
            get().loadModelsFromApi(),
            get().loadGarmentsFromApi()
          ])
        } finally {
          set({ isLoading: false, isInitialized: true })
        }
      },
      
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'lookchanger-store',
      partialize: (state) => ({
        // Solo persistir URLs de Supabase, no data URLs pesados
        models: state.models.filter(model => !model.url.startsWith('data:')),
        garments: state.garments.filter(garment => !garment.url.startsWith('data:')),
        isInitialized: state.isInitialized
      })
    }
  )
)
