import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface CompareState {
  selectedIds: string[]
  addPolitician: (id: string) => void
  removePolitician: (id: string) => void
  clearAll: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      addPolitician: (id) => {
        const current = get().selectedIds
        if (current.length < 4 && !current.includes(id)) {
          set({ selectedIds: [...current, id] })
        }
      },
      removePolitician: (id) =>
        set((state) => ({ selectedIds: state.selectedIds.filter((sid) => sid !== id) })),
      clearAll: () => set({ selectedIds: [] }),
    }),
    {
      name: "posint-compare",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
