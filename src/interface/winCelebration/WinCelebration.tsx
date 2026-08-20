import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { getWinCategory } from '../../utils/winCategories';
import CoinFountain from './CoinFountain';
import './style.css';

type SparkParticle = {
  id: number;
  kind: 'star' | 'streak' | 'ring';
  delay: string;
  duration: string;
  width: string;
  height: string;
  xMid: string;
  yMid: string;
  xEnd: string;
  yEnd: string;
  rotate: string;
};

type SparkParticleStyle = CSSProperties & {
  '--spark-x-mid': string;
  '--spark-y-mid': string;
  '--spark-x-end': string;
  '--spark-y-end': string;
  '--spark-rotate': string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const seeded = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const getParticleCounts = (
  win: number,
  category: NonNullable<ReturnType<typeof getWinCategory>>,
  isMobile: boolean,
) => ({
  coinCount: Math.round(
    clamp(
      category.minCoinCount + Math.sqrt(win) * 1.8 + Math.log10(win + 1) * 7,
      isMobile
        ? Math.max(10, Math.floor(category.minCoinCount * 0.55))
        : category.minCoinCount,
      isMobile ? 54 : 160,
    ),
  ),
  sparkleCount: Math.round(
    clamp(
      category.minSparkleCount + Math.sqrt(win) * 0.9 + Math.log10(win + 1) * 6,
      isMobile
        ? Math.max(8, Math.floor(category.minSparkleCount * 0.45))
        : category.minSparkleCount,
      isMobile ? 28 : 96,
    ),
  ),
});

const createSparkParticles = (
  count: number,
  trigger: number,
  win: number,
): SparkParticle[] => {
  const intensity = clamp(Math.log10(win + 1) / 3, 0, 1);
  const kinds: SparkParticle['kind'][] = ['star', 'streak', 'ring'];

  return Array.from({ length: count }, (_, index) => {
    const seed = (index + 1) * (trigger + 97);
    const angle = (index / count) * Math.PI * 2 + seeded(seed) * 0.7;
    const distance = 92 + seeded(seed + 1) * 250 + intensity * 90;
    const xEnd = Math.cos(angle) * distance;
    const yEnd = Math.sin(angle) * distance * 0.52;
    const kind = kinds[Math.floor(seeded(seed + 2) * kinds.length)];
    const size = 10 + seeded(seed + 3) * 24 + intensity * 9;

    return {
      id: index,
      kind,
      delay: `${seeded(seed + 4) * 0.7}s`,
      duration: `${0.9 + seeded(seed + 5) * 0.85}s`,
      width: `${kind === 'streak' ? size * 2.8 : size}px`,
      height: `${kind === 'streak' ? Math.max(4, size * 0.18) : size}px`,
      xMid: `${xEnd * 0.54}px`,
      yMid: `${yEnd * 0.54}px`,
      xEnd: `${xEnd}px`,
      yEnd: `${yEnd}px`,
      rotate: `${seeded(seed + 6) * 360}deg`,
    };
  });
};

type WinCelebrationProps = {
  win: number;
};

const WinCelebration = ({ win }: WinCelebrationProps) => {
  const [trigger, setTrigger] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fountainRef = useRef<CoinFountain | null>(null);
  const category = getWinCategory(win);
  const isMobile =
    window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    if (win > 0) {
      setTrigger((currentTrigger) => currentTrigger + 1);
    }
  }, [win]);

  const particleCounts = category
    ? getParticleCounts(win, category, isMobile)
    : { coinCount: 0, sparkleCount: 0 };

  const sparkles = useMemo(
    () => createSparkParticles(particleCounts.sparkleCount, trigger, win),
    [particleCounts.sparkleCount, trigger, win],
  );

  useEffect(() => {
    if (!category || trigger === 0 || !canvasRef.current) return;

    const fountain = new CoinFountain(canvasRef.current);
    fountainRef.current = fountain;
    fountain.spawn(
      particleCounts.coinCount,
      category.tierClass !== 'win-tier-regular',
    );

    return () => {
      fountain.destroy();
      if (fountainRef.current === fountain) {
        fountainRef.current = null;
      }
    };
  }, [category, particleCounts.coinCount, trigger]);

  if (!category || trigger === 0) return null;

  return (
    <div
      key={trigger}
      className={`win-celebration ${category.shakeClass} ${category.glowClass} ${category.tierClass}`}
      style={{ animationDuration: `${category.durationMs}ms` }}
      aria-live="polite"
    >
      <div className="win-celebration-text">
        <div className="win-celebration-label">{category.label}</div>
        <div className="win-celebration-amount">¥{win.toLocaleString('ja-JP')}</div>
      </div>

      <canvas
        ref={canvasRef}
        className="coin-fountain-canvas"
        aria-hidden="true"
      />

      <div className="sparkle-field" aria-hidden="true">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className={`sparkle-particle sparkle-${sparkle.kind}`}
            style={
              {
                width: sparkle.width,
                height: sparkle.height,
                animationDelay: sparkle.delay,
                animationDuration: sparkle.duration,
                '--spark-x-mid': sparkle.xMid,
                '--spark-y-mid': sparkle.yMid,
                '--spark-x-end': sparkle.xEnd,
                '--spark-y-end': sparkle.yEnd,
                '--spark-rotate': sparkle.rotate,
              } as SparkParticleStyle
            }
          />
        ))}
      </div>
    </div>
  );
};

export default WinCelebration;
