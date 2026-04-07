// Global Rates for Sell
var SELL_LIVE_INR = 94.8; 
var SELL_BTC_INR = 5000000;
const MAX_INR_LIMIT = 25000; // Fixed Max limit in INR

function updateSellUI() {
    const cryptoInput = document.getElementById('send-crypto-val');
    const upiOutput = document.getElementById('receive-upi-val');
    const selectedText = document.getElementById('sell-selected-text');
    const rateDisplay = document.getElementById('sell-rate-display');
    
    // Find the Max Label span (Usually the second span in limit-labels)
    const limitLabels = document.querySelectorAll('.limit-labels span');
    const maxLabel = limitLabels.length > 1 ? limitLabels[1] : null;

    if (!cryptoInput || !upiOutput || !selectedText) return;

    const isBTC = selectedText.innerText.includes("BTC");
    const rate = isBTC ? SELL_BTC_INR : SELL_LIVE_INR;

    // 1. Calculate and Update Dynamic Max Label
    const dynamicMaxCrypto = (MAX_INR_LIMIT / rate).toFixed(isBTC ? 6 : 2);
    if (maxLabel) {
        maxLabel.innerText = `Max: ${dynamicMaxCrypto} ${isBTC ? 'BTC' : 'USDT'}`;
    }

    // 2. Live Conversion Math
    const val = parseFloat(cryptoInput.value);
    const resultInr = val * rate;

    if (!isNaN(val) && val > 0) {
        upiOutput.value = resultInr.toFixed(2);
    } else {
        upiOutput.value = '';
    }

    // 3. Update Rate Pill
    if (rateDisplay) {
        rateDisplay.innerText = isBTC ? `1 BTC = ${SELL_BTC_INR.toLocaleString()} INR` : `1 USDT = ${SELL_LIVE_INR} INR`;
    }

    // 4. Neon Border & Red Error Logic (Min & Max check)
    const cryptoBox = cryptoInput.closest('.inner-box');
    const minLimit = isBTC ? 0.00003 : 1.11;

    if (cryptoBox) {
        // Trigger error if: below min OR result exceeds 25,000 INR
        if (val > 0 && (val < minLimit || resultInr > MAX_INR_LIMIT)) {
            cryptoBox.classList.add('error-neon');
            cryptoBox.classList.remove('active-neon');
        } else if (val >= minLimit && resultInr <= MAX_INR_LIMIT) {
            cryptoBox.classList.remove('error-neon');
            cryptoBox.classList.add('active-neon');
        } else {
            cryptoBox.classList.remove('error-neon', 'active-neon');
        }
    }
}

function initSellLogic() {
    const cryptoInput = document.getElementById('send-crypto-val');
    const dropTrigger = document.getElementById('sell-drop-trigger');
    const menuList = document.getElementById('sell-menu-list');
    const boxes = document.querySelectorAll('.main-card .inner-box');

    // --- A. Fix Input Math ---
    cryptoInput?.addEventListener('input', updateSellUI);

    // --- B. Fix Neon Border Shifting ---
    boxes.forEach(box => {
        box.onclick = () => {
            if (box.classList.contains('error-neon')) return;
            boxes.forEach(b => b.classList.remove('active-neon'));
            box.classList.add('active-neon');
        };
    });

    // --- C. Fix Dropdown Opening ---
    if (dropTrigger) {
        dropTrigger.onclick = (e) => {
            e.stopPropagation();
            menuList?.classList.toggle('show');
        };
    }

    // --- D. Fix Dropdown Selection ---
    document.querySelectorAll('#sell-menu-list .menu-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('sell-selected-text').innerText = item.innerText.trim();
            document.getElementById('sell-current-icon').src = item.getAttribute('data-img');
            
            const isBTC = item.innerText.includes("BTC");
            const minLabel = document.getElementById('sell-min-label');
            if (minLabel) {
                minLabel.innerText = isBTC ? "Min: 0.00003 BTC" : "Min: 1.11 USDT";
            }
            
            menuList?.classList.remove('show');
            updateSellUI(); // Recalculate everything immediately on currency change
        };
    });

    // Close dropdown on click outside
    window.addEventListener('click', () => {
        menuList?.classList.remove('show');
    });
}

// Fetch Prices and Start
async function fetchSellPrices() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin&vs_currencies=inr');
        const data = await res.json();
        SELL_LIVE_INR = data.tether.inr;
        SELL_BTC_INR = data.bitcoin.inr;
        updateSellUI();
    } catch (e) { 
        console.error("Sell price fetch failed"); 
    }
}

// Kick it off
initSellLogic();
fetchSellPrices();
setInterval(fetchSellPrices, 30000); // Keep it updated
