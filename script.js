// ── Cinematic Telugu Preloader ──────────────────────────────────────────────
(function initCinematicPreloader() {

    const preloader    = document.getElementById('preloader');
    const percentEl    = document.getElementById('load-percent');
    const fillEl       = document.getElementById('progressFill');
    const statusEl     = document.getElementById('statusMsg');
    const partKe       = document.getElementById('part-ke');
    const partSa       = document.getElementById('part-sa');
    const partVa       = document.getElementById('part-va');
    const rollingWord  = document.getElementById('rollingWord');
    const preloaderLogo= document.getElementById('preloaderLogo');
    const loadingSystem= document.querySelector('.loading-system');
    const navLogo      = document.getElementById('navLogo');

    if (!preloader || !percentEl || !fillEl || !statusEl) return;

    // ── Status message sequence ──
    const statusMessages = [
        "INITIALIZING PORTFOLIO...",
        "FETCHING CREATIVE ASSETS...",
        "OPTIMIZING VISUAL EXPERIENCE...",
        "ESTABLISHING SECURE CONNECTION...",
        "READY TO LAUNCH..."
    ];

    // ── Telugu random character pool ──
    const teluguPool = [
        'అ','ఆ','ఇ','ఈ','ఉ','ఊ','క','ఖ','గ','చ','జ','ట','డ','త',
        'ద','న','ప','బ','మ','య','ర','ల','వ','శ','ష','స','హ',
        'కా','గా','నా','రా','లా','వా','యా','తా','పా','సా','హా',
        'కి','కీ','గి','చి','జి','ని','పి','బి','మి','రి','లి','వి',
        'కు','గు','చు','జు','టు','డు','ను','పు','బు','మ','యు','రు'
    ];

    // Final locked glyphs
    const GLYPH_KE = 'కే';
    const GLYPH_SA = 'శ';
    const GLYPH_VA = 'వ';

    let count       = 0;
    let keRolling   = true;
    let saRolling   = true;
    let vaRolling   = true;
    let rollInterval= null;

    const totalTime   = 4000; // 4s total (1s English + 3s Telugu rolling)
    const stepTime    = totalTime / 100;
    const ROLL_SPEED  = 55;  // ms per Telugu char swap
    const ENGLISH_PHASE = 1000; // ms to show static KESAVA before rolling

    // ── Phase 0: Show static English 'KESAVA' for 1 second ──
    // (parts already contain KE / SA / VA from HTML — just style as English)
    rollingWord.style.fontFamily   = "'Outfit', sans-serif";
    rollingWord.style.letterSpacing = '0.3em';
    rollingWord.style.fontSize      = 'clamp(2rem, 5vw, 2.8rem)';

    // ── Phase 1: Start Telugu rolling after 1s ──
    setTimeout(() => {
        rollingWord.style.fontFamily    = "'Noto Sans Telugu', 'Outfit', sans-serif";
        rollingWord.style.letterSpacing = '0.05em';
        rollingWord.style.fontSize      = '';

        rollInterval = setInterval(() => {
            const rnd = () => teluguPool[Math.floor(Math.random() * teluguPool.length)];
            if (keRolling && partKe) partKe.textContent = rnd();
            if (saRolling && partSa) partSa.textContent = rnd();
            if (vaRolling && partVa) partVa.textContent = rnd();
        }, ROLL_SPEED);
    }, ENGLISH_PHASE);

    function lockPart(el, glyph) {
        el.textContent = glyph;
        el.classList.add('locked');
    }

    // ── Progress timer ──
    const progressTimer = setInterval(() => {
        count++;
        percentEl.textContent = count;
        fillEl.style.width = `${count}%`;

        // Status messages
        if (count % 20 === 0) {
            const idx = Math.min(Math.floor(count / 20), statusMessages.length - 1);
            statusEl.textContent = statusMessages[idx];
        }

        // Lock glyphs sequentially within the 3s Telugu rolling window
        // Rolling starts at ~count 25 (1s), so locks spread across counts 50 / 75 / 92
        if (count >= 50 && keRolling) {
            keRolling = false;
            lockPart(partKe, GLYPH_KE);
        }
        if (count >= 75 && saRolling) {
            saRolling = false;
            lockPart(partSa, GLYPH_SA);
        }
        if (count >= 92 && vaRolling) {
            vaRolling = false;
            lockPart(partVa, GLYPH_VA);
        }

        if (count >= 100) {
            clearInterval(progressTimer);
            clearInterval(rollInterval);
            document.body.style.overflow = 'auto';

            // Small pause so user sees the completed కేశవ
            setTimeout(runExitAnimation, 350);
        }
    }, stepTime);

    // ── Phase 2: Cinematic Exit ──────────────────────────────────────────────
    function runExitAnimation() {

        // 1. Measure source (rolling word) and target (navbar logo)
        const srcRect  = rollingWord.getBoundingClientRect();
        const navRect  = navLogo.getBoundingClientRect();

        // Font sizes: source is computed, target is the .logo CSS (1.3rem → 20.8px default)
        const srcFontSize = parseFloat(window.getComputedStyle(rollingWord).fontSize);
        const tgtFontSize = parseFloat(window.getComputedStyle(navLogo).fontSize);

        // Scale ratio
        const scaleRatio = tgtFontSize / srcFontSize;

        // 2. Create the flying clone at exactly the source position
        const fly = document.createElement('div');
        fly.className = 'flying-text';
        fly.textContent = 'కేశవ';
        fly.style.fontSize = srcFontSize + 'px';
        fly.style.top      = srcRect.top  + 'px';
        fly.style.left     = srcRect.left + 'px';
        fly.style.transform= 'translate(0, 0) scale(1)';
        fly.style.opacity  = '1';
        document.body.appendChild(fly);

        // 3. Fade background and progress/status
        preloader.classList.add('exit-bg');
        loadingSystem.classList.add('fade-elements');
        preloaderLogo.classList.add('fade-elements');

        // 4. Trigger the glide + scale on next frame (let DOM paint first)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Target top-left of the navLogo element
                const tgtTop  = navRect.top  + (navRect.height - srcFontSize * scaleRatio) / 2;
                const tgtLeft = navRect.left;

                const dx = tgtLeft - srcRect.left;
                const dy = tgtTop  - srcRect.top;

                fly.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleRatio})`;
                fly.style.opacity   = '0';  // fade out just before landing (handled by CSS delay)
            });
        });

        // 5. On animation end — reveal real navLogo, remove everything
        fly.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'transform') return;

            navLogo.classList.add('visible');

            // Remove the fly clone cleanly
            if (fly.parentNode) fly.parentNode.removeChild(fly);

            // Remove preloader from DOM completely
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);

            // Start continuous Telugu <-> English flip
            startNameFlip(navLogo);
        }, { once: true });
    }

    // ── Continuous bilingual name + greeting flip ────────────────────────────
    function startNameFlip(el) {
        const greetingEl = document.getElementById('greetingText');

        const TELUGU_NAME     = 'కేశవ';
        const ENGLISH_NAME    = 'KESAVA';
        const TELUGU_GREETING = 'నమస్కారం నేను';
        const ENGLISH_GREETING= "Hi, I'm";

        const FLIP_INTERVAL = 3500; // ms between language switches
        const FLIP_DURATION = 350;  // ms = half the flip (match CSS transition)

        let isTeluguNow = true;

        // ── Initial state: Telugu ──
        el.textContent      = TELUGU_NAME;
        el.style.fontFamily = "'Noto Sans Telugu', 'Outfit', sans-serif";
        el.style.fontWeight = '800';

        if (greetingEl) {
            greetingEl.textContent  = TELUGU_GREETING;
            greetingEl.style.fontFamily = "'Noto Sans Telugu', 'Outfit', sans-serif";
            greetingEl.style.letterSpacing = '0';
        }

        setInterval(() => {
            // ── Phase A: hide logo (rotateY) + slide greeting out (left) ──
            el.classList.add('flip-hide');
            if (greetingEl) greetingEl.classList.add('slide-exit');

            setTimeout(() => {
                // Swap language
                isTeluguNow = !isTeluguNow;

                if (isTeluguNow) {
                    // Logo → Telugu
                    el.textContent      = TELUGU_NAME;
                    el.style.fontFamily = "'Noto Sans Telugu', 'Outfit', sans-serif";
                    el.style.fontWeight = '800';
                    // Greeting → Telugu
                    if (greetingEl) {
                        greetingEl.textContent     = TELUGU_GREETING;
                        greetingEl.style.fontFamily = "'Noto Sans Telugu', 'Outfit', sans-serif";
                        greetingEl.style.letterSpacing = '0';
                    }
                } else {
                    // Logo → English
                    el.textContent      = ENGLISH_NAME;
                    el.style.fontFamily = "'Outfit', sans-serif";
                    el.style.fontWeight = '800';
                    // Greeting → English
                    if (greetingEl) {
                        greetingEl.textContent     = ENGLISH_GREETING;
                        greetingEl.style.fontFamily = "'Outfit', sans-serif";
                        greetingEl.style.letterSpacing = '1px';
                    }
                }

                // ── Phase B: logo flips back in ──
                el.classList.remove('flip-hide');

                // ── Phase B: greeting slides in from right ──
                if (greetingEl) {
                    // 1. Remove exit class, snap to right (no transition)
                    greetingEl.classList.remove('slide-exit');
                    greetingEl.classList.add('slide-enter');

                    // 2. Next frame: restore transition and slide to center
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            greetingEl.classList.remove('slide-enter');
                        });
                    });
                }
            }, FLIP_DURATION);
        }, FLIP_INTERVAL);
    }

})();

// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
});

// Close mobile menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", () => {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active");
}));

// Intersection Observer for scroll animations is now handled below in the "Advanced Scroll Animation Observer" section.

// Scroll Progress Bar Logic
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressLine = document.getElementById("scroll-progress");
    if (progressLine) progressLine.style.width = scrolled + "%";
});

// Navbar dynamic background on scroll - Refined for Floating Capsule
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active Section Tracking in Navbar
const navObserverOptions = {
    threshold: 0,
    rootMargin: "-25% 0px -65% 0px" // Focuses on a 10% "active zone" in the upper part of the screen
};

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            updateActiveNavLink(`#${id}`);
        }
    });
}, navObserverOptions);

