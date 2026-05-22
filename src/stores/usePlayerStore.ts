import { create } from "zustand";

export type MixSource = "mixcloud";
export type PlayerMode = "radio" | "mix" | null;

export interface MixTrack {
  id: string;
  title: string;
  coverArt?: string;
  embedUrl: string;
  source: MixSource;
  originalUrl: string;
}

interface PlayerState {
  mode: PlayerMode;
  currentTrack: MixTrack | null;
  isPlaying: boolean;
  isMinimized: boolean;

  // Radio controls
  playRadio: () => void;
  stopRadio: () => void;

  // Mix controls
  playMix: (track: MixTrack) => void;

  // Shared controls
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggleMinimize: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  mode: null,
  currentTrack: null,
  isPlaying: false,
  isMinimized: false,

  playRadio: () =>
    set({
      mode: "radio",
      currentTrack: null,
      isPlaying: true,
      isMinimized: false,
    }),

  stopRadio: () =>
    set((s) => (s.mode === "radio" ? { mode: null, isPlaying: false } : s)),

  playMix: (track) =>
    set({
      mode: "mix",
      currentTrack: track,
      isPlaying: true,
      isMinimized: false,
    }),

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ mode: null, currentTrack: null, isPlaying: false }),
  toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),
}));
