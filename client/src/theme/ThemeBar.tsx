import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { THEMES, TRACKS } from "./themes";
import { useThemeStore } from "./store";
import { syncMusic, setMusicVolume, playSfx } from "./sound";

export function ThemeBar() {
  const { themeId, trackId, musicOn, sfxOn, volume,
          setTheme, setTrack, setMusicOn, setSfxOn } = useThemeStore();

  useEffect(() => { document.documentElement.dataset.theme = themeId; }, [themeId]);

    useEffect(() => {
    syncMusic();
  }, [musicOn, trackId]);

  useEffect(() => { setMusicVolume(volume); }, [volume]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={themeId} onValueChange={(v) => { setTheme(v as typeof themeId); playSfx("meow"); }}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {THEMES.map((t) => <SelectItem key={t.id} value={t.id}>{t.emoji} {t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={trackId} onValueChange={(v) => v && setTrack(v)}>
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {TRACKS.map((t) => <SelectItem key={t.id} value={t.id}>🎵 {t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={() => setMusicOn(!musicOn)}>{musicOn ? "🔊" : "🔇"}</Button>
      <Button variant="outline" size="icon" onClick={() => setSfxOn(!sfxOn)}>{sfxOn ? "🐾" : "🚫"}</Button>
    </div>
  );
}