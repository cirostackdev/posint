import { create } from "zustand"

interface ElectionsFiltersState {
  page: number
  search: string
  level: string | null
  year: number | null
  state: string | null
  party: string | null
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (key: string, value: string | null) => void
  clearFilters: () => void
}

export const useElectionsStore = create<ElectionsFiltersState>()((set) => ({
  page: 1,
  search: "",
  level: null,
  year: null,
  state: null,
  party: null,
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setFilter: (key, value) => set((s) => ({ ...s, [key]: value === "" ? null : (key === "year" ? (value ? Number(value) : null) : value), page: 1 })),
  clearFilters: () => set({ page: 1, search: "", level: null, year: null, state: null, party: null }),
}))
