export interface WeaponDef {
  id: string;
  name: string;
  emoji: string;
  dmg: number;
  /** shots per second */
  rate: number;
  mag: number;
  /** seconds */
  reload: number;
  speed: number;
  spread: number;
  pellets: number;
  life: number;
  auto: boolean;
  /** blast radius for explosives */
  splash: number;
  recoil: number;
  /** gravity applied to the projectile (1 = world gravity) */
  grav: number;
}

const w = (d: Partial<WeaponDef> & Pick<WeaponDef, "id" | "name" | "emoji" | "dmg" | "rate" | "mag" | "reload" | "speed">): WeaponDef => ({
  spread: 0.03,
  pellets: 1,
  life: 0.7,
  auto: true,
  splash: 0,
  recoil: 20,
  grav: 0,
  ...d,
});

export const WEAPONS: Record<string, WeaponDef> = {
  pistol: w({ id: "pistol", name: "Pistol", emoji: "🔫", dmg: 16, rate: 4, mag: 12, reload: 1.0, speed: 1500, spread: 0.02, auto: false, recoil: 10 }),
  smg: w({ id: "smg", name: "SMG", emoji: "🔫", dmg: 9, rate: 14, mag: 30, reload: 1.5, speed: 1500, spread: 0.07, recoil: 14 }),
  shotgun: w({ id: "shotgun", name: "Shotgun", emoji: "💥", dmg: 9, rate: 1.2, mag: 6, reload: 2.0, speed: 1300, spread: 0.22, pellets: 7, life: 0.32, auto: false, recoil: 160 }),
  sniper: w({ id: "sniper", name: "Sniper", emoji: "🎯", dmg: 78, rate: 0.9, mag: 4, reload: 2.2, speed: 2800, spread: 0.002, life: 1.0, auto: false, recoil: 90 }),
  rocket: w({ id: "rocket", name: "Rockets", emoji: "🚀", dmg: 70, rate: 0.9, mag: 3, reload: 2.4, speed: 760, spread: 0.01, life: 3, auto: false, splash: 120, recoil: 120 }),
  grenade: w({ id: "grenade", name: "Grenade", emoji: "💣", dmg: 62, rate: 1, mag: 99, reload: 0, speed: 800, spread: 0, life: 2.0, auto: false, splash: 130, grav: 1, recoil: 0 }),
};

export const GUN_IDS = ["pistol", "smg", "shotgun", "sniper", "rocket"] as const;
export const weaponDef = (id: string) => WEAPONS[id] ?? WEAPONS.pistol;
