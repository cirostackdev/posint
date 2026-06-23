import { create } from "zustand"

interface PoliticiansFiltersState {
  page: number
  search: string
  party: string | null
  state: string | null
  chamber: string | null
  sortBy: string
  sortOrder: "asc" | "desc"

  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (key: string, value: string | null) => void
  clearFilters: () => void
}

export const usePoliticiansStore = create<PoliticiansFiltersState>()((set) => ({
  page: 1,
  search: "",
  party: null,
  state: null,
  chamber: null,
  sortBy: "name",
  sortOrder: "asc",

  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setFilter: (key, value) => set((s) => ({ ...s, [key]: value, page: 1 })),
  clearFilters: () => set({ page: 1, search: "", party: null, state: null, chamber: null }),
}))
