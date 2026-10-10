import { useState } from 'react';
import { usePomodoro, TimerMode } from './hooks/usePomodoro';

const MODE_CONFIG = {
  focus: { label: 'Focus', color: 'text-red-400', glowClass: 'glow-focus', ringColor: '#ef4444' },
  shortBreak: { label: 'Short Break', color: 'text-green-400', glowClass: 'glow-short', ringColor: '#22c55e' },
  longBreak: { label: 'Long Break', color: 'text-blue-400', glowClass: 'glow-long', ringColor: '#3b82f6' },
};

function App() {
  const {
    mode,
    timeLeft,
    totalTime,
    progress,
    isRunning,
    stats,
    settings,
    showSettings,
    setShowSettings,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
    formatTime,
  } = usePomodoro();

  const config = MODE_CONFIG[mode];
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className={`fixed inset-0 opacity-20 transition-all duration-1000 ${
        mode === 'focus' ? 'bg-gradient-radial from-red-900/30 via-transparent to-transparent' :
        mode === 'shortBreak' ? 'bg-gradient-radial from-green-900/30 via-transparent to-transparent' :
        'bg-gradient-radial from-blue-900/30 via-transparent to-transparent'
      }`} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white/90 tracking-tight">Pomodoro Timer</h1>
          <p className="text-sm text-white/40 mt-1">Stay focused, be productive</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 bg-white/5 backdrop-blur-sm rounded-full p-1.5 border border-white/10">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`mode-btn ${mode === m ? 'mode-btn-active' : 'mode-btn-inactive'}`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center">
          <svg
            width="320"
            height="320"
            className={`transform -rotate-90 ${config.glowClass}`}
          >
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke={config.ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="timer-ring"
              style={{ opacity: 0.9 }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-mono font-light tracking-wider ${config.color}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-white/40 mt-2 uppercase tracking-widest">
              {config.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          {/* Reset */}
          <button
            onClick={reset}
            className="control-btn bg-white/5 border border-white/10 hover:bg-white/10"
            title="Reset"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
              <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 22v-6h6" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={isRunning ? pause : start}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 
                       hover:scale-110 active:scale-95 shadow-lg ${
              isRunning 
                ? 'bg-white/15 border border-white/20' 
                : `bg-gradient-to-br ${mode === 'focus' ? 'from-red-500 to-red-600' : mode === 'shortBreak' ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600'}`
            }`}
          >
            {isRunning ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="control-btn bg-white/5 border border-white/10 hover:bg-white/10"
            title="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            updateSettings={updateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Stats */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="stat-card text-center">
            <div className="text-2xl font-bold text-white/90">{stats.sessionsCompleted}</div>
            <div className="text-xs text-white/40 mt-1">Sessions Today</div>
          </div>
          <div className="stat-card text-center">
            <div className="text-2xl font-bold text-white/90">{stats.totalFocusMinutes}</div>
            <div className="text-xs text-white/40 mt-1">Focus Minutes</div>
          </div>
        </div>

        {/* Session indicator dots */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-white/30 mr-2">Progress:</span>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < (stats.sessionsCompleted % 4)
                  ? 'bg-red-400 scale-100'
                  : 'bg-white/10 scale-90'
              }`}
            />
          ))}
          <span className="text-xs text-white/30 ml-2">
            {4 - (stats.sessionsCompleted % 4)} until long break
          </span>
        </div>
      </div>
    </div>
  );
}

interface SettingsPanelProps {
  settings: { focus: number; shortBreak: number; longBreak: number };
  updateSettings: (settings: { focus: number; shortBreak: number; longBreak: number }) => void;
  onClose: () => void;
}

function SettingsPanel({ settings, updateSettings, onClose }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    // Validate
    const validated = {
      focus: Math.max(1, Math.min(120, localSettings.focus)),
      shortBreak: Math.max(1, Math.min(30, localSettings.shortBreak)),
      longBreak: Math.max(1, Math.min(60, localSettings.longBreak)),
    };
    updateSettings(validated);
    onClose();
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Timer Settings</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <SettingRow
          label="Focus Duration"
          value={localSettings.focus}
          onChange={(v) => setLocalSettings({ ...localSettings, focus: v })}
          min={1}
          max={120}
          unit="min"
          color="text-red-400"
        />
        <SettingRow
          label="Short Break"
          value={localSettings.shortBreak}
          onChange={(v) => setLocalSettings({ ...localSettings, shortBreak: v })}
          min={1}
          max={30}
          unit="min"
          color="text-green-400"
        />
        <SettingRow
          label="Long Break"
          value={localSettings.longBreak}
          onChange={(v) => setLocalSettings({ ...localSettings, longBreak: v })}
          min={1}
          max={60}
          unit="min"
          color="text-blue-400"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 
                   text-sm font-medium text-white/80 transition-all duration-200"
      >
        Save Settings
      </button>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  color: string;
}

function SettingRow({ label, value, onChange, min, max, unit, color }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
        >
          −
        </button>
        <span className={`w-12 text-center font-mono text-sm ${color}`}>
          {value} {unit}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default App;
