import { useEffect, useRef, useState } from 'react';

export default function useAnimatedNumber(
  target: number,
  duration: number = 1000,
) {
  const [animatedValue, setAnimatedValue] = useState(target);
  const animatedValueRef = useRef<number>(target);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(target);

  useEffect(() => {
    startTimeRef.current = performance.now();
    startValueRef.current = animatedValueRef.current;

    const setNextAnimatedValue = (value: number) => {
      animatedValueRef.current = value;
      setAnimatedValue(value);
    };

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quadratic: faster at start, slower at end
      const easedProgress = 1 - Math.pow(1 - progress, 2);

      const change = target - startValueRef.current;
      const nextValue = startValueRef.current + change * easedProgress;

      if (progress < 1) {
        setNextAnimatedValue(Math.round(nextValue));
        animationFrameId.current = requestAnimationFrame(step);
      } else {
        setNextAnimatedValue(target);
      }
    };

    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [target, duration]);

  return animatedValue;
}
