import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  name: string;
  setName: (name: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({ name: "", setName: (name) => set({ name }) }),
    { name: "arcade-player" }
  )
);