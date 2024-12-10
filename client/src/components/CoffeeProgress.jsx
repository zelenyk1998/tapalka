// components/CoffeeProgress.jsx
import React, { useEffect, useState } from 'react';
import '../styles/CoffeeProgress.css';

const CoffeeProgress = ({ currentPoints }) => {
  const [fillPercentage, setFillPercentage] = useState(0);
  const maxPoints = 20000;

  // Функція для визначення рівня наповнення
  const calculateFillLevel = (points) => {
    const levels = [
      { points: 2000, fill: 10 },    // 10% при 2,000 балів
      { points: 5000, fill: 25 },    // 25% при 5,000 балів
      { points: 8000, fill: 40 },    // 40% при 8,000 балів
      { points: 12000, fill: 60 },   // 60% при 12,000 балів
      { points: 16000, fill: 80 },   // 80% при 16,000 балів
      { points: 20000, fill: 100 },  // 100% при 20,000 балів
    ];

    // Знаходимо відповідний рівень
    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].points) {
        return levels[i].fill;
      }
    }
    
    // Якщо менше першого рівня, розраховуємо пропорційно
    if (points < levels[0].points) {
      return (points / levels[0].points) * levels[0].fill;
    }

    return 0;
  };

  useEffect(() => {
    const newFillPercentage = calculateFillLevel(currentPoints);
    setFillPercentage(newFillPercentage);
  }, [currentPoints]);

  // Функція для отримання кольору кави в залежності від рівня
  const getCoffeeColor = (percentage) => {
    if (percentage <= 20) return '#DAA06D';
    if (percentage <= 40) return '#C68E5B';
    if (percentage <= 60) return '#A0522D';
    if (percentage <= 80) return '#8B4513';
    return '#654321';
  };

  // Функція для відображення статусу
  const getFillStatus = () => {
    if (fillPercentage < 10) return 'Починаємо наповнювати';
    if (fillPercentage < 25) return 'Трохи кави';
    if (fillPercentage < 40) return 'Майже чверть';
    if (fillPercentage < 60) return 'Половина';
    if (fillPercentage < 80) return 'Майже повна';
    if (fillPercentage < 100) return 'Ще трошки';
    return 'Чашка повна!';
  };

  return (
    <div className="coffee-container">
      <div className="coffee-cup">
        <div 
          className="coffee-fill"
          style={{ 
            height: `${fillPercentage}%`,
            backgroundColor: getCoffeeColor(fillPercentage)
          }}
        >
          <div className="coffee-ripples">
            <div className="ripple"></div>
            <div className="ripple"></div>
            <div className="ripple"></div>
          </div>
        </div>
        <div className="cup-shine"></div>
      </div>
      <div className="cup-handle"></div>
      <div className="plate"></div>
      <div className="progress-text">
        <div>{getFillStatus()}</div>
        <div>{Math.round(fillPercentage)}% наповнення</div>
        <div>{currentPoints.toLocaleString()} / {maxPoints.toLocaleString()} балів</div>
      </div>
    </div>
  );
};

export default CoffeeProgress;