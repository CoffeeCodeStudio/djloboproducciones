import { create } from "zustand";

export type MixSource = "mixcloud" | "soundcloud";

export interface MixTrack {
  id: string;
  title: string;
  coverArt?: string;
  embedUrl: string;
  source: MixSource;
  originalUrl: string;
}

interface PlayerState {
  currentTrack: MixTrack | null;
  isPlaying: boolean;
  isMinimized: boolean;
  play: (track: MixTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggleMinimize: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  isMinimized: false,
  play: (track) => set({ currentTrack: track, isPlaying: true, isMinimized: false }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ currentTrack: null, isPlaying: false }),
  toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),
}));
