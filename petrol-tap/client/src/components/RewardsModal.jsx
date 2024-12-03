// components/RewardsModal.jsx
import React, { useState } from 'react';
import photoKava from '../images/photo1.png';
import photoHotdog from '../images/photo2.png';
import photoBurger from '../images/photo3.png';

const RewardsModal = ({ isOpen, onClose, currentPoints }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const rewards = [
    { id: 1, name: "Кава", points: 20000, image: photoKava },
    { id: 2, name: "Хот-дог", points: 35000, image: photoHotdog },
    { id: 3, name: "Бургер", points: 40000, image: photoBurger }
  ];

  const handleSpendPoints = async (reward) => {
    try {
      setIsProcessing(true);
      setError(null);

      const sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
        throw new Error('Сесія не знайдена');
      }

      const response = await fetch('/api/spend-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          points: reward.points,
          reward: reward.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка при обміні балів');
      }

      alert(`Ви успішно обміняли ${reward.points} балів на ${reward.name}!`);
      onClose();
      
    } catch (error) {
      console.error('Error spending points:', error);
      setError(error.message || 'Помилка при обміні балів');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shop-modal">
      <div className="shop-modal-content">
        <button className="close-shop-modal" onClick={onClose}>×</button>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="shop-container">
          {rewards.map((reward) => (
            <div key={reward.id} className="box">
              <div className="box-img">
                <img src={reward.image} alt={reward.name} />
              </div>
              <h2>{reward.name}</h2>
              <span>{reward.points.toLocaleString()} балів</span>
              <button
                className={`btn ${currentPoints < reward.points ? 'disabled' : ''}`}
                onClick={() => handleSpendPoints(reward)}
                disabled={isProcessing || currentPoints < reward.points}
              >
                {isProcessing ? 'Обробка...' : 'Обміняти'}
              </button>
              {currentPoints < reward.points && (
                <div className="points-needed">
                  Потрібно ще {(reward.points - currentPoints).toLocaleString()} балів
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;