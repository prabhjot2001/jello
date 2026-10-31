export type GameId =
  | "movie-guess"
  | "know-me"
  | "wordle-duel"
  | "battleship"
  | "two-truths"
  | "bubble-battle"
  | "kart-race";

export interface GameInfo {
  id: GameId;
  title: string;
  emoji: string;
  tagline: string;
  kind: "Guess" | "Action";
  status: "live" | "soon";
}

export const GAMES: GameInfo[] = [
  {
    id: "kart-race",
    title: "Kart Dash",
    emoji: "🏎️",
    kind: "Action",
    status: "live",
    tagline:
      "Race your cat-driven kart, jump over hurdles and cross the finish line first.",
  },
  {
    id: "movie-guess",
    title: "Emoji Movies Guess",
    emoji: "🎬",
    kind: "Guess",
    status: "live",
    tagline:
      "Decode Bollywood movies from emojis, clues, scrambled letters and more. Race or team up.",
  },
  // {
  //   id: "know-me",
  //   title: "How Well Do You Know Me?",
  //   emoji: "🫠",
  //   kind: "Guess",
  //   status: "soon",
  //   tagline: "Predict each other's answers. Whoever gets the most right wins!",
  // },
  // {
  //   id: "wordle-duel",
  //   title: "Wordle Duel",
  //   emoji: "💣",
  //   kind: "Guess",
  //   status: "soon",
  //   tagline:
  //     "Race to guess the same word. You can only see your opponent's color clues!",
  // },
  // {
  //   id: "battleship",
  //   title: "Cute Battleship",
  //   emoji: "🧁",
  //   kind: "Guess",
  //   status: "soon",
  //   tagline:
  //     "Hide your cupcakes and hunt down your opponent's hidden cupcakes!",
  // },
  // {
  //   id: "two-truths",
  //   title: "Catch the Lie",
  //   emoji: "🤥",
  //   kind: "Guess",
  //   status: "soon",
  //   tagline: "Two truths and one lie. Can you spot the lie and score a point?",
  // },
  // {
  //   id: "bubble-battle",
  //   title: "Bubble Battle",
  //   emoji: "🫧",
  //   kind: "Action",
  //   status: "soon",
  //   tagline: "Blast bubbles and knock your opponent out of the arena! (V2)",
  // },
];