function updateActiveNavLink(href) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === href) {
            link.classList.add('active');
        }
    });
}

document.querySelectorAll('section[id]').forEach((section) => {
    navObserver.observe(section);
});

// Manual override for clicks to ensure immediate UI feedback
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            updateActiveNavLink(href);
        }
    });
});

// Advanced Scroll Animation Observer (Staggered Children)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');

            // If the element has children that should stagger
            const staggerChildren = entry.target.querySelectorAll('.stagger-item');
            staggerChildren.forEach((child, index) => {
                child.style.transitionDelay = `${index * 0.15}s`;
                child.classList.add('reveal-visible');
            });

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    observer.observe(el);
});

// Typing Animation
const textsToType = ["Full Stack Developer", "3rd Year Student", "Frontend Developer"];
const typingElement = document.querySelector(".typing-text");
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!typingElement) return;

    const currentText = textsToType[textIndex];

    if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 120;

    // If word is completely typed
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000; // Pause at the end
        isDeleting = true;
    }
    // If word is completely deleted
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textsToType.length;
        typeSpeed = 500; // Pause before typing next word
    }

    setTimeout(typeEffect, typeSpeed);
}

// Initialize typing effect
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(typeEffect, 500);
});

// Advanced Aurora Glow Tracking for Cards
document.querySelectorAll('.project-card, .cert-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update Aurora Glow Position
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
    });

    card.addEventListener('mouseleave', () => {
        // Optional reset for glow or leave as is
    });
});

