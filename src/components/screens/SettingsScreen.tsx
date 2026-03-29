import { GameSettings, Difficulty } from "@/types/game";
import Icon from "@/components/ui/icon";

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdate: (s: GameSettings) => void;
  onBack: () => void;
}

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Лёгкий", color: "from-emerald-400 to-teal-500" },
  { value: "normal", label: "Нормальный", color: "from-blue-400 to-blue-600" },
  { value: "hard", label: "Сложный", color: "from-orange-400 to-red-500" },
  { value: "insane", label: "Безумный", color: "from-red-500 to-pink-700" },
];

export default function SettingsScreen({ settings, onUpdate, onBack }: SettingsScreenProps) {
  const set = (key: keyof GameSettings, val: GameSettings[keyof GameSettings]) => {
    onUpdate({ ...settings, [key]: val });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 glass-dark border-b border-sakura/10">
        <button onClick={onBack} className="text-muted-foreground hover:text-sakura transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 className="font-orbitron font-bold text-white text-lg">設定</h1>
          <p className="text-xs text-muted-foreground font-zen">Настройки</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg mx-auto w-full space-y-5">

        {/* Sound */}
        <Section title="🔊 Звук" subtitle="Управление громкостью">
          <SliderRow
            label="Общая громкость"
            value={settings.masterVolume}
            onChange={v => set("masterVolume", v)}
          />
          <SliderRow
            label="Музыка"
            value={settings.musicVolume}
            onChange={v => set("musicVolume", v)}
          />
          <SliderRow
            label="Звуковые эффекты"
            value={settings.sfxVolume}
            onChange={v => set("sfxVolume", v)}
          />
        </Section>

        {/* Difficulty */}
        <Section title="⚔️ Сложность" subtitle="Уровень вызова">
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map(d => (
              <button
                key={d.value}
                onClick={() => set("difficulty", d.value)}
                className={`relative py-3 px-4 rounded-xl text-white font-zen font-bold text-sm transition-all overflow-hidden ${
                  settings.difficulty === d.value
                    ? "shadow-[0_0_20px_rgba(255,107,157,0.3)] scale-[1.02]"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${d.color} opacity-80`} />
                {settings.difficulty === d.value && (
                  <div className="absolute inset-0 border-2 border-white/30 rounded-xl" />
                )}
                <span className="relative">{d.label}</span>
                {settings.difficulty === d.value && (
                  <span className="relative ml-2 text-white/80">✓</span>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Gameplay */}
        <Section title="🎮 Геймплей" subtitle="Параметры игры">
          <SliderRow
            label={`Скорость появления кругов (AR: ${settings.approachRate})`}
            value={settings.approachRate}
            min={1}
            max={10}
            step={1}
            onChange={v => set("approachRate", v)}
          />
          <SliderRow
            label={`Сложность попадания (OD: ${settings.overallDifficulty})`}
            value={settings.overallDifficulty}
            min={1}
            max={10}
            step={1}
            onChange={v => set("overallDifficulty", v)}
          />
          <SliderRow
            label={`Размер курсора (${settings.cursorSize})`}
            value={settings.cursorSize}
            min={0.5}
            max={2}
            step={0.1}
            onChange={v => set("cursorSize", v)}
          />
        </Section>

        {/* Controls */}
        <Section title="⌨️ Управление" subtitle="Настройки клавиш">
          <div className="space-y-2">
            {[
              { action: "Попадание 1", key: "ЛКМ / Z" },
              { action: "Попадание 2", key: "ПКМ / X" },
              { action: "Пауза", key: "Escape" },
              { action: "Перезапуск", key: "`" },
            ].map(item => (
              <div key={item.action} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <span className="text-sm font-zen text-muted-foreground">{item.action}</span>
                <kbd className="glass px-3 py-1 rounded-lg text-xs font-orbitron text-white border border-sakura/20">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </Section>

        {/* Display */}
        <Section title="🖥️ Отображение" subtitle="Интерфейс">
          <ToggleRow
            label="Показывать FPS"
            value={settings.showFPS}
            onChange={v => set("showFPS", v)}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 animate-slide-in-up">
      <div className="mb-4">
        <div className="font-zen font-bold text-white">{title}</div>
        <div className="text-xs text-muted-foreground font-zen">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function SliderRow({
  label, value, min = 0, max = 100, step = 1, onChange
}: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-zen text-muted-foreground">{label}</span>
        <span className="text-xs font-orbitron text-sakura">{Math.round(value * 10) / 10}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #ff6b9d ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-zen text-muted-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative ${value ? "bg-sakura" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}
