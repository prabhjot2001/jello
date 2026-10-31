import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BackgroundStickers } from "@/theme/BackgroundSticker";
import { useThemeStore } from "@/theme/store";
import { Navbar } from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Games from "@/pages/Games";
import GameSetup from "@/pages/GameSetup";
import Lobby from "@/pages/Lobby";
import { TmdbCredit } from "./components/TmdbCredit";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  return (
    <>
      <BackgroundStickers />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:gameId" element={<GameSetup />} />
        <Route path="/room/:code" element={<Lobby />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TmdbCredit />
    </>
  );
}