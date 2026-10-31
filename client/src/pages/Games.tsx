import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { playSfx } from "@/theme/sound";
import { GAMES } from "@/games/registry";

const stickerCard =
  "rounded-3xl border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)]";

export default function Games() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">🎮 Which game do you wanna play?</h1>
      <p className="mb-8 mt-1 text-muted-foreground">Choose game, create room and play.</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4, rotate: i % 2 ? 1 : -1 }}
            whileTap={{ scale: 0.97 }}
            className="text-left"
            onClick={() => {
              playSfx("click");
              navigate(`/games/${g.id}`);
            }}
          >
            <Card className={`${stickerCard} h-full`}>
              <div className="mb-3 flex items-start justify-between">
                <span className="text-5xl">{g.emoji}</span>
                <div className="flex gap-1">
                  <Badge variant="secondary">{g.kind}</Badge>
                  <Badge variant={g.status === "live" ? "default" : "outline"}>
                    {g.status === "live" ? "Live" : "Soon"}
                  </Badge>
                </div>
              </div>
              <h3 className="font-display text-xl font-bold">{g.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{g.tagline}</p>
              <p className="mt-4 font-display text-sm font-semibold">Play →</p>
            </Card>
          </motion.button>
        ))}
      </div>
    </main>
  );
}