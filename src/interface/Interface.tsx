import useGame from '../stores/store';
import HelpModal from './helpModal/HelpModal';
import HelpButton from './helpButton/HelpButton';
import SoundToggle from './soundToggle/SoundToggle';
import WinCelebration from './winCelebration/WinCelebration';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import './style.css';

const Interface = () => {
  const { modal, coins, win, bet, betStep, phase, updateBet, setBetStep } = useGame(
    (state) => state,
  );
  const animatedCoins = useAnimatedNumber(coins);
  return (
    <>
      {/* Utility Buttons */}
      <div className="utility-buttons">
        <SoundToggle />
        <HelpButton />
      </div>

      <WinCelebration win={win} />

      {/* Modal */}
      {modal && <HelpModal />}

      <div className="interface">
        {/* Coins */}
        <div className="coins-section">
          <div className="coins-number">{animatedCoins}</div>
          <img className="coins-image" src="images/emerald.png" alt="" />
        </div>

        {/* Bet */}
        <div className="bet-section">
          <div id="bet-controls" className={phase === 'idle' ? '' : 'hidden'}>
            <button className="bet-control" onClick={() => updateBet(-1)} aria-label={`BETを${betStep}下げる`}>−</button>
            <div className="bet-readout"><span>BET</span><strong>{bet.toLocaleString('ja-JP')}</strong></div>
            <button className="bet-control" onClick={() => updateBet(1)} aria-label={`BETを${betStep}上げる`}>＋</button>
            <div className="bet-steps" aria-label="BET変更幅">
              {[10, 100, 1000, 10000].map((step) => (
                <button className={step === betStep ? 'active' : ''} onClick={() => setBetStep(step)} key={step}>
                  {step.toLocaleString('ja-JP')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spins */}
        <div className="win-section">
          <div className="win-label">WIN </div>
          <div className="win-amount">{win}</div>
        </div>
      </div>
    </>
  );
};

export default Interface;
