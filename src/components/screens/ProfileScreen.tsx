import { ACHIEVEMENTS } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface ProfileScreenProps {
  onBack: () => void;
  playerName: string;
}

const stats = [
  { label: "Сыграно партий", value: "43", icon: "🎮" },
  { label: "Лучший счёт", value: "7,200,400", icon: "⭐" },
  { label: "Макс. комбо", value: "540x", icon: "🔥" },
  { label: "Точность", value: "94.2%", icon: "🎯" },
  { label: "Уровень", value: "28", icon: "📊" },
  { label: "Часов в игре", value: "12.5", icon: "⏱️" },
];

export default function ProfileScreen({ onBack, playerName }: ProfileScreenProps) {
  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const total = ACHIEVEMENTS.length;
  const xp = 7200;
  const xpMax = 10000;
  const level = 28;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 glass-dark border-b border-sakura/10">
        <button onClick={onBack} className="text-muted-foreground hover:text-sakura transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 className="font-orbitron font-bold text-white text-lg">プロフィール</h1>
          <p className="text-xs text-muted-foreground font-zen">Личный кабинет</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full">
        {/* Profile card */}
        <div className="glass rounded-3xl p-6 mb-5 relative overflow-hidden animate-slide-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-sakura/10 to-violet/5 pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sakura to-violet flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(255,107,157,0.4)]">
                🎮
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center text-xs font-orbitron font-black text-background">
                {level}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-zen font-black text-white text-xl mb-0.5">{playerName}</div>
              <div className="text-xs text-muted-foreground font-zen mb-3">🇷🇺 Ритм-мастер</div>
              {/* XP bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-zen text-muted-foreground">
                  <span>Опыт</span>
                  <span className="text-sakura">{xp.toLocaleString()} / {xpMax.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(xp / xpMax) * 100}%`,
                      background: "linear-gradient(90deg, #ff6b9d, #a855f7)",
                      boxShadow: "0 0 8px rgba(255,107,157,0.6)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass rounded-2xl p-3 text-center animate-slide-in-up"
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-orbitron font-black text-sm text-white">{s.value}</div>
              <div className="text-xs text-muted-foreground font-zen mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h3 className="font-zen font-bold text-white">Достижения</h3>
            </div>
            <span className="text-xs text-muted-foreground font-zen glass px-3 py-1 rounded-full">
              {unlocked}/{total} разблокировано
            </span>
          </div>

          {/* Achievement progress */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(unlocked / total) * 100}%`,
                background: "linear-gradient(90deg, #fbbf24, #ff6b9d)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {ACHIEVEMENTS.map((ach, i) => (
              <div
                key={ach.id}
                className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all animate-slide-in-up ${
                  ach.unlocked ? "border-gold/20 bg-gold/5" : "opacity-60"
                }`}
                style={{ animationDelay: `${i * 0.04}s`, animationFillMode: "both" }}
              >
                <div className={`text-2xl ${!ach.unlocked ? "grayscale" : ""}`}>{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-zen font-bold text-sm ${ach.unlocked ? "text-white" : "text-muted-foreground"}`}>
                    {ach.title}
                  </div>
                  <div className="text-xs text-muted-foreground font-zen">{ach.description}</div>
                  {ach.progress !== undefined && ach.maxProgress !== undefined && (
                    <div className="mt-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{ach.progress} / {ach.maxProgress}</span>
                        <span>{Math.round((ach.progress / ach.maxProgress) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sakura"
                          style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {ach.unlocked && (
                  <div className="text-gold text-lg">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
