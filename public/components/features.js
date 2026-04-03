function initFeatures() {
    const items = document.querySelectorAll('.feature-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.05 });

    items.forEach(item => observer.observe(item));
}
initFeatures();

function initFeaturesAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger the animation
                entry.target.classList.add('animate-in');
                
                // Once it's animated, stop watching it so it stays visible
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.2, // Wait until 20% of the item is on screen
        rootMargin: "0px 0px -100px 0px" // Trigger 100px after it enters from the bottom
    });

    const items = document.querySelectorAll('.feature-item');
    items.forEach(el => observer.observe(el));
}

initFeaturesAnimation();


// --- HEADER ANIMATION TRIGGER ---
function initHeaderAnimation() {
    const title = document.querySelector('.section-title');
    const subtitle = document.querySelector('.section-subtitle');

    if (title && subtitle) {
        const headerObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                title.classList.add('animate-in');
                subtitle.classList.add('animate-in');
                headerObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.1 });

        // We observe the title to trigger both
        headerObserver.observe(title);
    }
}

initHeaderAnimation();

