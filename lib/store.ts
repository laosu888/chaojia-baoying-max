'use client';

import { create } from 'zustand';
import { getSettings, updateSettings, type AppSettings } from './local-storage';

interface StoreState {
  // App settings
  settings: AppSettings;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Generator state
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  
  // Rage meter
  rageLevel: number;
  setRageLevel: (value: number) => void;
  
  // Animated text state
  isAnimatingText: boolean;
  setIsAnimatingText: (value: boolean) => void;
}

// Create store
export const useStore = create<StoreState>((set) => ({
  // Initialize app settings from localStorage
  settings: typeof window !== 'undefined' ? getSettings() : {
    defaultStyle: '文艺风',
    defaultIntensity: 5,
    defaultLanguage: '中文',
    darkMode: true,
    animations: true,
  },
  
  updateAppSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      updateSettings(updatedSettings);
      return { settings: updatedSettings };
    });
  },
  
  // Generator state
  isGenerating: false,
  setIsGenerating: (value) => set({ isGenerating: value }),
  
  // Rage meter
  rageLevel: 0,
  setRageLevel: (value) => set({ rageLevel: Math.max(0, Math.min(10, value)) }),
  
  // Animated text state
  isAnimatingText: false,
  setIsAnimatingText: (value) => set({ isAnimatingText: value }),
}));