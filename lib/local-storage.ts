'use client';

// LocalStorage keys
const HISTORY_KEY = 'comeback-history';
const SETTINGS_KEY = 'app-settings';
const USAGE_STATS_KEY = 'usage-stats';

// Types
export type ComebackRecord = {
  id: string;
  originalText: string;
  responses: string[];
  memeUrls: string[];
  style: string;
  intensity: number;
  language: string;
  timestamp: number;
};

export type AppSettings = {
  defaultStyle: string;
  defaultIntensity: number;
  defaultLanguage: string;
  darkMode: boolean;
  animations: boolean;
};

export type UsageStats = {
  totalGenerated: number;
  favoriteStyle: string;
  winRate: number;
  lastUsed: number;
};

// Default values
const DEFAULT_SETTINGS: AppSettings = {
  defaultStyle: '文艺风',
  defaultIntensity: 5,
  defaultLanguage: '中文',
  darkMode: true,
  animations: true,
};

const DEFAULT_STATS: UsageStats = {
  totalGenerated: 0,
  favoriteStyle: '文艺风',
  winRate: 0,
  lastUsed: Date.now(),
};

// Helper functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
}

// History functions
export function getHistory(): ComebackRecord[] {
  return getItem<ComebackRecord[]>(HISTORY_KEY, []);
}

export function addToHistory(record: ComebackRecord): void {
  const history = getHistory();
  const updatedHistory = [record, ...history].slice(0, 50); // Keep last 50 records
  setItem(HISTORY_KEY, updatedHistory);
  
  // Update usage stats
  const stats = getUsageStats();
  stats.totalGenerated += 1;
  
  // Update favorite style
  const styleCounts: Record<string, number> = {};
  updatedHistory.forEach(item => {
    styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
  });
  
  let maxCount = 0;
  Object.entries(styleCounts).forEach(([style, count]) => {
    if (count > maxCount) {
      maxCount = count;
      stats.favoriteStyle = style;
    }
  });
  
  stats.lastUsed = Date.now();
  setItem(USAGE_STATS_KEY, stats);
}

export function clearHistory(): void {
  setItem(HISTORY_KEY, []);
}

// Settings functions
export function getSettings(): AppSettings {
  return getItem<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function updateSettings(settings: Partial<AppSettings>): void {
  const currentSettings = getSettings();
  setItem(SETTINGS_KEY, { ...currentSettings, ...settings });
}

// Usage stats functions
export function getUsageStats(): UsageStats {
  return getItem<UsageStats>(USAGE_STATS_KEY, DEFAULT_STATS);
}

export function updateWinRate(won: boolean): void {
  const stats = getUsageStats();
  const totalBattles = stats.totalGenerated;
  const currentWins = stats.winRate * totalBattles;
  
  const newWins = won ? currentWins + 1 : currentWins;
  stats.winRate = totalBattles > 0 ? newWins / totalBattles : 0;
  
  setItem(USAGE_STATS_KEY, stats);
}