import { LEADERBOARD } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface LeaderboardScreenProps {
  onBack: () => void;
  playerName: string;
}

const gradeColor: Record<string, string> = {
  SS: "text-yellow-300",
  S: "text-gold",
  A: "text-emerald-400",
  B: "text-blue-400",
};

const countryFlag: Record<string, string> = {
  JP: "🇯🇵", KR: "🇰🇷", US: "🇺🇸", CN: "🇨🇳", TW: "🇹🇼", VN: "🇻🇳", RU: "🇷🇺",
};

export default function LeaderboardScreen({ onBack, playerName }: LeaderboardScreenProps) {
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  const playerEntry = LEADERBOARD.find(e => e.name === playerName || e.name === "Игрок");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 glass-dark border-b border-sakura/10">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-sakura transition-colors"
        >
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 className="font-orbitron font-bold text-white text-lg">ランキング</h1>
          <p className="text-xs text-muted-foreground font-zen">Таблица лидеров</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm font-zen text-muted-foreground">
          <Icon name="Globe" size={14} />
          <span>Глобальный рейтинг</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-8 h-40">
          {/* 2nd */}
          <PodiumCard entry={top3[1]} height="h-28" />
          {/* 1st */}
          <PodiumCard entry={top3[0]} height="h-36" isFirst />
          {/* 3rd */}
          <PodiumCard entry={top3[2]} height="h-20" />
        </div>

        {/* Rest of leaderboard */}
        <div className="space-y-2 mb-6">
          {rest.map((entry, i) => {
            const isMe = entry.name === playerName || entry.name === "Игрок";
            return (
              <div
                key={entry.rank}
                className={`glass rounded-xl px-4 py-3 flex items-center gap-4 transition-all animate-slide-in-up ${
                  isMe ? "border-sakura/40 bg-sakura/5 shadow-[0_0_15px_rgba(255,107,157,0.1)]" : "hover:border-sakura/20"
                }`}
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
              >
                <div className="w-7 text-center font-orbitron font-bold text-muted-foreground text-sm">
                  #{entry.rank}
                </div>
                <div className="text-2xl">{entry.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-zen font-bold text-sm ${isMe ? "text-sakura" : "text-white"}`}>
                      {entry.name}
                    </span>
                    {isMe && <span className="text-xs bg-sakura/20 text-sakura px-2 py-0.5 rounded-full font-zen">Вы</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-zen">
                    {countryFlag[entry.country]} {entry.accuracy.toFixed(1)}% точность
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron font-bold text-sm text-white">{entry.score.toLocaleString()}</div>
                  <div className={`text-xs font-orbitron font-black ${gradeColor[entry.grade] || "text-muted-foreground"}`}>
                    {entry.grade}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-zen w-12 text-right">
                  {entry.combo}x
                </div>
              </div>
            );
          })}
        </div>

        {/* Your stats */}
        {playerEntry && (
          <div className="glass rounded-2xl p-5 border border-sakura/20 bg-sakura/5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="User" size={16} className="text-sakura" />
              <span className="font-zen font-bold text-sakura text-sm">Ваша позиция</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-orbitron font-black text-lg text-white">#{playerEntry.rank}</div>
                <div className="text-xs text-muted-foreground font-zen">Место</div>
              </div>
              <div>
                <div className="font-orbitron font-black text-lg text-sakura">{playerEntry.score.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground font-zen">Очки</div>
              </div>
              <div>
                <div className="font-orbitron font-black text-lg text-emerald-400">{playerEntry.accuracy}%</div>
                <div className="text-xs text-muted-foreground font-zen">Точность</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ entry, height, isFirst }: { entry: typeof LEADERBOARD[0]; height: string; isFirst?: boolean }) {
  const rankColors = ["text-gold", "text-slate-300", "text-orange-400"];
  const rankEmoji = ["🥇", "🥈", "🥉"];
  const idx = entry.rank - 1;

  return (
    <div className={`flex flex-col items-center gap-2 ${height} justify-end`}>
      <div className="text-2xl">{entry.avatar}</div>
      <div className="font-zen text-xs text-white font-bold text-center max-w-[70px] truncate">{entry.name}</div>
      <div
        className={`glass rounded-t-xl w-20 flex flex-col items-center justify-center py-3 ${
          isFirst ? "bg-gold/10 border-gold/30" : ""
        }`}
        style={{ height: isFirst ? "80px" : "60px" }}
      >
        <div className="text-xl mb-0.5">{rankEmoji[idx]}</div>
        <div className={`font-orbitron font-black text-sm ${rankColors[idx]}`}>
          {entry.score.toLocaleString().slice(0, -3)}к
        </div>
      </div>
    </div>
  );
}
