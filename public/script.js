/**
 * QuickExchange Pro - Core Logic
 */

// --- 1. CONFIG & GLOBALS ---
let LIVE_INR_PRICE = 94.8; 
let BTC_INR_PRICE = 5000000;
const MIN_SEND = 100;
const MAX_SEND = 25000;

// --- 2. LIVE PRICE ENGINE ---
async function fetchPrices() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin&vs_currencies=inr');
        const data = await res.json();
        if (data.tether && data.bitcoin) {
            LIVE_INR_PRICE = data.tether.inr;
            BTC_INR_PRICE = data.bitcoin.inr;
            updateUI();
        }
    } catch (e) {
        console.error("Price fetch failed.");
    }
}

// --- 3. UI & CALCULATION ---
function updateUI() {
    const selectedText = document.getElementById('selected-text');
    const rateDisplay = document.getElementById('rate-display');
    const sendInput = document.getElementById('send-val');
    const receiveInput = document.getElementById('receive-val');
    const sendBox = sendInput?.closest('.inner-box');
    
    
    const minSendLabel = document.getElementById('min-send-display');
    if (minSendLabel && selectedText) {
        minSendLabel.innerText = selectedText.innerText.includes("BTC") ? "Min: 150₹ UPI" : "Min: 100₹ UPI";
    
    }


    if (!selectedText || !sendInput || !receiveInput) return;

    const isBTC = selectedText.innerText.includes("BTC");
    const rate = isBTC ? BTC_INR_PRICE : LIVE_INR_PRICE;

    // Update Price Pill
    if (rateDisplay) {
        rateDisplay.innerText = isBTC 
            ? `200 INR = ${(200 / BTC_INR_PRICE).toFixed(8)} BTC`
            : `1 USDT = ${LIVE_INR_PRICE} INR`;
    }

    // Math
    const val = parseFloat(sendInput.value);
    if (!isNaN(val) && val > 0) {
        receiveInput.value = (val / rate).toFixed(isBTC ? 8 : 2);
    } else {
        receiveInput.value = '';
    }

    // Neon Validation
    if (sendBox) {
        if (val < MIN_SEND || val > MAX_SEND) {
            sendBox.classList.add('error-neon');
            sendBox.classList.remove('active-neon');
        } else {
            sendBox.classList.remove('error-neon');
            sendBox.classList.add('active-neon');
        }
    }
}

// --- 4. EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Input Logic
    document.getElementById('send-val')?.addEventListener('input', updateUI);

    // Neon Border Switching
    const allInnerBoxes = document.querySelectorAll('.inner-box');
    allInnerBoxes.forEach(box => {
        box.addEventListener('click', () => {
            if (box.classList.contains('error-neon')) return;
            allInnerBoxes.forEach(b => b.classList.remove('active-neon'));
            box.classList.add('active-neon');
        });
    });

    // Dropdown Logic
    const dropTrigger = document.getElementById('drop-trigger');
    const menuList = document.getElementById('menu-list');

    dropTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        menuList?.classList.toggle('show');
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const textEl = document.getElementById('selected-text');
            const iconEl = document.getElementById('current-icon');
            if (textEl) textEl.innerText = item.innerText.trim();
            if (iconEl) iconEl.src = item.getAttribute('data-img');
            menuList?.classList.remove('show');
            updateUI();
        });
    });

    // Hamburger Logic
const navToggle = document.getElementById('nav-toggle');
const navDrawer = document.getElementById('nav-drawer');

if (navToggle && navDrawer) {
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        // This opens the side menu
        navDrawer.classList.toggle('active');
        // This triggers the 'X' animation in CSS
        navToggle.classList.toggle('is-active');
    });
}


    // Outside Click closer
    window.addEventListener('click', () => {
        
        if (navDrawer.classList.contains('active'))
 
    {      navDrawer.classList.remove('active');
            navToggle.classList.remove('is-active');
      }
        menuList?.classList.remove('show');
        navDrawer?.classList.remove('active');
    });

    // Start fetching
    fetchPrices();
    setInterval(fetchPrices, 30000);
});



async function loadFeatures() {
    const res = await fetch('components/features.html');
    const html = await res.text();
    document.getElementById('features-placeholder').innerHTML = html;
    
    // Inject the animation script AFTER the HTML exists
    const script = document.createElement('script');
    script.src = 'components/features.js';
    document.body.appendChild(script);
}
loadFeatures();


async function loadStatsComponent() {
    const res = await fetch('components/stats.html');
    const html = await res.text();
    document.getElementById('stats-placeholder').innerHTML = html;
    
    // After HTML is loaded, load the stats script
    const script = document.createElement('script');
    script.src = 'components/stats.js';
    document.body.appendChild(script);
}
loadStatsComponent();


