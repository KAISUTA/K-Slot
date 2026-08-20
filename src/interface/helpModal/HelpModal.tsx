import useGame from '../../stores/store';
import './style.css';

const PAYTABLE_ROWS = [
  { symbols: ['diamond', 'diamond', 'diamond'], pay: 50 },
  { symbols: ['emerald', 'emerald', 'emerald'], pay: 20 },
  { symbols: ['gold', 'gold', 'gold'], pay: 15 },
  { symbols: ['redstone', 'redstone', 'redstone'], pay: 5 },
];

const HelpModal = () => {
  const { setModal, showBars, toggleBars } = useGame((state) => state);

  return (
    <div className="modal">
      <div className="modal-box">
        <button
          className="modal-close"
          type="button"
          aria-label="Close help"
          onClick={() => setModal(false)}
        >
          &times;
        </button>
        <div className="modal-main">
          <div className="modal-text">
            SPINボタンまたはスペースキーで回します。
          </div>
          <div className="modal-text">
            同じ絵柄が左から連続すると当選です。
          </div>
          <div className="modal-text">ドラッグすると筐体の角度を変えられます。</div>
          <div id="paytable">
            {PAYTABLE_ROWS.map((row) => (
              <div
                className="modal-text"
                key={`${row.symbols.join('-')}-${row.pay}`}
              >
                {row.symbols.map((symbol, index) => (
                  <img
                    className="modal-image"
                    src={`images/${symbol}.png`}
                    alt=""
                    key={`${symbol}-${index}`}
                  />
                ))}
                <span> × {row.pay} </span>
                <img className="modal-image" src="images/emerald.png" alt="" />
              </div>
            ))}
          </div>

          <button className="modal-bars-button" onClick={toggleBars}>
            当選ラインを{showBars ? '隠す' : '表示'}
          </button>

          <div>
            <div>
              <a
                className="modal-link"
                href="https://michaelkolesidis.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                © Michael Kolesidis
              </a>
            </div>

            <div id="source">
              <div>
                <a
                  className="modal-source modal-link"
                  href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Licensed under GNU AGPL 3.0 •
                </a>
              </div>
              <div>
                <a
                  className="modal-source modal-link"
                  href="https://github.com/KAISUTA/K-Slot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  K-Slot Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
