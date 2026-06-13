import useGame from '../../stores/store';
import './style.css';

const PAYTABLE_ROWS = [
  { symbols: ['cherry', 'cherry', 'cherry'], pay: 50 },
  { symbols: ['apple', 'apple', 'apple'], pay: 20 },
  { symbols: ['banana', 'banana', 'banana'], pay: 15 },
  { symbols: ['lemon', 'lemon', 'lemon'], pay: 5 },
  { symbols: ['cherry', 'cherry'], pay: 40 },
  { symbols: ['apple', 'apple'], pay: 10 },
  { symbols: ['banana', 'banana'], pay: 5 },
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
            Click on the SPIN button or press SPACE to spin.
          </div>
          <div className="modal-text">
            Cherry Charm only considers it a match if the fruits appear
            consecutively from left to right
          </div>
          <div className="modal-text">Click and drag to rotate the 3D view</div>
          <div id="paytable">
            {PAYTABLE_ROWS.map((row) => (
              <div className="modal-text" key={`${row.symbols.join('-')}-${row.pay}`}>
                {row.symbols.map((symbol, index) => (
                  <img
                    className="modal-image"
                    src={`images/${symbol}.png`}
                    alt=""
                    key={`${symbol}-${index}`}
                  />
                ))}
                <span> Pay {row.pay} </span>
                <img
                  className="modal-image"
                  src="images/coin.png"
                  alt=""
                />
              </div>
            ))}
          </div>

          <button className="modal-bars-button" onClick={toggleBars}>
            {showBars ? 'Hide' : 'Show'} Bars
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
                  href="https://github.com/michaelkolesidis/cherry-charm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
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
