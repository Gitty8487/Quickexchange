const axios = require('axios');
const fs = require('fs');
const path = require('path');

let names = ["System Admin"];
try {
    const data = fs.readFileSync(path.join(__dirname, 'names.txt'), 'utf8');
    names = data.split('\n').filter(name => name.trim() !== "");
} catch (err) { console.error("names.txt load failed"); }

let tradeHistory = []; 
let cachedPrices = { tether: 91.5, bitcoin: 8200000 };

async function updatePrices() {
    try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin&vs_currencies=inr');
        if (res.data.tether && res.data.bitcoin) {
            cachedPrices.tether = res.data.tether.inr;
            cachedPrices.bitcoin = res.data.bitcoin.inr;
        }
    } catch (e) { console.error("Price update failed."); }
}
setInterval(updatePrices, 60000);
updatePrices();

function getWeightedInrAmount(isBTC) {
    const r = Math.random() * 100;
    const minLimit = isBTC ? 200 : 100;
    if (r <= 60) return Math.floor(Math.random() * (600 - minLimit) + minLimit);
    if (r <= 80) return Math.floor(Math.random() * (3500 - 601) + 601);
    if (r <= 91) return Math.floor(Math.random() * (8500 - 3501) + 3501);
    if (r <= 94) return Math.floor(Math.random() * (14000 - 8501) + 8501);
    if (r <= 96) return Math.floor(Math.random() * (18500 - 14001) + 14001);
    if (r <= 98) return Math.floor(Math.random() * (20000 - 18501) + 18501);
    if (r <= 99) return Math.floor(Math.random() * (22500 - 20001) + 20001);
    return Math.floor(Math.random() * (25000 - 22501) + 22501);
}

async function generateFakeTransaction(isInitial = false) {
    const name = names[Math.floor(Math.random() * names.length)].trim();
    const cryptos = [
        { name: "USDT", net: "(ERC-20)", key: 'tether' },
        { name: "USDT", net: "(TRC-20)", key: 'tether' },
        { name: "USDT", net: "(BEP-20)", key: 'tether' },
        { name: "BTC", net: "", key: 'bitcoin' }
    ];
    
    const cryptoType = cryptos[Math.floor(Math.random() * cryptos.length)];
    const currentRate = cachedPrices[cryptoType.key];
    const isBTC = cryptoType.name === "BTC";
    const isBuyingCrypto = Math.random() >= 0.65; 
    
    let targetInrValue = getWeightedInrAmount(isBTC);
    let sent, received;

    if (isBuyingCrypto) {
        if (Math.random() < 0.80) {
            targetInrValue = targetInrValue < 1000 ? Math.round(targetInrValue/10)*10 : Math.round(targetInrValue/100)*100;
        }
        const cryptoAmt = (targetInrValue / currentRate).toFixed(isBTC ? 6 : 2);
        sent = `${targetInrValue.toLocaleString()} INR`;
        received = `${cryptoAmt} ${cryptoType.name} ${cryptoType.net}`;
    } else {
        const cryptoAmt = (targetInrValue / currentRate).toFixed(isBTC ? 6 : 2);
        sent = `${cryptoAmt} ${cryptoType.name} ${cryptoType.net}`;
        received = `${targetInrValue.toLocaleString()} INR`;
    }

    const tradeId = Date.now() + Math.random().toString(36).substr(2, 9);
    let status = Math.random() < 0.80 ? 'Completed' : 'Pending';

    const trade = { 
        id: tradeId, name, sent, received, status, 
        timestamp: isInitial ? (Date.now() - Math.random() * 120000) : Date.now() 
    };

    tradeHistory.unshift(trade);
    if (tradeHistory.length > 10) tradeHistory.pop();

    if (status === 'Pending') {
        const delay = isInitial ? 20000 : Math.floor(Math.random() * (100000 - 30000) + 30000);
        setTimeout(() => {
            const found = tradeHistory.find(t => t.id === tradeId);
            if (found && found.status === 'Pending') {
                found.status = 'Completed';
                if (global.broadcastStatusUpdate) global.broadcastStatusUpdate(tradeId, 'Completed');
            }
        }, delay);
    }
    return trade;
}

async function initHistory() { for(let i=0; i<10; i++) { await generateFakeTransaction(true); } }
initHistory();

module.exports = { generateFakeTransaction, getInitialTrades: () => tradeHistory };
