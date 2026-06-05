document.addEventListener("DOMContentLoaded", () => {
    // Shared Navbar HTML
    const navbarHTML = `
        <nav class="navbar">
            <a href="index.html" class="brand">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Energy Forecast
            </a>
            <ul class="nav-links">
                <li><a href="index.html" id="nav-home">Home</a></li>
                <li><a href="generation-forecasts.html" id="nav-forecasts">Generation Forecasts</a></li>
                <li><a href="plant-analytics.html" id="nav-analytics">Plant Analytics</a></li>
                <li><a href="grid-copilot.html" id="nav-copilot">Grid Copilot</a></li>
                <li><a href="scenario-simulator.html" id="nav-simulator">Scenario Simulator</a></li>
                <li><a href="about.html" id="nav-about">About</a></li>
            </ul>
        </nav>
    `;

    // Shared Footer HTML
    const footerHTML = `
        <footer class="footer">
            <p>&copy; 2026 Advanced Energy Forecast System for Sri Lanka's Energy Grid</p>
        </footer>
    `;

    // Universal Copilot Bubbly Button
    const copilotButtonHTML = `
        <a href="grid-copilot.html" class="copilot-fab" aria-label="Launch Grid Copilot">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                <path d="M4.93 10.93a2 2 0 0 1 2.83 0l1.41 1.41a2 2 0 0 1-2.83 2.83l-1.41-1.41a2 2 0 0 1 0-2.83z"></path>
                <path d="M19.07 10.93a2 2 0 0 1 0 2.83l-1.41 1.41a2 2 0 0 1-2.83-2.83l1.41-1.41a2 2 0 0 1 2.83 0z"></path>
                <circle cx="12" cy="16" r="4"></circle>
            </svg>
        </a>
    `;

    // Inject Navbar
    const navbarPlaceholder = document.getElementById("navbar-placeholder");
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = navbarHTML;
    }

    // Inject Footer
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }

    // Inject Copilot Button to Body
    document.body.insertAdjacentHTML('beforeend', copilotButtonHTML);

    // Set Active Link State based on current page
    setTimeout(() => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }, 100);

    // Draggable Copilot FAB Logic
    const fab = document.querySelector('.copilot-fab');
    if (fab) {
        let isDragging = false;
        let isMoved = false;
        let startX, startY, initialLeft, initialTop;

        const startDrag = (e) => {
            isDragging = true;
            isMoved = false;
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;

            const rect = fab.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            fab.style.transition = 'none'; // Disable transition for smooth dragging
            fab.style.right = 'auto'; // Break free from anchored right styling
            fab.style.bottom = 'auto';
        };

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Stop scrolling while dragging
            isMoved = true;

            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;

            const dx = currentX - startX;
            const dy = currentY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            // Keep within viewport bounds
            newLeft = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, newTop));

            fab.style.left = `${newLeft}px`;
            fab.style.top = `${newTop}px`;
        };

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            fab.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        };

        // Attach listeners
        fab.addEventListener('mousedown', startDrag);
        fab.addEventListener('touchstart', startDrag, { passive: false });

        document.addEventListener('mousemove', drag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);

        // Prevent accidental link clicking if it was a drag action
        // Also prevent reloading if we are already on the copilot page
        fab.addEventListener('click', (e) => {
            if (isMoved) {
                e.preventDefault();
            } else if (window.location.pathname.endsWith('grid-copilot.html')) {
                // If we are already on the chat page, do nothing when clicked
                e.preventDefault();
            }
        });
    }
});
