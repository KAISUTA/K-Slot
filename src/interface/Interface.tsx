import useGame from '../stores/store';
import HelpModal from './helpModal/HelpModal';
import HelpButton from './helpButton/HelpButton';
import SoundToggle from './soundToggle/SoundToggle';
import WinCelebration from './winCelebration/WinCelebration';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import './style.css';

const Interface = () => {
  const { modal, coins, win, bet, phase, updateBet } = useGame(
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

      {/* Logo */}
      <div id="logo-section">
        <div className="logo" aria-label="K-SLOT"><span>K</span>-SLOT</div>
      </div>

      <div className="interface">
        {/* Coins */}
        <div className="coins-section">
          <div className="coins-number">{animatedCoins}</div>
          <img className="coins-image" src="images/emerald.png" alt="" />
        </div>

        {/* Bet */}
        <div className="bet-section">
          <div className="bet-label">BET</div>
          <div className="bet-amount">{bet}</div>
          <div id="bet-controls" className={phase === 'idle' ? '' : 'hidden'}>
            <div
              id="increase-bet"
              className="bet-control"
              onClick={() => updateBet(1)}
            >
              +
            </div>
            <div
              id="decrease-bet"
              className="bet-control"
              onClick={() => updateBet(-1)}
            >
              -
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
