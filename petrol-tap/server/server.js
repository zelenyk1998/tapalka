import express from "express";
import http from "http";
import redis from "redis";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Redis client setup
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
await client.connect().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  const sessionId = req.headers["sec-websocket-protocol"] || 
                   `session-${Math.random().toString(36)}`;
                   
  console.log(`New client connected with session ID: ${sessionId}`);
  ws.sessionId = sessionId;

  // Send initial click count
  client.get(`clicks:${sessionId}`).then((qty) => {
    const clks = parseFloat(qty) || 0;
    ws.send(JSON.stringify({ clks }));
  }).catch(console.error);

  // Handle click events
  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      const { e } = parsedMessage;

      if (e === "clk") {
        const currentClks = await client.get(`clicks:${sessionId}`);
        const clksNum = parseFloat(currentClks) || 0;

        // Calculate increment value based on current clicks
        let incrementValue;
        if (clksNum >= 999.9) {
          incrementValue = 50;
        } else if (clksNum >= 499.9) {
          incrementValue = 200;
        } else if (clksNum >= 199.9) {
          incrementValue = 100;
        } else if (clksNum >= 99.9) {
          incrementValue = 50;
        } else {
          incrementValue = 50;
        }

        // Increment clicks and send update
        const newClks = await client.incrByFloat(`clicks:${sessionId}`, incrementValue);
        const roundedClks = Math.round(newClks * 10) / 10;
        ws.send(JSON.stringify({ clks: roundedClks }));
      } else if (e === "reset") {
        await client.set(`clicks:${sessionId}`, '0');
        ws.send(JSON.stringify({ clks: 0 }));
      }
    } catch (error) {
      console.error("Failed to parse message", error);
    }
  });

  // Handle disconnect
  ws.on("close", () => {
    console.log(`Client with session ID ${sessionId} disconnected`);
  });
});

// API Routes

// Endpoint для списання балів
app.post('/api/spend-points', async (req, res) => {
  try {
    const { sessionId, points, reward } = req.body;
    const currentBalance = await client.get(`clicks:${sessionId}`);
    const balance = parseFloat(currentBalance) || 0;

    console.log('Current balance:', balance, 'Trying to spend:', points); // Для дебагу

    if (balance >= points) {
      const newBalance = await client.incrByFloat(`clicks:${sessionId}`, -points);
      const roundedBalance = Math.round(newBalance * 10) / 10;
      
      // Зберігаємо історію обміну
      await client.lPush(`history:${sessionId}`, JSON.stringify({
        date: new Date().toISOString(),
        reward: reward,
        points: points,
        newBalance: roundedBalance
      }));

      res.json({ 
        success: true, 
        newBalance: roundedBalance,
        message: 'Обмін успішний' 
      });

      // Оновлюємо баланс через WebSocket
      wss.clients.forEach((client) => {
        if (client.sessionId === sessionId) {
          client.send(JSON.stringify({ clks: roundedBalance, exchange: roundedBalance }));
        }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Недостатньо балів' 
      });
    }
  } catch (error) {
    console.error('Error spending points:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера при обміні балів' 
    });
  }
});

// Endpoint для отримання історії обмінів
app.get('/api/exchange-history', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const history = await client.lRange(`history:${sessionId}`, 0, -1);
    res.json(history.map(item => JSON.parse(item)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Endpoint для скидання балансу
app.post('/api/reset-balance', async (req, res) => {
  try {
    const { sessionId } = req.body;
    await client.set(`clicks:${sessionId}`, '0');
    
    res.json({ success: true, message: 'Balance reset successfully' });
    
    // Оновлюємо баланс через WebSocket
    wss.clients.forEach((client) => {
      if (client.sessionId === sessionId) {
        client.send(JSON.stringify({ clks: 0 }));
      }
    });
  } catch (error) {
    console.error('Error resetting balance:', error);
    res.status(500).json({ success: false, message: 'Failed to reset balance' });
  }
});

app.post('/api/invite', async (req, res) => {
  try {
    const { sessionId, friendId } = req.body;
    await client.incrByFloat(`clicks:${sessionId}`, 1000);
    await client.incrByFloat(`clicks:${friendId}`, 500);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle Redis errors
client.on('error', (err) => console.error('Redis Client Error', err));

// Handle process errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Redis connection...');
  
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  await client.quit();
  console.log('Redis connection closed');
  
  process.exit(0);
});