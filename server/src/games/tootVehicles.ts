import type { TootVehicleInfo } from "../../../shared/toot.js";

const make = (
  id: string, name: string, emoji: string, color: string, w: number, h: number,
  power: number, control: number,
  opts: { premium?: boolean; unlockStars?: number; wheels?: boolean; propeller?: boolean } = {}
): TootVehicleInfo => ({
  id, name, emoji, color, w, h, power, control,
  premium: !!opts.premium,
  unlockStars: opts.unlockStars ?? 0,
  wheels: !!opts.wheels,
  propeller: !!opts.propeller,
});

export const VEHICLES: TootVehicleInfo[] = [
  make("poop", "Poop Kart", "💩", "#9C6B3F", 220, 28, 1.0, 1.0),
  make("broom", "Broom Kart", "🧹", "#D9A441", 270, 20, 1.05, 0.9),
  make("car", "Car Kart", "🚗", "#FF6B6B", 210, 30, 1.0, 1.1, { wheels: true }),
  make("tuktuk", "Tuk Tuk Kart", "🛺", "#FFD34D", 210, 30, 1.1, 1.0, { wheels: true }),
  make("cycle", "Cycle Kart", "🚲", "#7FD1AE", 190, 20, 1.0, 0.85, { wheels: true }),
  make("toilet", "Toilet Seat Kart", "🚽", "#F0F0F0", 210, 28, 1.05, 1.05),
  make("heel", "Heel Sandal Kart", "👠", "#FF7AA8", 180, 24, 0.95, 0.8),
  make("guitar", "Guitar Kart", "🎸", "#C67B3C", 250, 24, 1.0, 1.1),
  make("undies", "Underwear Kart", "🩲", "#7BB6FF", 200, 24, 0.9, 0.9),
  // make("bra", "Bra Kart", "👙", "#FF9AD5", 200, 24, 0.9, 0.9),
  // premium: more power and more control, unlocked with stars
  make("carpet", "Magic Carpet Kart", "🧞", "#B07CFF", 240, 20, 1.3, 1.25, { premium: false, unlockStars: 4 }),
  make("plane", "Plane Kart", "✈️", "#FFFFFF", 250, 24, 1.35, 1.3, { premium: false, unlockStars: 8, propeller: true }),
  make("ufo", "UFO Kart", "🛸", "#9CF0E1", 220, 26, 1.45, 1.4, { premium: false, unlockStars: 12 }),
];

export const vehicleById = (id: string) => VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];