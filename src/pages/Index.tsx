import { useState, useCallback } from "react";
import { Screen, Level, GameState, GameSettings } from "@/types/game";
import SakuraPetals from "@/components/SakuraPetals";
import StarBackground from "@/components/StarBackground";
import MenuScreen from "@/components/screens/MenuScreen";
import GameScreen from "@/components/screens/GameScreen";
import ResultsScreen from "@/components/screens/ResultsScreen";
import LeaderboardScreen from "@/components/screens/LeaderboardScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 90,
  difficulty: "normal",
  approachRate: 5,
  overallDifficulty: 5,
  cursorSize: 1,
  showFPS: false,
  key1: "z",
  key2: "x",
};

export default function Index() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [lastResult, setLastResult] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [gameKey, setGameKey] = useState(0);
  const playerName = "Игрок";

  const handlePlay = useCallback((level: Level) => {
    setSelectedLevel(level);
    setGameKey(k => k + 1);
    setScreen("game");
  }, []);

  const handleFinish = useCallback((state: GameState) => {
    setLastResult(state);
    setScreen("results");
  }, []);

  const handleRetry = useCallback(() => {
    if (!selectedLevel) return;
    setGameKey(k => k + 1);
    setScreen("game");
  }, [selectedLevel]);

  const handleNavigate = useCallback((s: string) => {
    setScreen(s as Screen);
  }, []);

  return (
    <div className="relative min-h-screen bg-background font-zen overflow-hidden">
      <StarBackground />
      {screen !== "game" && <SakuraPetals />}

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #ff6b9d, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {screen === "menu" && (
          <MenuScreen
            onPlay={handlePlay}
            onNavigate={handleNavigate}
            playerName={playerName}
          />
        )}

        {screen === "game" && selectedLevel && (
          <GameScreen
            key={gameKey}
            level={selectedLevel}
            onFinish={handleFinish}
            onExit={() => setScreen("menu")}
            settings={{ masterVolume: settings.masterVolume, sfxVolume: settings.sfxVolume, key1: settings.key1, key2: settings.key2 }}
          />
        )}

        {screen === "results" && lastResult && selectedLevel && (
          <ResultsScreen
            state={lastResult}
            level={selectedLevel}
            onRetry={handleRetry}
            onMenu={() => setScreen("menu")}
          />
        )}

        {screen === "leaderboard" && (
          <LeaderboardScreen
            onBack={() => setScreen("menu")}
            playerName={playerName}
          />
        )}

        {screen === "profile" && (
          <ProfileScreen
            onBack={() => setScreen("menu")}
            playerName={playerName}
          />
        )}

        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            onUpdate={setSettings}
            onBack={() => setScreen("menu")}
          />
        )}
      </div>

      {/* Japanese decorative kanji */}
      {screen === "menu" && (
        <div className="fixed bottom-8 right-8 pointer-events-none z-0 opacity-[0.04] select-none">
          <div className="font-zen font-black text-white leading-none" style={{ fontSize: "120px" }}>
            桜
          </div>
        </div>
      )}
    </div>
  );
}