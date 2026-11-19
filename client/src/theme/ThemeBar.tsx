import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THEMES } from "./themes";
import { useThemeStore } from "./store";
import { playSfx, syncMusic } from "./sounds";

export function ThemeBar() {
  const { themeId, musicOn, sfxOn, setTheme, setMusicOn, setSfxOn } = useThemeStore();

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  useEffect(() => {
    syncMusic();
  }, [musicOn]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={themeId}
        onValueChange={(v) => {
          if (!v) return;
          setTheme(v as typeof themeId);
          playSfx("meow");
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {THEMES.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.emoji} {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" title="Game music" onClick={() => setMusicOn(!musicOn)}>
        {musicOn ? "🔊" : "🔇"}
      </Button>
      <Button variant="outline" size="icon" title="Sound effects" onClick={() => setSfxOn(!sfxOn)}>
        {sfxOn ? "🐾" : "🚫"}
      </Button>
    </div>
  );
}
