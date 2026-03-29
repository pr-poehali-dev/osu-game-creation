import { useEffect, useRef, useState, useCallback } from "react";
import { Level, HitCircle, HitEffect, GameState } from "@/types/game";
import { DIFFICULTY_CONFIG } from "@/data/gameData";

interface GameScreenProps {
  level: Level;
  onFinish: (state: GameState) => void;
  onExit: () => void;
  settings: { masterVolume: number; sfxVolume: number };
}

const CIRCLE_RADIUS = 36;
const CIRCLE_FADE_TIME = 800;

function generatePattern(difficulty: string, count: number): Array<{ x: number; y: number; time: number }> {
  const cfg = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.normal;
  const bpmInterval = Math.max(250, 500 - cfg.speed * 100);

  return Array.from({ length: count }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 70,
    time: 2000 + i * bpmInterval + Math.random() * 100,
  }));
}

const gradeColor: Record<string, string> = {
  "300": "#60a5fa",
  "100": "#34d399",
  "50": "#fbbf24",
  "miss": "#f87171",
};

export default function GameScreen({ level, onFinish, onExit, settings }: GameScreenProps) {
  const cfg = DIFFICULTY_CONFIG[level.difficulty] || DIFFICULTY_CONFIG.normal;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [circles, setCircles] = useState<HitCircle[]>([]);
  const [effects, setEffects] = useState<HitEffect[]>([]);
  const [state, setState] = useState<GameState>({
    score: 0, combo: 0, maxCombo: 0, hp: 100,
    hits300: 0, hits100: 0, hits50: 0, misses: 0, accuracy: 100,
  });
  const [gameTime, setGameTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [finished, setFinished] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const circlesRef = useRef(circles);
  circlesRef.current = circles;
  const effectIdRef = useRef(0);

  const pattern = useRef(generatePattern(level.difficulty, cfg.circleCount));
  const startTimeRef = useRef(0);
  const animFrameRef = useRef(0);

  const calcAccuracy = (s: GameState) => {
    const total = s.hits300 + s.hits100 + s.hits50 + s.misses;
    if (total === 0) return 100;
    return Math.max(0, ((s.hits300 * 300 + s.hits100 * 100 + s.hits50 * 50) / (total * 300)) * 100);
  };

  const spawnEffect = useCallback((x: number, y: number, rating: string) => {
    const id = ++effectIdRef.current;
    setEffects(prev => [...prev, { id, x, y, rating: rating as "300" | "100" | "50" | "miss", timestamp: Date.now() }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 900);
  }, []);

  const handleCircleClick = useCallback((circleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now() - startTimeRef.current;
    setCircles(prev => {
      const circle = prev.find(c => c.id === circleId && c.hit === null);
      if (!circle) return prev;
      const diff = Math.abs(now - circle.hitTime);
      let rating: "300" | "100" | "50" | "miss";
      if (diff < cfg.hitWindow300) rating = "300";
      else if (diff < cfg.hitWindow100) rating = "100";
      else if (diff < cfg.hitWindow50) rating = "50";
      else rating = "miss";

      spawnEffect(circle.x, circle.y, rating);

      setState(s => {
        const newCombo = rating === "miss" ? 0 : s.combo + 1;
        const points = rating === "300" ? 300 : rating === "100" ? 100 : rating === "50" ? 50 : 0;
        const comboBonus = Math.floor(newCombo / 10);
        const newScore = s.score + points * (1 + comboBonus * 0.1);
        const ns: GameState = {
          ...s,
          score: Math.floor(newScore),
          combo: newCombo,
          maxCombo: Math.max(s.maxCombo, newCombo),
          hp: Math.max(0, Math.min(100, s.hp + (rating === "miss" ? -15 : 5))),
          hits300: s.hits300 + (rating === "300" ? 1 : 0),
          hits100: s.hits100 + (rating === "100" ? 1 : 0),
          hits50: s.hits50 + (rating === "50" ? 1 : 0),
          misses: s.misses + (rating === "miss" ? 1 : 0),
          accuracy: 0,
        };
        ns.accuracy = calcAccuracy(ns);
        stateRef.current = ns;
        return ns;
      });

      return prev.map(c => c.id === circleId ? { ...c, hit: rating, hitAt: Date.now() } : c);
    });
  }, [cfg, spawnEffect]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;
    startTimeRef.current = Date.now();

    const tick = () => {
      const now = Date.now() - startTimeRef.current;
      setGameTime(now);

      // Spawn circles
      pattern.current.forEach(p => {
        const shouldSpawn = p.time - cfg.approachTime;
        if (now >= shouldSpawn && now < shouldSpawn + 50) {
          setCircles(prev => {
            const exists = prev.some(c => c.spawnTime === p.time);
            if (exists) return prev;
            return [...prev, {
              id: p.time,
              x: p.x,
              y: p.y,
              spawnTime: now,
              hitTime: p.time,
              number: prev.length + 1,
              hit: null,
            }];
          });
        }
      });

      // Miss detection
      const deadline = cfg.hitWindow50 + 200;
      setCircles(prev => {
        let changed = false;
        const updated = prev.map(c => {
          if (c.hit === null && now > c.hitTime + deadline) {
            changed = true;
            spawnEffect(c.x, c.y, "miss");
            setState(s => {
              const ns = { ...s, combo: 0, hp: Math.max(0, s.hp - 20), misses: s.misses + 1, accuracy: 0 };
              ns.accuracy = calcAccuracy(ns);
              return ns;
            });
            return { ...c, hit: "miss" as const };
          }
          return c;
        });
        return changed ? updated : prev;
      });

      // Cleanup hit circles
      setCircles(prev => prev.filter(c => {
        if (c.hit !== null && c.hitAt && Date.now() - c.hitAt > 500) return false;
        if (c.hit === "miss" && now > c.hitTime + deadline + 600) return false;
        return true;
      }));

      // Check finish
      const lastCircleTime = pattern.current[pattern.current.length - 1]?.time ?? 0;
      if (now > lastCircleTime + 2000 && !finished) {
        setFinished(true);
        setIsRunning(false);
        setTimeout(() => onFinish(stateRef.current), 800);
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isRunning, cfg, finished, onFinish, spawnEffect]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setShowCountdown(false);
      setIsRunning(true);
    }
  }, [countdown]);

  // HP death
  useEffect(() => {
    if (state.hp <= 0 && isRunning) {
      setIsRunning(false);
      setTimeout(() => onFinish(stateRef.current), 500);
    }
  }, [state.hp, isRunning, onFinish]);

  const getCircleProgress = (circle: HitCircle) => {
    const now = gameTime;
    const elapsed = now - (circle.hitTime - cfg.approachTime);
    return Math.min(1, elapsed / cfg.approachTime);
  };

  const getRingScale = (circle: HitCircle) => {
    const progress = getCircleProgress(circle);
    return 3 - progress * 2;
  };

  return (
    <div className="relative w-full h-screen game-canvas select-none" ref={canvasRef}>
      {/* HUD Top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-20 glass-dark border-b border-sakura/10">
        <button
          onClick={onExit}
          className="text-muted-foreground hover:text-sakura transition-colors text-xs font-zen flex items-center gap-1.5"
        >
          ← Выйти
        </button>
        <div className="flex items-center gap-2 text-center">
          <div>
            <div className="font-orbitron text-lg font-black text-white tracking-wider">
              {state.score.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-zen">Очки</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-zen">
          <span className="text-muted-foreground">
            <span className="text-white font-bold">{state.accuracy.toFixed(1)}%</span> точность
          </span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="absolute top-14 left-6 right-6 z-20">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="hp-bar h-full rounded-full" style={{ width: `${state.hp}%` }} />
        </div>
      </div>

      {/* Combo */}
      {state.combo > 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center animate-combo-bounce">
          <div className="font-orbitron text-4xl font-black text-sakura neon-text">{state.combo}x</div>
          <div className="text-xs text-muted-foreground font-zen tracking-widest">КОМБО</div>
        </div>
      )}

      {/* Hit Circles */}
      {circles.map(circle => {
        if (circle.hit !== null && circle.hit !== "miss") return null;
        const progress = getCircleProgress(circle);
        const ringScale = getRingScale(circle);
        const opacity = circle.hit === "miss" ? 0 : Math.min(1, progress * 2);

        return (
          <div
            key={circle.id}
            className="hit-circle z-10"
            style={{
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              width: CIRCLE_RADIUS * 2,
              height: CIRCLE_RADIUS * 2,
              opacity,
            }}
            onClick={(e) => handleCircleClick(circle.id, e)}
          >
            {/* Approach ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-sakura transition-transform"
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
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            transform: "translate(-50%, -50%)",
          }}
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
        <div className="text-xs font-zen text-muted-foreground space-y-1">
          <div className="flex gap-3">
            <span className="text-blue-400">300: {state.hits300}</span>
            <span className="text-emerald-400">100: {state.hits100}</span>
            <span className="text-yellow-400">50: {state.hits50}</span>
            <span className="text-red-400">MISS: {state.misses}</span>
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

      {/* Grid decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <svg width="100%" height="100%">
          <defs>
            <radialGradient id="center-glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#center-glow)"/>
        </svg>
      </div>
    </div>
  );
}