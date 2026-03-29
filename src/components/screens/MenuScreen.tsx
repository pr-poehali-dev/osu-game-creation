import { Level } from "@/types/game";
import { LEVELS } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface MenuScreenProps {
  onPlay: (level: Level) => void;
  onNavigate: (screen: string) => void;
  playerName: string;
}

const difficultyLabel: Record<string, string> = {
  easy: "Лёгкий",
  normal: "Нормальный",
  hard: "Сложный",
  insane: "Безумный",
};

const difficultyColor: Record<string, string> = {
  easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  normal: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  hard: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  insane: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function MenuScreen({ onPlay, onNavigate, playerName }: MenuScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 glass-dark border-b border-sakura/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sakura to-violet flex items-center justify-center">
            <span className="text-lg">🌸</span>
          </div>
          <div>
            <div className="font-orbitron text-xl font-bold neon-text-soft text-sakura">桜リズム</div>
            <div className="text-xs text-muted-foreground font-zen">Sakura Rhythm</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("profile")}
            className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm hover:border-sakura/40 transition-all hover:bg-sakura/10"
          >
            <span className="text-lg">🎮</span>
            <span className="font-zen text-foreground">{playerName}</span>
          </button>
          <button
            onClick={() => onNavigate("leaderboard")}
            className="glass p-2.5 rounded-full hover:border-sakura/40 transition-all hover:bg-sakura/10"
            title="Рейтинг"
          >
            <Icon name="Trophy" size={18} className="text-gold" />
          </button>
          <button
            onClick={() => onNavigate("settings")}
            className="glass p-2.5 rounded-full hover:border-sakura/40 transition-all hover:bg-sakura/10"
            title="Настройки"
          >
            <Icon name="Settings" size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-12 px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sakura/5 to-transparent pointer-events-none" />
        <p className="text-muted-foreground font-zen text-sm mb-3 tracking-widest uppercase">選択してください</p>
        <h1 className="font-orbitron text-4xl font-black text-white mb-2">
          Выбери <span className="text-sakura neon-text-soft">уровень</span>
        </h1>
        <p className="text-muted-foreground font-zen text-sm">Нажми на круг — попади в ритм</p>
      </div>

      {/* Level Grid */}
      <div className="flex-1 px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {LEVELS.map((level, i) => (
            <LevelCard
              key={level.id}
              level={level}
              index={i}
              onPlay={() => onPlay(level)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelCard({ level, index, onPlay }: { level: Level; index: number; onPlay: () => void }) {
  return (
    <div
      className="glass rounded-2xl overflow-hidden cursor-pointer group hover:border-sakura/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,107,157,0.15)] animate-slide-in-up"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "both" }}
      onClick={onPlay}
    >
      {/* Cover */}
      <div className={`h-28 bg-gradient-to-br ${level.coverColor} relative flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px, 25px 25px",
          }}
        />
        <div className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">🌸</div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-zen font-bold px-2.5 py-1 rounded-full border ${difficultyColor[level.difficulty]}`}>
            {difficultyLabel[level.difficulty]}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-xs ${i < level.stars ? "star-fill" : "star-empty"}`}>★</span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="font-zen font-bold text-white text-base leading-tight mb-0.5">{level.title}</div>
        <div className="text-xs text-muted-foreground font-zen mb-3">{level.artist}</div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Icon name="Music" size={11} />
              {level.bpm} BPM
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={11} />
              {level.duration}
            </span>
          </div>
          <button
            className="flex items-center gap-1.5 bg-sakura text-white text-xs font-zen font-bold px-3 py-1.5 rounded-full hover:bg-sakura-dark transition-colors shadow-[0_0_15px_rgba(255,107,157,0.3)]"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
          >
            <Icon name="Play" size={11} />
            Играть
          </button>
        </div>
      </div>
    </div>
  );
}
