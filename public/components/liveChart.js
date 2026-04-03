const liveChart = {
    trades: [],

    add(data, isNew = false) {
        if (!data.timestamp) data.timestamp = Date.now();
        
        // Use unshift to add to the top
        this.trades.unshift(data);
        
        // Keep the display to exactly 10 rows
        if (this.trades.length > 10) this.trades.pop();
        
        this.render(isNew);
    },

    // --- Update status without re-rendering everything ---
    updateStatus(id, newStatus) {
        // Update the data in our array
        const trade = this.trades.find(t => t.id === id);
        if (trade) {
            trade.status = newStatus;
            
            // Find the specific row in the DOM and update it instantly
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                const statusPill = row.querySelector('.status-pill');
                if (statusPill) {
                    statusPill.textContent = newStatus;
                    statusPill.className = `status-pill ${newStatus.toLowerCase()}`;
                }
            }
        }
    },

    render(isNew) {
        const body = document.getElementById('transactionBody');
        if (!body) return;

        body.innerHTML = this.trades.map((t, i) => {
            const diff = Math.floor((Date.now() - t.timestamp) / 1000);
            let timeStr = diff < 5 ? "Just now" : `${diff}s ago`;
            
            if (diff >= 60) {
                const mins = Math.floor(diff / 60);
                timeStr = mins === 1 ? "1 min ago" : `${mins} mins ago`;
            }

            const nameParts = t.name.split(' ');
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(' ') || "";

            return `
                <tr data-id="${t.id}" class="${(i === 0 && isNew) ? 'new-row' : ''}">
                    <td>
                        <div class="name-container">
                            <span class="first-name">${firstName}</span>
                            <span class="last-name">${lastName}</span>
                        </div>
                    </td>
                    <td>${t.sent}</td>
                    <td>${t.received}</td>
                    <td>
                        <span class="status-pill ${t.status.toLowerCase()}">
                            ${t.status}
                        </span>
                    </td>
                    <td class="time-txt">${timeStr}</td>
                </tr>
            `;
        }).join('');
    }
};

// WebSocket Logic
const socket = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);

socket.onmessage = (e) => {
    try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'initialData') {
            // Clear existing and load seed data in correct order
            liveChart.trades = []; 
            data.payload.slice().reverse().forEach(t => liveChart.add(t, false));
        } 
        else if (data.type === 'newTrade') {
            // Add new trade with the slide-in animation
            liveChart.add(data.payload, true);
        }
        // Handle the status update from the server
        else if (data.type === 'statusUpdate') {
            liveChart.updateStatus(data.payload.id, data.payload.status);
        }
    } catch (err) {
        console.error("Socket Error:", err);
    }
};

// Refresh "Seconds ago" text every 1 second
setInterval(() => liveChart.render(false), 1000);