// Typing Animation logic remains below...

// Certificate Modal Interactions
const modals = document.querySelectorAll('.modal');
const closeBtns = document.querySelectorAll('.close-modal');

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Small delay to allow display block to take effect before opacity transition
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Wait for transition to finish before hiding
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 400);
    }
}

// Close modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Close modal on escape key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const openModalElement = document.querySelector('.modal.show');
        if (openModalElement) {
            closeModal(openModalElement.id);
        }
    }
});

// Magnetic Button Effect
document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
    });
});

// Playful Contact Form Button
const btnWrapper = document.getElementById('btnWrapper');
const submitBtn = document.getElementById('submitBtn');
const contactForm = document.getElementById('contactForm');

if (btnWrapper && submitBtn && contactForm) {
    // When hovering over the wrapper area
    btnWrapper.addEventListener('mouseenter', () => {
        // If the form is NOT valid (empty fields), hide the button
        if (!contactForm.checkValidity()) {
            submitBtn.classList.add('hide');
        }
    });

    // When the mouse leaves the wrapper area, the button comes back
    btnWrapper.addEventListener('mouseleave', () => {
        submitBtn.classList.remove('hide');
    });

    // Handle Formspree submission with AJAX
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Change button to loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';

        // Check if user is still using the placeholder URL
        if (contactForm.action.includes('xbjnrvle')) {
            setTimeout(() => {
                alert('DEVELOPER NOTE:\nYou need to replace the Formspree URL in index.html with your own to receive actual emails! Showing demo success for now.');

                const successOverlay = document.getElementById('successMessage');
                if (successOverlay) successOverlay.classList.add('show');

                contactForm.reset();
                setTimeout(() => {
                    if (successOverlay) successOverlay.classList.remove('show');
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'all';
                }, 5000);
            }, 1000);
            return;
        }

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show Success Overlay Animation
                const successOverlay = document.getElementById('successMessage');
                if (successOverlay) {
                    successOverlay.classList.add('show');
                }

                // Reset form
                contactForm.reset();

                // Optionally hide the success message after a few seconds
                setTimeout(() => {
                    if (successOverlay) {
                        successOverlay.classList.remove('show');
                    }
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'all';
                }, 5000);
            } else {
                alert('Oops! The form endpoint rejected the submission. Make sure your Formspree account is active.');
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'all';
            }
        } catch (error) {
            alert('Oops! Network error. Please check your connection and try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'all';
        }
    });
}

// Professional Resume Dashboard Interactions
(function initResumeDashboard() {
    const resumeSection = document.getElementById('resume');
    const identityCard = document.querySelector('.resume-card-identity');
    const dashboardMain = document.querySelector('.resume-dashboard-main');
    
    if (!resumeSection || !identityCard || !dashboardMain) return;

    // Metric Widgets Micro-interaction
    const widgets = document.querySelectorAll('.metric-widget');
    widgets.forEach(widget => {
        widget.addEventListener('mouseenter', () => {
            widget.style.transform = 'translateY(-8px) scale(1.02)';
        });
        widget.addEventListener('mouseleave', () => {
            widget.style.transform = 'translateY(0) scale(1)';
        });
    });
})();
