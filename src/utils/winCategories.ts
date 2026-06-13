export type WinCategoryKey = 'win' | 'bigWin' | 'hugeWin';

type WinCategory = {
  label: string;
  minCoins: number;
  durationMs: number;
  minCoinCount: number;
  minSparkleCount: number;
  shakeClass: string;
  glowClass: string;
  tierClass: string;
};

export const WIN_CATEGORIES: Record<WinCategoryKey, WinCategory> = {
  win: {
    label: 'WIN',
    minCoins: 1,
    durationMs: 2800,
    minCoinCount: 16,
    minSparkleCount: 18,
    shakeClass: 'win-shake-soft',
    glowClass: 'gold-glow-soft',
    tierClass: 'win-tier-regular',
  },
  bigWin: {
    label: 'BIG WIN',
    minCoins: 100,
    durationMs: 3800,
    minCoinCount: 38,
    minSparkleCount: 36,
    shakeClass: 'win-shake-medium',
    glowClass: 'gold-glow-medium',
    tierClass: 'win-tier-big',
  },
  hugeWin: {
    label: 'HUGE WIN',
    minCoins: 500,
    durationMs: 5000,
    minCoinCount: 70,
    minSparkleCount: 58,
    shakeClass: 'win-shake-strong',
    glowClass: 'gold-glow-strong',
    tierClass: 'win-tier-huge',
  },
};

export const getWinCategory = (coinsWon: number) => {
  if (coinsWon >= WIN_CATEGORIES.hugeWin.minCoins) return WIN_CATEGORIES.hugeWin;
  if (coinsWon >= WIN_CATEGORIES.bigWin.minCoins) return WIN_CATEGORIES.bigWin;
  if (coinsWon >= WIN_CATEGORIES.win.minCoins) return WIN_CATEGORIES.win;
  return null;
};
