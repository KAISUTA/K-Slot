import useGame from '../stores/store';
import HelpModal from './helpModal/HelpModal';
import HelpButton from './helpButton/HelpButton';
import SoundToggle from './soundToggle/SoundToggle';
import WinCelebration from './winCelebration/WinCelebration';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import './style.css';

const Interface = () => {
  const { modal, coins, win, error, bet, betStep, phase, autoRemaining, updateBet, setBetStep, setBetMax, startAutoSpins, stopAutoSpins } = useGame(
    (state) => state,
  );
  const animatedCoins = useAnimatedNumber(coins);
  const startAuto = (count: number) => {
    startAutoSpins(count);
    window.dispatchEvent(new Event('k-slot-start-auto'));
  };
  return (
    <>
      {/* Utility Buttons */}
      <div className="utility-buttons">
        <SoundToggle />
        <HelpButton />
      </div>

      <WinCelebration win={win} />
      {error && <div className="game-error" role="alert">{error}</div>}

      {/* Modal */}
      {modal && <HelpModal />}

      <div className="interface">
        {/* Coins */}
        <div className="coins-section">
          <div className="coins-number">¥{animatedCoins.toLocaleString('ja-JP')}</div>
          <img className="coins-image" src="images/emerald.png" alt="" />
        </div>

        {/* Bet */}
        <div className="bet-section">
          <div id="bet-controls" className={phase === 'idle' ? '' : 'hidden'}>
            <button className="bet-control" onClick={() => updateBet(-1)} aria-label={`BETを${betStep}下げる`}>−</button>
            <div className="bet-readout"><span>BET</span><strong>¥{bet.toLocaleString('ja-JP')}</strong></div>
            <button className="bet-control" onClick={() => updateBet(1)} aria-label={`BETを${betStep}上げる`}>＋</button>
            <div className="bet-steps" aria-label="BET変更幅">
              {[10, 100, 1000, 10000].map((step) => (
                <button className={step === betStep ? 'active' : ''} onClick={() => setBetStep(step)} key={step}>
                  {step.toLocaleString('ja-JP')}
                </button>
              ))}
              <button onClick={setBetMax}>MAX</button>
            </div>
            <div className="auto-controls" aria-label="自動スピン">
              <span>AUTO</span>
              {[10, 25, 50].map((count) => (
                <button onClick={() => startAuto(count)} key={count}>{count}</button>
              ))}
              <button className="auto-infinite" onClick={() => startAuto(-1)}>∞</button>
            </div>
          </div>
        </div>

        {autoRemaining !== 0 && <button className="auto-stop" onClick={stopAutoSpins}>AUTO 停止</button>}

        {/* Spins */}
        <div className="win-section">
          <div className="win-label">WIN </div>
          <div className="win-amount">¥{win.toLocaleString('ja-JP')}</div>
        </div>
      </div>
    </>
  );
};

export default Interface;
