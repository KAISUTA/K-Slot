/*
 * Copyright (c) Michael Kolesidis <michael.kolesidis@gmail.com>
 * GNU Affero General Public License v3.0
 *
 * ATTENTION! FREE SOFTWARE
 * This website is free software (free as in freedom).
 * If you use any part of this code, you must make your entire project's source code
 * publicly available under the same license. This applies whether you modify the code
 * or use it as it is in your own project. This ensures that all modifications and
 * derivative works remain free software, so that everyone can benefit.
 * If you are not willing to comply with these terms, you must refrain from using any part of this code.
 *
 * For full license terms and conditions, you can read the AGPL-3.0 here:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
const MIN_BET = 100;
const SOUND_STORAGE_KEY = 'cherryCharmSoundOn';

const readStoredSoundPreference = () => {
  const storedValue = window.localStorage.getItem(SOUND_STORAGE_KEY);
  return storedValue === null ? true : storedValue === 'true';
};

type State = {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  modal: boolean;
  setModal: (isOpen: boolean) => void;
  soundOn: boolean;
  setSoundOn: (isSoundOn: boolean) => void;
  toggleSound: () => void;
  coins: number;
  setCoins: (amount: number) => void;
  updateCoins: (amount: number) => void;
  showBars: boolean;
  toggleBars: () => void;
  bet: number;
  betStep: number;
  setBetStep: (step: number) => void;
  setBetMax: () => void;
  appliedBet: number;
  updateBet: (direction: number) => void;
  validateBet: () => void;
  win: number;
  setWin: (amount: number) => void;
  error: string;
  setError: (message: string) => void;
  spins: number;
  addSpin: () => void;
  startTime: number;
  endTime: number;
  phase: 'idle' | 'spinning';
  start: (betAtLaunch: number) => void;
  end: () => void;
  reelSuspense: boolean;
  setReelSuspense: (isSuspenseActive: boolean) => void;
  firstTime: boolean;
  setFirstTime: (isFirstTime: boolean) => void;
};

const useGame = create<State>()(
  subscribeWithSelector((set) => ({
    isMobile: window.innerWidth < 768,
    setIsMobile: (value: boolean) => set(() => ({ isMobile: value })),
    modal: false,
    setModal: (isOpen: boolean) => set({ modal: isOpen }),
    soundOn: readStoredSoundPreference(),
    setSoundOn: (isSoundOn: boolean) => {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(isSoundOn));
      set({ soundOn: isSoundOn });
    },
    toggleSound: () => {
      set((state) => {
        const nextSoundOn = !state.soundOn;
        window.localStorage.setItem(SOUND_STORAGE_KEY, String(nextSoundOn));
        return { soundOn: nextSoundOn };
      });
    },

    /**
     * Coins: Just updates the value.
     * Snap-down logic removed from here to prevent bet resetting mid-spin.
     */
    coins: 1000,
    setCoins: (amount: number) => set({ coins: amount }),
    updateCoins: (amount: number) => {
      set((state) => ({ coins: state.coins + amount }));
    },

    showBars: false,
    toggleBars: () => set((state) => ({ showBars: !state.showBars })),

    /**
     * Bet Logic
     */
    bet: 100,
    betStep: 100,
    setBetStep: (step: number) => set({ betStep: step }),
    setBetMax: () => set((state) => ({ bet: Math.max(MIN_BET, Math.floor(state.coins / 10) * 10) })),
    appliedBet: 100,
    updateBet: (direction: number) => {
      set((state) => {
        const affordableMax = Math.floor(state.coins / 10) * 10;
        const nextBet = Math.max(
          MIN_BET,
          Math.min(affordableMax, state.bet + direction * state.betStep),
        );
        return { bet: nextBet };
      });
    },

    /**
     * Validate Bet: Called only when the round ends to check
     * if the player can still afford their current bet tier.
     */
    validateBet: () => {
      set((state) => {
        if (state.bet > state.coins) {
          return { bet: Math.max(MIN_BET, Math.floor(state.coins / 10) * 10) };
        }
        return {};
      });
    },

    win: 0,
    setWin: (amount: number) => set({ win: amount }),
    error: '',
    setError: (message: string) => set({ error: message }),
    spins: 0,
    addSpin: () => set((state) => ({ spins: state.spins + 1 })),
    startTime: 0,
    endTime: 0,
    phase: 'idle',
    start: (betAtLaunch: number) => {
      set((state) => {
        if (state.phase === 'idle') {
          return {
            phase: 'spinning',
            reelSuspense: false,
            startTime: Date.now(),
            appliedBet: betAtLaunch,
          };
        }
        return {};
      });
    },
    end: () => {
      set((state) => {
        if (state.phase === 'spinning') {
          return {
            phase: 'idle',
            reelSuspense: false,
            endTime: Date.now(),
          };
        }
        return {};
      });
    },
    reelSuspense: false,
    setReelSuspense: (isSuspenseActive: boolean) =>
      set({ reelSuspense: isSuspenseActive }),
    firstTime: true,
    setFirstTime: (isFirstTime: boolean) => set({ firstTime: isFirstTime }),
  })),
);

export default useGame;
