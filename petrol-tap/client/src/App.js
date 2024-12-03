// App.js
import React, { useState, useEffect } from 'react';
import ClickButton from './components/ClickButton';
import RewardsModal from './components/RewardsModal';
import InviteModal from './components/InviteModal';
import TelegramModal from './components/TelegramModal';
import CoffeeProgress from './components/CoffeeProgress';
import './styles/styles.css';

const App = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const generateSessionId = () => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  const connectWebSocket = () => {
    const sessionId = generateSessionId();
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const newWs = new WebSocket(`${wsProtocol}://localhost:3000`, sessionId);

    newWs.onopen = () => {
      console.log("Connected to WebSocket server with session ID: " + sessionId);
      setWs(newWs);
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.clks !== undefined) {
        setClickCount(data.clks);
      }
    };

    newWs.onclose = () => {
      console.log("Disconnected from WebSocket server. Attempting to reconnect...");
      setTimeout(connectWebSocket, 3000);
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const handleClick = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ e: "clk" }));
    } else {
      console.log("WebSocket is not connected");
      connectWebSocket();
    }
  };

  const handleReset = () => {
    if (window.confirm('Ви впевнені, що хочете скинути баланс?')) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ e: "reset" }));
      }
    }
  };

  return (
    <div className="app">
      <h1>PetrolTap</h1>
      
      <ClickButton onClick={handleClick} />
      
      <div className="click-count-container">
        Кількість балів: <span className="click-count">{clickCount}</span>
      </div>

      <CoffeeProgress currentPoints={clickCount} />

      <div className="buttons-container">
        <button className="button" onClick={() => setShowRewardsModal(true)}>
          Відкрити нагороди
        </button>
        
        <button className="button" onClick={() => setShowInviteModal(true)}>
          Запросити друга
        </button>
        
        <button className="button" onClick={() => setShowTelegramModal(true)}>
          Приєднатись до телеграм каналу
        </button>

        <button 
          className="button reset-button" 
          onClick={handleReset}
        >
          Скинути баланс
        </button>
      </div>

      <RewardsModal 
        isOpen={showRewardsModal} 
        onClose={() => setShowRewardsModal(false)}
        currentPoints={clickCount}
      />
      
      <InviteModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
      />
      
      <TelegramModal 
        isOpen={showTelegramModal} 
        onClose={() => setShowTelegramModal(false)}
      />
    </div>
  );
};

export default App;