const InviteModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div div className="modal" style={{ display: 'flex' }}>
      <div className="modalContent">
        <h2>Запросити друга</h2>
        <p>За запрошення друга вам буде нараховано 1000 балів, а другу — 500 балів.</p>
        <button className="modal-button" onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default InviteModal;