import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEMES, type ThemeId } from "./themes";

interface ThemeState {
  themeId: ThemeId;
  trackId: string;
  musicOn: boolean;
  sfxOn: boolean;
  volume: number;
  setTheme: (id: ThemeId) => void;
  setTrack: (id: string) => void;
  setMusicOn: (v: boolean) => void;
  setSfxOn: (v: boolean) => void;
  setVolume: (v: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: "calico",
      trackId: "cozy",
      musicOn: false,
      sfxOn: true,
      volume: 0.4,
      setTheme: (id) =>
        set({
          themeId: id,
          trackId: THEMES.find((t) => t.id === id)!.defaultTrack,
        }),
      setTrack: (trackId) => set({ trackId }),
      setMusicOn: (musicOn) => set({ musicOn }),
      setSfxOn: (sfxOn) => set({ sfxOn }),
      setVolume: (volume) => set({ volume }),
    }),
    { name: "arcade-theme" },
  ),
);
