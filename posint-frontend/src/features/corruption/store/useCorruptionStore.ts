import { create } from "zustand"

interface CorruptionFiltersState {
  page: number
  search: string
  agency: string | null
  status: string | null
  year: number | null
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (key: string, value: string | null) => void
  clearFilters: () => void
}

export const useCorruptionStore = create<CorruptionFiltersState>()((set) => ({
  page: 1, search: "", agency: null, status: null, year: null,
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setFilter: (key, value) => set((s) => ({ ...s, [key]: value === "" ? null : (key === "year" ? (value ? Number(value) : null) : value), page: 1 })),
  clearFilters: () => set({ page: 1, search: "", agency: null, status: null, year: null }),
}))
