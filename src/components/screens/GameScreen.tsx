import { useEffect, useRef, useState, useCallback } from "react";
import { Level, HitCircle, HitEffect, GameState } from "@/types/game";
import { DIFFICULTY_CONFIG } from "@/data/gameData";

interface GameScreenProps {
  level: Level;
  onFinish: (state: GameState) => void;
  onExit: () => void;
  settings: { masterVolume: number; sfxVolume: number; key1: string; key2: string };
}

const CIRCLE_RADIUS = 36;

interface PatternNote {
  id: number;
  x: number;
  y: number;
  hitTime: number;
  spawned: boolean;
}

function generatePattern(difficulty: string, count: number): PatternNote[] {
  const cfg = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.normal;
  const bpmInterval = Math.max(250, 500 - cfg.speed * 100);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 70,
    hitTime: 2000 + i * bpmInterval,
    spawned: false,
  }));
}

const gradeColor: Record<string, string> = {
  "300": "#60a5fa",
  "100": "#34d399",
  "50":  "#fbbf24",
  "miss": "#f87171",
};

function calcAccuracy(s: GameState): number {
  const total = s.hits300 + s.hits100 + s.hits50 + s.misses;
  if (total === 0) return 100;
  return Math.max(0, ((s.hits300 * 300 + s.hits100 * 100 + s.hits50 * 50) / (total * 300)) * 100);
}

function applyHit(s: GameState, rating: "300" | "100" | "50" | "miss"): GameState {
  const newCombo = rating === "miss" ? 0 : s.combo + 1;
  const points   = rating === "300" ? 300 : rating === "100" ? 100 : rating === "50" ? 50 : 0;
  const bonus    = Math.floor(newCombo / 10);
  const ns: GameState = {
    ...s,
    score:    Math.floor(s.score + points * (1 + bonus * 0.1)),
    combo:    newCombo,
    maxCombo: Math.max(s.maxCombo, newCombo),
    hp:       Math.max(0, Math.min(100, s.hp + (rating === "miss" ? -20 : 5))),
    hits300:  s.hits300 + (rating === "300" ? 1 : 0),
    hits100:  s.hits100 + (rating === "100" ? 1 : 0),
    hits50:   s.hits50  + (rating === "50"  ? 1 : 0),
    misses:   s.misses  + (rating === "miss" ? 1 : 0),
    accuracy: 0,
  };
  ns.accuracy = calcAccuracy(ns);
  return ns;
}

