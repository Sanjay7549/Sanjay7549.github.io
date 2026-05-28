/**
 * Main JavaScript File
 * - Restored: GTM, Scroll Animations, Lazy Loading, Detail Toggles
 * - Fixed: Lucide icon initialization for local hosting
 */

document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // 1. ICONS (Lucide)
    // ---------------------------------------------------------
    // We check window.lucide to ensure it loaded from the local file
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // ---------------------------------------------------------
    // 2. THEME TOGGLE
    // ---------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            if (htmlElement.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });
    }

    // ---------------------------------------------------------
    // 3. EXPANDABLE DETAILS
    // ---------------------------------------------------------
    const toggleButtons = document.querySelectorAll('.js-details-toggle');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const icon = document.getElementById('icon-' + targetId);
            const btnText = document.getElementById('btn-text-' + targetId);

            if (!content) return;

            // Toggle logic
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                // Allow a small delay for animation if needed, or just toggle class
                content.classList.add('open');
                this.setAttribute('aria-expanded', 'true');

                if (icon) icon.style.transform = 'rotate(180deg)';
                if (btnText) btnText.innerText = 'Hide Details';
            } else {
                content.classList.add('hidden');
                content.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');

                if (icon) icon.style.transform = 'rotate(0deg)';
                if (btnText) btnText.innerText = 'Show Engineering Deep Dive (Primary RAG)';
            }
        });
    });

    // ---------------------------------------------------------
    // 4. SCROLL ANIMATIONS
    // ---------------------------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // We add a class that handles the actual animation in CSS (e.g., animate-fade-up)
                // Assuming 'animate-fade-up' is defined in your styles.css or Tailwind config
                entry.target.classList.add('animate-fade-up');
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-on-scroll').forEach(section => {
        section.style.opacity = '0'; // Ensure hidden initially
        observer.observe(section);
    });

    // ---------------------------------------------------------
    // 5. LAZY LOADING IMAGES
    // ---------------------------------------------------------
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    imgObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: "200px 0px",
        threshold: 0.01
    });

    document.querySelectorAll('.lazy-image').forEach(img => {
        imageObserver.observe(img);
    });

    // ---------------------------------------------------------
    // 6. COPY EMAIL
    // ---------------------------------------------------------
    const emailBtn = document.getElementById('btn-copy-email');
    if (emailBtn) {
        emailBtn.addEventListener('click', copyEmail);
    }
});

// ---------------------------------------------------------
// HELPER: Google Tag Manager (Delayed)
// ---------------------------------------------------------
function loadGTM() {
    if (window.gtmLoaded) return;

    // The entrypoint.sh will replace this string.
    const gtagId = '${GTAG_ID}';

    // Abort if gtagId is empty (Dev environment) or failed to substitute
    if (!gtagId || gtagId === '' || gtagId.startsWith('$')) {
        console.log('Analytics disabled: No GTAG_ID found.');
        return;
    }

    window.gtmLoaded = true;

    // Inject Script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    document.head.appendChild(script);

    // Initialize DataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gtagId);
}

// Load GTM on interaction or delay (Performance optimization)
['click', 'scroll', 'mousemove', 'touchstart'].forEach(event => {
    window.addEventListener(event, loadGTM, { once: true });
});
setTimeout(loadGTM, 3500);

// ---------------------------------------------------------
// HELPER: Copy Email Logic
// ---------------------------------------------------------
function copyEmail() {
    const btn = document.getElementById('btn-copy-email');
    const email = btn.getAttribute('data-email');
    const btnText = document.getElementById('email-text');
    const originalText = btnText ? btnText.innerText : 'Copy Email';

    const showSuccess = () => {
        if (btnText) {
            btnText.innerText = 'Copied!';
            // Visual feedback on button color if desired
            btn.classList.add('bg-green-600');

            setTimeout(() => {
                btnText.innerText = originalText;
                btn.classList.remove('bg-green-600');
            }, 2000);
        }
    };

    const fallbackCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        // Move off-screen
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showSuccess();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textarea);
    };

    // Try modern API first, fall back to execCommand
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
            .then(showSuccess)
            .catch(() => fallbackCopy());
    } else {
        fallbackCopy();
    }
}