function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        // We filter for entries actually intersecting to get a clean index for the delay
        const visibleEntries = entries.filter(e => e.isIntersecting);

        visibleEntries.forEach((entry, index) => {
            const numEl = entry.target;
            const card = numEl.closest('.stat-card');
            const target = parseFloat(numEl.getAttribute('data-target'));
            
            // PROFESSIONAL DELAY: Cards pop in one after another (150ms gap)
            setTimeout(() => {
                if (card) card.classList.add('animate-in');

                // Start the number counting logic ONLY when the card begins to appear
                let startTime = null;
                const duration = 2000; 

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const currentNum = easeOut * target;

                    if (target % 1 === 0) {
                        numEl.innerText = Math.floor(currentNum).toLocaleString();
                    } else {
                        numEl.innerText = currentNum.toFixed(1);
                    }

                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        numEl.innerText = target % 1 === 0 ? target.toLocaleString() : target.toFixed(1);
                    }
                }
                window.requestAnimationFrame(step);
            }, index * 150); 

            observer.unobserve(numEl);
        });
    }, { threshold: 0.2 });

    statNumbers.forEach(num => observer.observe(num));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatsCounter);
} else {
    initStatsCounter();
}