export default function GameScreen({ level, onFinish, onExit, settings }: GameScreenProps) {
  const cfg = DIFFICULTY_CONFIG[level.difficulty] || DIFFICULTY_CONFIG.normal;

  // All mutable game state lives in refs — no re-render per frame
  const circlesRef  = useRef<HitCircle[]>([]);
  const gameStateRef = useRef<GameState>({ score: 0, combo: 0, maxCombo: 0, hp: 100, hits300: 0, hits100: 0, hits50: 0, misses: 0, accuracy: 100 });
  const patternRef  = useRef<PatternNote[]>(generatePattern(level.difficulty, cfg.circleCount));
  const startRef    = useRef(0);
  const rafRef      = useRef(0);
  const runningRef  = useRef(false);
  const finishedRef = useRef(false);
  const effectIdRef = useRef(0);
  const key1Ref     = useRef(settings.key1.toLowerCase());
  const key2Ref     = useRef(settings.key2.toLowerCase());

  useEffect(() => { key1Ref.current = settings.key1.toLowerCase(); }, [settings.key1]);
  useEffect(() => { key2Ref.current = settings.key2.toLowerCase(); }, [settings.key2]);

  // React state only for rendering
  const [renderCircles, setRenderCircles]   = useState<HitCircle[]>([]);
  const [effects, setEffects]               = useState<HitEffect[]>([]);
  const [displayState, setDisplayState]     = useState<GameState>(gameStateRef.current);
  const [gameTime, setGameTime]             = useState(0);
  const [showCountdown, setShowCountdown]   = useState(true);
  const [countdown, setCountdown]           = useState(3);

  // Throttle HUD updates — only every 4 frames
  const hudFrameRef = useRef(0);

  const spawnEffect = useCallback((x: number, y: number, rating: "300" | "100" | "50" | "miss") => {
    const id = ++effectIdRef.current;
    setEffects(prev => [...prev, { id, x, y, rating, timestamp: Date.now() }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 800);
  }, []);

  const getRating = useCallback((diff: number): "300" | "100" | "50" | "miss" => {
    if (diff < cfg.hitWindow300) return "300";
    if (diff < cfg.hitWindow100) return "100";
    if (diff < cfg.hitWindow50)  return "50";
    return "miss";
  }, [cfg]);

  const hitCircle = useCallback((circle: HitCircle) => {
    const now    = Date.now() - startRef.current;
    const diff   = Math.abs(now - circle.hitTime);
    const rating = getRating(diff);
    circle.hit   = rating;
    circle.hitAt = Date.now();
    gameStateRef.current = applyHit(gameStateRef.current, rating);
    spawnEffect(circle.x, circle.y, rating);
  }, [getRating, spawnEffect]);

  // Click on circle
  const handleCircleClick = useCallback((circleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const circle = circlesRef.current.find(c => c.id === circleId && c.hit === null);
    if (!circle) return;
    hitCircle(circle);
    setRenderCircles([...circlesRef.current]);
    setDisplayState({ ...gameStateRef.current });
  }, [hitCircle]);

  // Keyboard: hit earliest active circle
  const handleKeyHit = useCallback(() => {
    const circle = circlesRef.current
      .filter(c => c.hit === null)
      .sort((a, b) => a.hitTime - b.hitTime)[0];
    if (!circle) return;
    hitCircle(circle);
    setRenderCircles([...circlesRef.current]);
    setDisplayState({ ...gameStateRef.current });
  }, [hitCircle]);

  // Keyboard listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") { onExit(); return; }
      if (!runningRef.current) return;
      if (k === key1Ref.current || k === key2Ref.current) {
        e.preventDefault();
        handleKeyHit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKeyHit, onExit]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    setShowCountdown(false);
    runningRef.current = true;
    // Trigger loop
    setGameTime(0);
  }, [countdown]);

  // Kick off loop once running
  useEffect(() => {
    if (!runningRef.current) return;
    startRef.current = Date.now();
    const deadline   = cfg.hitWindow50 + 200;
    const lastHitTime = patternRef.current[patternRef.current.length - 1]?.hitTime ?? 0;
    hudFrameRef.current = 0;

    const tick = () => {
      const now = Date.now() - startRef.current;
      hudFrameRef.current++;

      for (const note of patternRef.current) {
        if (note.spawned) continue;
        if (now >= note.hitTime - cfg.approachTime) {
          note.spawned = true;
          circlesRef.current = [...circlesRef.current, {
            id: note.id, x: note.x, y: note.y,
            spawnTime: now, hitTime: note.hitTime,
            number: note.id, hit: null,
          }];
        }
      }

      let dirty = false;
      for (const c of circlesRef.current) {
        if (c.hit === null && now > c.hitTime + deadline) {
          c.hit = "miss"; c.hitAt = Date.now();
          gameStateRef.current = applyHit(gameStateRef.current, "miss");
          spawnEffect(c.x, c.y, "miss");
          dirty = true;
        }
      }

      const lenBefore = circlesRef.current.length;
      circlesRef.current = circlesRef.current.filter(c =>
        !(c.hit !== null && c.hitAt && Date.now() - c.hitAt > 500)
      );
      if (circlesRef.current.length !== lenBefore) dirty = true;

      if (hudFrameRef.current % 2 === 0) setGameTime(now);
      if (dirty || hudFrameRef.current % 3 === 0) setRenderCircles([...circlesRef.current]);
      if (dirty || hudFrameRef.current % 4 === 0) setDisplayState({ ...gameStateRef.current });

      if (gameStateRef.current.hp <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        runningRef.current  = false;
        setTimeout(() => onFinish(gameStateRef.current), 400);
        return;
      }
      if (now > lastHitTime + 2000 && !finishedRef.current) {
        finishedRef.current = true;
        runningRef.current  = false;
        setTimeout(() => onFinish(gameStateRef.current), 600);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCountdown]);

  const getCircleProgress = (circle: HitCircle) => {
    const elapsed = gameTime - (circle.hitTime - cfg.approachTime);
    return Math.min(1, Math.max(0, elapsed / cfg.approachTime));
  };

  return (
    <div className="relative w-full h-screen game-canvas select-none">
      {/* HUD Top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-20 glass-dark border-b border-sakura/10">
        <button
          onClick={onExit}
          className="text-muted-foreground hover:text-sakura transition-colors text-xs font-zen flex items-center gap-1.5"
        >
          ← Выйти
        </button>
        <div className="text-center">
          <div className="font-orbitron text-lg font-black text-white tracking-wider">
            {displayState.score.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground font-zen">Очки</div>
        </div>
        <div className="text-xs font-zen text-muted-foreground">
          <span className="text-white font-bold">{displayState.accuracy.toFixed(1)}%</span> точность
        </div>
      </div>

      {/* HP Bar */}
      <div className="absolute top-14 left-6 right-6 z-20">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="hp-bar h-full rounded-full" style={{ width: `${displayState.hp}%` }} />
        </div>
      </div>

      {/* Combo */}
      {displayState.combo > 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
          <div className="font-orbitron text-4xl font-black text-sakura neon-text">{displayState.combo}x</div>
          <div className="text-xs text-muted-foreground font-zen tracking-widest">КОМБО</div>
        </div>
      )}

      {/* Hit Circles */}
      {renderCircles.map(circle => {
        if (circle.hit !== null) return null;
        const progress  = getCircleProgress(circle);
        const ringScale = Math.max(1, 3 - progress * 2);
        const opacity   = Math.min(1, progress * 2);

        return (
          <div
            key={circle.id}
            className="hit-circle z-10"
            style={{
              left:   `${circle.x}%`,
              top:    `${circle.y}%`,
              width:  CIRCLE_RADIUS * 2,
              height: CIRCLE_RADIUS * 2,
              opacity,
            }}
            onClick={(e) => handleCircleClick(circle.id, e)}
          >
            {/* Approach ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-sakura"
              style={{
                transform: `scale(${ringScale})`,
                opacity: 0.7,
                boxShadow: "0 0 8px rgba(255,107,157,0.4)",
              }}
            />
            {/* Main circle */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center font-orbitron font-black text-white text-sm"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(255,180,210,0.9), rgba(255,107,157,0.7))",
                border: "3px solid rgba(255,255,255,0.8)",
                boxShadow: "0 0 20px rgba(255,107,157,0.5), inset 0 0 10px rgba(255,255,255,0.1)",
              }}
            >
              {circle.number}
            </div>
          </div>
        );
      })}

      {/* Hit Effects */}
      {effects.map(effect => (
        <div
          key={effect.id}
          className="absolute pointer-events-none z-30 animate-float-up"
          style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div
            className="font-orbitron font-black text-2xl"
            style={{ color: gradeColor[effect.rating ?? "miss"], textShadow: `0 0 15px ${gradeColor[effect.rating ?? "miss"]}` }}
          >
            {effect.rating === "miss" ? "MISS" : effect.rating}
          </div>
        </div>
      ))}

      {/* Bottom stats */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
        <div className="text-xs font-zen text-muted-foreground space-y-1.5">
          <div className="flex gap-3">
            <span className="text-blue-400">300: {displayState.hits300}</span>
            <span className="text-emerald-400">100: {displayState.hits100}</span>
            <span className="text-yellow-400">50: {displayState.hits50}</span>
            <span className="text-red-400">MISS: {displayState.misses}</span>
          </div>
          <div className="flex gap-2 items-center">
            <kbd className="glass px-2.5 py-1 rounded-lg font-orbitron text-sakura border border-sakura/30 uppercase">{settings.key1}</kbd>
            <kbd className="glass px-2.5 py-1 rounded-lg font-orbitron text-sakura border border-sakura/30 uppercase">{settings.key2}</kbd>
            <span className="text-muted-foreground">или клик мышью</span>
          </div>
        </div>
        <div className="text-xs font-zen text-muted-foreground text-right">
          <div className="text-white font-bold">{level.title}</div>
          <div>{level.artist}</div>
        </div>
      </div>

      {/* Countdown */}
      {showCountdown && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm">
          <div className="text-center animate-scale-in">
            {countdown > 0 ? (
              <div className="font-orbitron text-9xl font-black text-sakura neon-text">{countdown}</div>
            ) : (
              <div className="font-zen text-4xl font-bold text-white">始める！</div>
            )}
          </div>
        </div>
      )}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-15 z-0">
        <svg width="100%" height="100%">
          <defs>
            <radialGradient id="center-glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#center-glow)"/>
        </svg>
      </div>
    </div>
  );
}