import { create } from 'zustand'
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
  weight?: number
  height?: number
  body_type?: string
  use_physical_info?: boolean
}

export type GarmentCategory = 'tops' | 'bottoms' | 'vestidos' | 'calzado' | 'abrigos' | 'accesorios'

export interface Garment {
  id?: string
  url: string
  category: GarmentCategory
  created_at?: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'consumption' | 'refund' | 'admin_adjustment'
  reference_id?: string
  description: string
  metadata?: any
  created_at: string
}

export interface UserCredits {
  credits: number
  total_spent: number
  total_purchased: number
  updated_at: string
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

  // Estados de créditos
  credits: number
  creditBalance: UserCredits | null
  creditTransactions: CreditTransaction[]
  isLoadingCredits: boolean
  
  // Acciones para modelos
  setModels: (models: Model[]) => void
  addModels: (models: Model[]) => void
  removeModel: (id: string) => Promise<void>
  undoRemoveModel: (id: string) => Promise<void>
  loadModelsFromApi: () => Promise<void>
  
  // Acciones para prendas
  setGarments: (garments: Garment[]) => void
  addGarments: (garments: Garment[]) => void
  removeGarment: (id: string) => Promise<void>
  undoRemoveGarment: (id: string) => Promise<void>
  updateGarmentCategory: (index: number, category: GarmentCategory) => void
  getGarmentsByCategory: () => Record<GarmentCategory, Garment[]>
  loadGarmentsFromApi: () => Promise<void>
  
  // Acciones de autenticación
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>

  // Acciones de créditos
  loadCredits: () => Promise<void>
  loadCreditTransactions: (limit?: number) => Promise<void>
  updateCredits: (amount: number) => void
  refreshCredits: () => Promise<void>

  // Acciones generales
  initialize: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Estado inicial
  user: null,
  isAuthLoading: false,
  models: [],
  garments: [],
  isLoading: false,
  isInitialized: false,

  // Estado inicial de créditos
  credits: 0,
  creditBalance: null,
  creditTransactions: [],
  isLoadingCredits: false,

  // Acciones para modelos
  setModels: (models) => set({ models }),

  addModels: (newModels) => set((state) => ({
    models: [...state.models, ...newModels]
  })),

  removeModel: async (id: string) => {
    try {
      // Soft delete en la base de datos
      const response = await fetch(`/api/models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      })

      if (!response.ok) {
        throw new Error('Error al eliminar modelo')
      }

      // Eliminar del estado local
      set((state) => ({
        models: state.models.filter((model) => model.id !== id)
      }))
    } catch (error) {
      console.error('Error removing model:', error)
      throw error
    }
  },

  undoRemoveModel: async (id: string) => {
    try {
      // Restaurar en la base de datos
      const response = await fetch(`/api/models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      })

      if (!response.ok) {
        throw new Error('Error al restaurar modelo')
      }

      // Recargar modelos desde la API
      await get().loadModelsFromApi()
    } catch (error) {
      console.error('Error undoing model removal:', error)
      throw error
    }
  },

  loadModelsFromApi: async () => {
    try {
      set({ isLoading: true })
      const response = await fetch('/api/list?type=model')
      const data = await response.json()

      if (response.ok && data.items) {
        const models: Model[] = data.items.map((item: any) => ({
          id: item.id,
          url: item.url,
          created_at: item.created_at,
          weight: item.weight,
          height: item.height,
          body_type: item.body_type,
          use_physical_info: item.use_physical_info
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

  removeGarment: async (id: string) => {
    try {
      // Soft delete en la base de datos
      const response = await fetch(`/api/garments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      })

      if (!response.ok) {
        throw new Error('Error al eliminar prenda')
      }

      // Eliminar del estado local
      set((state) => ({
        garments: state.garments.filter((garment) => garment.id !== id)
      }))
    } catch (error) {
      console.error('Error removing garment:', error)
      throw error
    }
  },

  undoRemoveGarment: async (id: string) => {
    try {
      // Restaurar en la base de datos
      const response = await fetch(`/api/garments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      })

      if (!response.ok) {
        throw new Error('Error al restaurar prenda')
      }

      // Recargar prendas desde la API
      await get().loadGarmentsFromApi()
    } catch (error) {
      console.error('Error undoing garment removal:', error)
      throw error
    }
  },

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
    set({
      user: null,
      models: [],
      garments: [],
      isInitialized: false,
      credits: 0,
      creditBalance: null,
      creditTransactions: []
    })
  },

  initializeAuth: async () => {
    const supabase = createClient()
    set({ isAuthLoading: true })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user })

      if (user) {
        await get().initialize()
      }

      authSubscription?.unsubscribe()

      // Escuchar cambios de autenticación y sincronizar cookies con el servidor
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const nextUser = session?.user ?? null
        set({ user: nextUser })

        if (!nextUser) {
          set({ models: [], garments: [], isInitialized: false })
        } else {
          await get().initialize()
        }

        await syncAuthStateWithServer(event, session)
      })

      authSubscription = subscription
    } finally {
      set({ isAuthLoading: false })
    }
  },

  // Acciones de créditos
  loadCredits: async () => {
    const { user } = get()
    if (!user) return

    try {
      set({ isLoadingCredits: true })
      const response = await fetch('/api/credits/balance')
      const data = await response.json()

      if (response.ok && data.success) {
        set({
          credits: data.credits,
          creditBalance: {
            credits: data.credits,
            total_spent: data.total_spent,
            total_purchased: data.total_purchased,
            updated_at: data.updated_at
          }
        })
      }
    } catch (error) {
      console.error('Error loading credits:', error)
    } finally {
      set({ isLoadingCredits: false })
    }
  },

  loadCreditTransactions: async (limit = 50) => {
    const { user } = get()
    if (!user) return

    try {
      const response = await fetch(`/api/credits/transactions?limit=${limit}`)
      const data = await response.json()

      if (response.ok && data.success) {
        set({ creditTransactions: data.transactions })
      }
    } catch (error) {
      console.error('Error loading credit transactions:', error)
    }
  },

  updateCredits: (amount: number) => {
    set((state) => ({
      credits: state.credits + amount,
      creditBalance: state.creditBalance ? {
        ...state.creditBalance,
        credits: state.creditBalance.credits + amount
      } : null
    }))
  },

  refreshCredits: async () => {
    await get().loadCredits()
  },

  // Acciones generales
  initialize: async () => {
    const { user } = get()
    if (!user) return // Sin usuario, no cargar nada

    set({ isLoading: true, isInitialized: false })
    try {
      // Si hay usuario, SIEMPRE sincronizar con Supabase
      await Promise.all([
        get().loadModelsFromApi(),
        get().loadGarmentsFromApi(),
        get().loadCredits()
      ])
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  setLoading: (isLoading) => set({ isLoading })
}))
