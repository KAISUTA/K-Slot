import useGame from '../../stores/store';
import './style.css';

const HelpButton = () => {
  const { modal, setModal } = useGame();

  const handleHelp = () => {
    setModal(!modal);
  };

  return (
    <button
      aria-label="Open help"
      title="Help"
      onClick={handleHelp}
      className="utility-button help-button"
      style={{ backgroundImage: "url('images/help.svg')" }}
      type="button"
    />
  );
};

export default HelpButton;
