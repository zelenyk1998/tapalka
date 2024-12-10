const TelegramModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modalContent">
        <h2>Приєднатись до телеграм каналу</h2>
        <p>Ви приєдналися до нашого телеграм каналу та отримали 1000 балів.</p>
        <button className="modal-button" onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default TelegramModal;