import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import useGame from './stores/store';
import { WHEEL_SEGMENT } from './utils/constants';
import Reel from './Reel';
import Button from './Button';

interface ReelGroup extends THREE.Group { isSnapping?: boolean; targetRotationX?: number; }
type SpinResponse = { reel_positions: number[]; payout: number | string; balance: number | string; };
const toNumber = (value: number | string) => Number(value);

const SlotMachine = forwardRef((_, ref) => {
  const { phase, start, end, bet, setCoins, setWin, setError, addSpin, setReelSuspense, stopAutoSpins, consumeAutoSpin } = useGame((state) => state);
  const refs = [useRef<ReelGroup>(null), useRef<ReelGroup>(null), useRef<ReelGroup>(null)];
  const reelRefs = useMemo(() => refs, []);
  const resultRef = useRef<SpinResponse | null>(null);
  const [, setStopped] = useState(0);
  const [buttonZ, setButtonZ] = useState(0);
  const [buttonY, setButtonY] = useState(-13);

  useEffect(() => {
    fetch('/api/slots', { credentials: 'same-origin' })
      .then(async (response) => {
        const body = await response.text();
        const data = body ? JSON.parse(body) : {};
        if (!response.ok) throw new Error(data.detail || '残高を読み込めませんでした。');
        return data;
      })
      .then((data) => {
        if (!data.enabled) throw new Error('現在プレイできません。');
        setCoins(toNumber(data.balance));
        window.parent.postMessage({ type: 'k-slot-balance', balance: data.balance }, location.origin);
      })
      .catch((error: Error) => setError(error.message));
  }, [setCoins, setError]);

  const handleSpinAction = useCallback(async () => {
    const state = useGame.getState();
    if (state.phase === 'spinning') return;
    if (state.coins < state.bet) { stopAutoSpins(); setError('残高が不足しています。'); return; }
    start(bet); setError(''); setWin(0); setStopped(0); setReelSuspense(false); resultRef.current = null;
    try {
      const response = await fetch('/api/slots/spin', {
        method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ request_key: crypto.randomUUID(), total_bet: bet, line_count: 5 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || '抽選に失敗しました。');
      resultRef.current = data; addSpin();
      data.reel_positions.forEach((position: number, index: number) => {
        const reel = reelRefs[index]?.current;
        if (!reel) return;
        reel.rotation.x = 0;
        reel.targetRotationX = (24 + index * 7 + (position % 8)) * WHEEL_SEGMENT;
        reel.isSnapping = false;
      });
    } catch (error) {
      end(); stopAutoSpins(); setError(error instanceof Error ? error.message : '抽選に失敗しました。');
    }
  }, [addSpin, bet, end, reelRefs, setError, setReelSuspense, setWin, start, stopAutoSpins]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.code === 'Space') { event.preventDefault(); void handleSpinAction(); } };
    document.addEventListener('keydown', onKeyDown); return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleSpinAction]);

  useEffect(() => {
    // Re-check the store at execution time: Stop may have been pressed during
    // the small pause between reels settling and the next automatic round.
    const onAutoStart = () => {
      if (useGame.getState().autoRemaining !== 0) void handleSpinAction();
    };
    window.addEventListener('k-slot-start-auto', onAutoStart);
    return () => window.removeEventListener('k-slot-start-auto', onAutoStart);
  }, [handleSpinAction]);

  useFrame(() => {
    for (const reelRef of reelRefs) {
      const reel = reelRef.current;
      if (!reel || reel.targetRotationX === undefined) continue;
      if (!reel.isSnapping && reel.rotation.x < reel.targetRotationX - 0.1) reel.rotation.x += 0.1;
      else {
        reel.isSnapping = true;
        reel.rotation.x = THREE.MathUtils.lerp(reel.rotation.x, reel.targetRotationX, 0.2);
        if (Math.abs(reel.rotation.x - reel.targetRotationX) < 0.01) {
          reel.rotation.x = reel.targetRotationX; reel.targetRotationX = undefined; reel.isSnapping = false;
          setStopped((count) => {
            const next = count + 1;
            if (next === 3 && resultRef.current) window.setTimeout(() => {
              const result = resultRef.current!; const balance = toNumber(result.balance);
              setWin(toNumber(result.payout)); setCoins(balance);
              window.parent.postMessage({ type: 'k-slot-balance', balance }, location.origin); end();
              if (consumeAutoSpin()) window.setTimeout(
                () => window.dispatchEvent(new Event('k-slot-start-auto')),
                700,
              );
            }, 450);
            return next;
          });
        }
      }
    }
  });

  useImperativeHandle(ref, () => ({ reelRefs }));
  return <>
    {[-5, 0, 5].map((x, index) => <Reel key={index} ref={reelRefs[index]} map={index} position={[x, 0, 0]} scale={[7.1, 7.1, 7.1]} reelSegment={0} />)}
    {phase === 'spinning' && <Sparkles position={[0, 0, 6.2]} count={60} scale={[11, 4.4, 1.4]} size={4.5} speed={1.3} color="#62df8d" />}
    <Button scale={[0.055, 0.045, 0.045]} position={[0, buttonY, buttonZ]} rotation={[-Math.PI / 8, 0, 0]}
      onClick={() => void handleSpinAction()} onPointerDown={() => { setButtonZ(-1); setButtonY(-13.5); }} onPointerUp={() => { setButtonZ(0); setButtonY(-13); }} />
  </>;
});
export default SlotMachine;
