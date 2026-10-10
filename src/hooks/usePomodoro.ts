import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export interface DailyStats {
  date: string;
  sessionsCompleted: number;
  totalFocusMinutes: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const STORAGE_KEYS = {
  settings: 'pomodoro_settings',
  stats: 'pomodoro_stats',
};

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadSettings(): TimerSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.settings);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadStats(): DailyStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.stats);
    if (saved) {
      const stats = JSON.parse(saved);
      if (stats.date === getTodayKey()) return stats;
    }
  } catch {}
  return { date: getTodayKey(), sessionsCompleted: 0, totalFocusMinutes: 0 };
}

function saveStats(stats: DailyStats) {
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
}

function saveSettings(settings: TimerSettings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function playNotification() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    setTimeout(() => { oscillator.frequency.value = 1000; }, 150);
    setTimeout(() => { oscillator.frequency.value = 1200; }, 300);
    setTimeout(() => { oscillator.stop(); audioContext.close(); }, 500);
  } catch {}
}

export function usePomodoro() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<DailyStats>(loadStats);
  const [showSettings, setShowSettings] = useState(false);

  // Use refs to avoid stale closures
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const statsRef = useRef(stats);
  const isRunningRef = useRef(isRunning);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  const totalTime = settings[mode] * 60;
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const handleComplete = useCallback(() => {
    const currentMode = modeRef.current;
    const currentSettings = settingsRef.current;
    const currentStats = statsRef.current;

    setIsRunning(false);

    if (currentMode === 'focus') {
      const elapsedMinutes = currentSettings.focus;
      const newSessions = currentStats.sessionsCompleted + 1;
      const updatedStats: DailyStats = {
        date: getTodayKey(),
        sessionsCompleted: newSessions,
        totalFocusMinutes: currentStats.totalFocusMinutes + elapsedMinutes,
      };
      setStats(updatedStats);
      saveStats(updatedStats);

      playNotification();

      const nextMode: TimerMode = newSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(currentSettings[nextMode] * 60);
    } else {
      playNotification();
      setMode('focus');
      setTimeLeft(currentSettings.focus * 60);
    }
  }, []);

  // Timer interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, handleComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  };

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    if (!isRunning) {
      setTimeLeft(newSettings[mode] * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
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
  };
}
