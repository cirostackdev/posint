import { create } from "zustand"

interface LegislatureFiltersState {
  page: number
  search: string
  status: string | null
  chamber: string | null
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (key: string, value: string | null) => void
  clearFilters: () => void
}

export const useLegislatureStore = create<LegislatureFiltersState>()((set) => ({
  page: 1, search: "", status: null, chamber: null,
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setFilter: (key, value) => set((s) => ({ ...s, [key]: value || null, page: 1 })),
  clearFilters: () => set({ page: 1, search: "", status: null, chamber: null }),
}))
