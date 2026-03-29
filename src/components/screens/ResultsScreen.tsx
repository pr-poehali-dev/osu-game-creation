import { GameState, Level } from "@/types/game";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";

interface ResultsScreenProps {
  state: GameState;
  level: Level;
  onRetry: () => void;
  onMenu: () => void;
}

function getGrade(accuracy: number, misses: number): string {
  if (accuracy >= 99 && misses === 0) return "SS";
  if (accuracy >= 95) return "S";
  if (accuracy >= 90) return "A";
  if (accuracy >= 80) return "B";
  if (accuracy >= 70) return "C";
  return "D";
}

const gradeStyle: Record<string, string> = {
  SS: "text-yellow-300",
  S: "text-gold",
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-violet",
  D: "text-red-400",
};

const gradeGlow: Record<string, string> = {
  SS: "0 0 30px #fde047, 0 0 60px #fde047",
  S: "0 0 30px #fbbf24, 0 0 60px #fbbf24",
  A: "0 0 30px #34d399, 0 0 60px #34d399",
  B: "0 0 30px #60a5fa, 0 0 60px #60a5fa",
  C: "0 0 30px #a855f7",
  D: "0 0 30px #f87171",
};

export default function ResultsScreen({ state, level, onRetry, onMenu }: ResultsScreenProps) {
  const grade = getGrade(state.accuracy, state.misses);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const totalHits = state.hits300 + state.hits100 + state.hits50 + state.misses;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className={`w-full max-w-lg transition-all duration-700 ${animIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground font-zen text-xs tracking-widest uppercase mb-2">結果発表</p>
          <h2 className="font-zen font-bold text-white text-2xl">{level.title}</h2>
          <p className="text-muted-foreground text-sm font-zen">{level.artist}</p>
        </div>

        {/* Grade Card */}
        <div className="glass rounded-3xl p-8 mb-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sakura/5 to-transparent pointer-events-none" />

          <div
            className={`font-orbitron text-8xl font-black mb-4 ${gradeStyle[grade]}`}
            style={{ textShadow: gradeGlow[grade] }}
          >
            {grade}
          </div>

          <div className="font-orbitron text-4xl font-black text-white mb-1">
            {state.score.toLocaleString()}
          </div>
          <div className="text-muted-foreground font-zen text-sm mb-6">очков</div>

          <div className="grid grid-cols-2 gap-4">
            <StatBlock label="Точность" value={`${state.accuracy.toFixed(2)}%`} color="text-sakura" />
            <StatBlock label="Макс. комбо" value={`${state.maxCombo}x`} color="text-violet" />
          </div>
        </div>

        {/* Hit breakdown */}
        <div className="glass rounded-2xl p-5 mb-5">
          <div className="grid grid-cols-4 gap-3 text-center">
            <HitBlock count={state.hits300} label="300" color="text-blue-400" />
            <HitBlock count={state.hits100} label="100" color="text-emerald-400" />
            <HitBlock count={state.hits50} label="50" color="text-yellow-400" />
            <HitBlock count={state.misses} label="MISS" color="text-red-400" />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-xs font-zen text-muted-foreground">
              <span>Всего нот: <span className="text-white font-bold">{totalHits}</span></span>
              <span>
                {grade === "SS" || grade === "S" ? "🌸 Отличный результат!" :
                 grade === "A" ? "⭐ Хорошая игра!" :
                 grade === "B" ? "💪 Неплохо, продолжай!" :
                 "🎯 Тренируйся ещё!"}
              </span>
            </div>
          </div>
        </div>

        {/* Achievements unlocked */}
        {(grade === "S" || grade === "SS") && (
          <div className="glass rounded-2xl p-4 mb-5 border border-gold/20 bg-gold/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-gold font-zen font-bold text-sm">Достижение разблокировано!</div>
                <div className="text-muted-foreground text-xs font-zen">Рейтинг S — получи ранг S на любом уровне</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onMenu}
            className="flex-1 glass py-3.5 rounded-2xl font-zen font-bold text-muted-foreground hover:text-white hover:border-sakura/30 transition-all"
          >
            ← Меню
          </button>
          <button
            onClick={onRetry}
            className="flex-2 flex-grow-[2] py-3.5 rounded-2xl font-zen font-bold text-white bg-gradient-to-r from-sakura to-violet hover:from-sakura-dark hover:to-purple-700 transition-all shadow-[0_0_20px_rgba(255,107,157,0.3)] flex items-center justify-center gap-2"
          >
            <Icon name="RefreshCw" size={16} />
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className={`font-orbitron font-black text-xl ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground font-zen mt-0.5">{label}</div>
    </div>
  );
}

function HitBlock({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div>
      <div className={`font-orbitron font-black text-xl ${color}`}>{count}</div>
      <div className="text-xs text-muted-foreground font-zen">{label}</div>
    </div>
  );
}
