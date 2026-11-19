import type { TankWeaponInfo } from "../../../shared/tanks.js";

export type WKind =
  | "shell" | "roller" | "bouncer" | "mirv" | "cluster" | "digger" | "pile" | "dirt" | "mover" | "wall"
  | "dome" | "tracer" | "sniper" | "napalm" | "tommy" | "homing" | "carpet" | "wacky";

export interface WeaponDef extends TankWeaponInfo {
  kind: WKind;
  /** blast radius */
  r: number;
  /** points for a direct hit */
  pts: number;
  shots?: number;
  spread?: number;
}

const w = (
  id: string, name: string, emoji: string, desc: string, power: number, kind: WKind, r: number, pts: number,
  extra: { shots?: number; spread?: number } = {}
): WeaponDef => ({ id, name, emoji, desc, power, kind, r, pts, ...extra });

export const WEAPONS: WeaponDef[] = [
  w("single", "Single Shot", "💣", "The classic. Medium blast, good points.", 3, "shell", 32, 100),
  w("big", "Big Shot", "🔴", "A bigger blast but fewer points per hit.", 3, "shell", 52, 80),
  w("triple", "3-Shot", "🔱", "Three shells in a fan.", 3, "shell", 24, 70, { shots: 3, spread: 4 }),
  w("five", "5-Shot", "🖐️", "Five small shells in a wide fan.", 3, "shell", 20, 55, { shots: 5, spread: 6 }),
  w("nuke", "Nuke", "☢️", "Medium blast, the hardest hitting weapon.", 5, "shell", 62, 170),
  w("mega", "Mega Nuke", "💥", "Huge blast, but fewer points than the Nuke.", 4, "shell", 110, 125),
  w("roller", "Roller", "⚽", "Lands, then rolls until it hits something.", 3, "roller", 36, 110),
  w("heavy", "Heavy Roller", "🎳", "A Roller with a big blast and big points.", 4, "roller", 52, 135),
  w("bouncer", "Bouncy Bomb", "🏀", "Bounces three times, then blows up.", 3, "bouncer", 36, 95),
  w("mirv", "MIRV", "🚀", "Splits into five warheads at the top of its arc.", 4, "mirv", 26, 62),
  w("cluster", "Cluster Bomb", "🎆", "Bursts into six bomblets on impact.", 3, "cluster", 18, 40),
  w("digger", "Digger", "⛏️", "Tunnels into the ground along its path.", 1, "digger", 11, 0),
  w("pile", "Pile Driver", "🔨", "Small damage, digs a hole straight down.", 2, "pile", 14, 40),
  w("dirt", "Dirtball", "🟤", "Piles dirt where it lands. Bury your rival!", 1, "dirt", 50, 0),
  w("mover", "Mountain Mover", "⛰️", "Huge dirt removal, no points.", 1, "mover", 95, 0),
  w("wall", "Magic Wall", "🧱", "Grows a wall of dirt where it lands.", 1, "wall", 0, 0),
  w("dome", "Dome Protect", "🛡️", "A dome of dirt around your own tank.", 1, "dome", 0, 0),
  w("tracer", "Tracer", "🎯", "Five marker shots that show you where to aim.", 1, "tracer", 0, 0),
  w("sniper", "Sniper", "🔭", "A laser that burns through thick dirt.", 5, "sniper", 24, 170),
  w("napalm", "Napalm", "🔥", "Sets the ground ablaze in a wide line.", 3, "napalm", 16, 32),
  w("tommy", "Tommy Gun", "🔫", "A burst of eight quick bullets.", 3, "tommy", 13, 26),
  w("homing", "Homing Missile", "🛰️", "Curves toward the enemy when it gets close.", 4, "homing", 28, 100),
  w("carpet", "Carpet Bomb", "🌧️", "Drops seven bombs in a row at the top of its arc.", 4, "carpet", 22, 44),
  w("wacky", "Wacky Tank", "🌀", "Scrambles the angle and power of the tank it hits.", 2, "wacky", 28, 60),
];

export const weaponById = (id: string) => WEAPONS.find((x) => x.id === id);

export const WEAPON_INFOS: TankWeaponInfo[] = WEAPONS.map(({ id, name, emoji, desc, power }) => ({
  id, name, emoji, desc, power,
}));
