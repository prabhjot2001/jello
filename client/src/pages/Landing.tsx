import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sticker } from "@/components/Sticker";
import { playSfx } from "@/theme/sound";

const DECOR = [
  { src: "sticker_046.png", fb: "😼", pos: "left-[3%] top-[6%]", size: 84 },
  { src: "sticker_025.png", fb: "😿", pos: "right-[4%] top-[8%]", size: 90 },
  { src: "sticker_048.png", fb: "😸", pos: "left-[8%] bottom-[35%]", size: 76 },
  {
    src: "sticker_006.png",
    fb: "🙀",
    pos: "right-[7%] bottom-[35%]",
    size: 80,
  },
  { src: "sticker_002.png", fb: "😻", pos: "left-[32%] top-[3%]", size: 60 },
  { src: "sticker_042.png", fb: "😻", pos: "left-[16%] bottom-[58%]", size: 66},
  {
    src: "sticker_033.png",
    fb: "🐾",
    pos: "right-[20%] bottom-[48%]",
    size: 56,
  },
];

const STEPS = [
  {
    emoji: "🎮",
    title: "Choose a Game",
    text: "Pick your favorite game from the list",
  },
  {
    emoji: "🏠",
    title: "Create or Join a Room",
    text: "Create a room and share the room code with your friend, or join their room.",
  },
  {
    emoji: "🐌",
    title: "Play, Win & Have Fun!",
    text: "Blehhhhhhh",
  },
];

const stickerCard =
  "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col items-center justify-center gap-12 overflow-hidden px-4 py-12 text-center">
      {DECOR.map((d, i) => (
        <motion.div
          key={i}
          className={`pointer-events-none absolute ${d.pos}`}
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sticker src={d.src} fallback={d.fb} size={d.size} />
        </motion.div>
      ))}

      <motion.section
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        <span className="rounded-full border-2 border-border bg-accent px-4 py-1 font-display text-sm font-semibold">
          🐾 Meowieee 🐾
        </span>
        <h1 className="font-display text-5xl font-bold leading-tight sm:text-7xl">
          Games for
          <br />
          <span className="flex gap-4">
            <span className="inline-block -rotate-2 rounded-3xl border-2 border-border bg-primary px-4 shadow-[4px_4px_0_0_var(--border)]">
              Meows
            </span>{" "}
            <Sticker src={"sticker_030.png"} fallback={"😸"} size={76} />
          </span>
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Far away, but not too far… 💗
        </p>
        <Button
          size="lg"
          className="mt-2 h-14 rounded-full px-8 font-display text-lg"
          onClick={() => {
            playSfx("meow");
            navigate("/games");
          }}
        >
          Continue Playing →
        </Button>
      </motion.section>

      <section>
        <h6 className="font-display text-xl font-bold leading-tight sm:text-2xl">
          Steps: How to play
        </h6>
      </section>

      <section className="relative z-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Card className={`${stickerCard} h-full`}>
              <div className="text-3xl">{s.emoji}</div>
              <h3 className="mt-2 font-display font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </Card>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
