require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const exchangeRoutes = require('./route/exchange');

// --- THE LOGIC IMPORT ---
const { 
    generateFakeTransaction, 
    getInitialTrades 
} = require(path.join(__dirname, 'public', 'components', 'transactionLogic'));

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/exchange', exchangeRoutes);

// --- GLOBAL STATUS BROADCASTER (For Pending -> Completed) ---
global.broadcastStatusUpdate = (id, newStatus) => {
    const updateMessage = JSON.stringify({
        type: 'statusUpdate',
        payload: { id, status: newStatus }
    });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(updateMessage);
        }
    });
};

// --- WEBSOCKET: SEND SHARED HISTORY ON CONNECT ---
wss.on('connection', (ws) => {
    console.log('New browser connected. Sending shared server-side history...');
    try {
        const seedData = getInitialTrades();
        ws.send(JSON.stringify({
            type: 'initialData',
            payload: seedData
        }));
    } catch (err) {
        console.error("Error sending initial data:", err);
    }
});

// --- THE DYNAMIC PROBABILITY HEARTBEAT ---
let lastTradeTime = Date.now();

const dynamicHeartbeat = async () => {
    const elapsed = (Date.now() - lastTradeTime) / 1000;
    let chance = 0;

    // Probability logic based on time elapsed
    if (elapsed < 25) {
        chance = 0.05; // Very Low
    } else if (elapsed >= 25 && elapsed < 30) {
        chance = 0.15; // Still Low
    } else if (elapsed >= 30 && elapsed < 45) {
        chance = 0.50; // Medium
    } else {
        chance = 1.0;  // Guaranteed at 45s+
    }

    if (Math.random() < chance) {
        try {
            const newTrade = await generateFakeTransaction();
            const message = JSON.stringify({ 
                type: 'newTrade', 
                payload: newTrade 
            });

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });

            lastTradeTime = Date.now();
        } catch (err) {
            console.error("Error in heartbeat:", err);
        }
    }

    // Check every 3 seconds
    setTimeout(dynamicHeartbeat, 3000); 
};

// Start the dynamic loop
dynamicHeartbeat();

// --- START SERVER ---
server.listen(PORT, () => {
    console.log(`>>> QuickExchange Live: http://localhost:${PORT}`);
});
