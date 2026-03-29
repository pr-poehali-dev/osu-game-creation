export type Screen = "menu" | "game" | "results" | "leaderboard" | "profile" | "settings";

export type Difficulty = "easy" | "normal" | "hard" | "insane";

export type HitRating = "300" | "100" | "50" | "miss" | null;

export interface HitCircle {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
  hitTime: number;
  number: number;
  hit: HitRating;
  hitAt?: number;
}

export interface HitEffect {
  id: number;
  x: number;
  y: number;
  rating: HitRating;
  timestamp: number;
}

export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  hp: number;
  hits300: number;
  hits100: number;
  hits50: number;
  misses: number;
  accuracy: number;
}

export interface Level {
  id: number;
  title: string;
  artist: string;
  difficulty: Difficulty;
  stars: number;
  bpm: number;
  duration: string;
  coverColor: string;
  pattern: "easy" | "normal" | "hard" | "insane";
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  combo: number;
  grade: string;
  avatar: string;
  country: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  difficulty: Difficulty;
  approachRate: number;
  overallDifficulty: number;
  cursorSize: number;
  showFPS: boolean;
}
