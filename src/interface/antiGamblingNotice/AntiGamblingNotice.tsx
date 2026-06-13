import { ChangeEvent, useState } from 'react';
import './style.css';

const NOTICE_STORAGE_KEY = 'cherryCharmHideAntiGamblingNotice';

const shouldShowNotice = () =>
  window.localStorage.getItem(NOTICE_STORAGE_KEY) !== 'true';

const AntiGamblingNotice = () => {
  const [isVisible, setIsVisible] = useState(shouldShowNotice);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  if (!isVisible) return null;

  const handlePreferenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setDoNotShowAgain(isChecked);
    window.localStorage.setItem(NOTICE_STORAGE_KEY, String(isChecked));
  };

  const handleClose = () => {
    if (doNotShowAgain) {
      window.localStorage.setItem(NOTICE_STORAGE_KEY, 'true');
    }
    setIsVisible(false);
  };

  return (
    <aside className="anti-gambling-notice" aria-label="Free play message">
      <div className="anti-gambling-text">
        I hate gambling and people losing their money to gambling company
        predators, that's why I made this. Play here and have fun for free
        without losing your money!
      </div>

      <label className="anti-gambling-checkbox">
        <input
          type="checkbox"
          checked={doNotShowAgain}
          onChange={handlePreferenceChange}
        />
        <span>Do not show again</span>
      </label>

      <button
        className="anti-gambling-close"
        type="button"
        onClick={handleClose}
      >
        Close
      </button>
    </aside>
  );
};

export default AntiGamblingNotice;
