/* =============================================
   BITER — SCROLL ANIMATIONS ENGINE
   ============================================= */

(function () {
    'use strict';

    /* ── 1. Split Text для заголовков ─────── */
    function splitTextToChars(el) {
        const text = el.textContent;
        el.setAttribute('data-text', text); // для glitch
        el.innerHTML = '';
        
        const words = text.split(' ');
        words.forEach((word, wordIdx) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.whiteSpace = 'nowrap';
            wordSpan.style.display = 'inline-block';
            
            word.split('').forEach(char => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                wordSpan.appendChild(span);
            });
            
            el.appendChild(wordSpan);
            
            // Пробел между словами
            if (wordIdx < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'char';
                spaceSpan.textContent = '\u00A0';
                el.appendChild(spaceSpan);
            }
        });
    }

    document.querySelectorAll('.section-title').forEach(el => splitTextToChars(el));

    /* ── 2. IntersectionObserver — reveal ─── */
    const iOpts = { threshold: 0.12, rootMargin: '0px 0px -60px 0px' };

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObs.unobserve(entry.target);
            }
        });
    }, iOpts);

    document.querySelectorAll(
        '.reveal-title, .reveal-left, .reveal-right, .reveal-up,' +
        ' .reveal-card, .reveal-fade, .reveal-scale, .skills-list, .stats-grid'
    ).forEach(el => revealObs.observe(el));

    /* ── 3. Parallax при скролле ─────────── */
    const parallaxEls = [
        { selector: '.avatar-container', speed: 0.12 },
        { selector: '.hero-canvas',      speed: 0.06 },
        { selector: '.bg-blob-1',        speed: 0.18 },
        { selector: '.bg-blob-2',        speed: -0.1 },
    ];

    let ticking = false;

    function applyParallax() {
        const scrollY = window.scrollY;
        parallaxEls.forEach(({ selector, speed }) => {
            const el = document.querySelector(selector);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const inView = rect.bottom > 0 && rect.top < window.innerHeight * 1.5;
            if (inView) {
                el.style.transform = `translateY(${scrollY * speed}px)`;
            }
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(applyParallax);
            ticking = true;
        }
    }, { passive: true });

    /* ── 4. Glitch на hero-title ─────────── */
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.classList.add('glitch');
    }

    /* ── 5. Blob blobs — появление ─────────── */
    function addBlobs() {
        const sections = [
            document.querySelector('.hero'),
            document.querySelector('.about'),
            document.querySelector('.services'),
        ];

        sections.forEach(sec => {
            if (!sec) return;
            const b1 = document.createElement('div');
            b1.className = 'bg-blob bg-blob-1';
            const b2 = document.createElement('div');
            b2.className = 'bg-blob bg-blob-2';
            sec.style.position = 'relative';
            sec.style.overflow = 'hidden';
            sec.appendChild(b1);
            sec.appendChild(b2);
            setTimeout(() => { b1.classList.add('visible'); b2.classList.add('visible'); }, 300);
        });
    }

    /* ── 6. Marquee — бегущая строка ─────── */
    function addMarquee() {
        const projectsSection = document.querySelector('#projects');
        if (!projectsSection) return;

        const items = [
            'HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Canvas API',
            'Node.js', 'HLS.js', 'UI/UX Design', 'Frontend Dev',
            'HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Canvas API',
            'Node.js', 'HLS.js', 'UI/UX Design', 'Frontend Dev',
        ];

        const marquee = document.createElement('div');
        marquee.className = 'marquee-section';

        const track = document.createElement('div');
        track.className = 'marquee-track';

        items.forEach(item => {
            const el = document.createElement('span');
            el.className = 'marquee-item';
            el.innerHTML = `${item}<span class="marquee-dot"></span>`;
            track.appendChild(el);
        });

        marquee.appendChild(track);
        projectsSection.parentNode.insertBefore(marquee, projectsSection);
    }

    /* ── 7. Section dividers ─────────────── */
    function addDividers() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(sec => {
            const div = document.createElement('div');
            div.className = 'section-divider';
            sec.parentNode.insertBefore(div, sec.nextSibling);
        });
    }

    /* ── 8. Mouse parallax на hero ─────────── */
    const hero = document.querySelector('.hero');
    if (hero && window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('mousemove', (e) => {
            const cx = hero.offsetWidth / 2;
            const cy = hero.offsetHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            const badge = hero.querySelector('.hero-badge');
            const content = hero.querySelector('.hero-content');

            if (badge) badge.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;
            if (content) content.style.transform = `translate(${dx * 3}px, ${dy * 2}px)`;
        });

        hero.addEventListener('mouseleave', () => {
            const badge = hero.querySelector('.hero-badge');
            const content = hero.querySelector('.hero-content');
            if (badge) badge.style.transform = '';
            if (content) content.style.transform = '';
        });
    }

    /* ── 9. GSAP расширенные анимации ─────── */
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // About section — текст параллакс
        gsap.fromTo('.about-desc', {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about',
                start: 'top 70%',
                once: true
            }
        });

        // Code card — 3D поворот при появлении
        gsap.fromTo('.code-card', {
            rotateY: -25,
            opacity: 0,
            transformPerspective: 800
        }, {
            rotateY: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.code-card',
                start: 'top 75%',
                once: true
            }
        });

        // Services — stagger с 3D
        gsap.fromTo('.service-card', {
            y: 60,
            opacity: 0,
            rotateX: 10,
            transformPerspective: 600
        }, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 75%',
                once: true
            }
        });

        // Элементы таймлайна — stagger появление снизу
        gsap.fromTo('.timeline-item', {
            y: 60, opacity: 0
        }, {
            y: 0, opacity: 1, duration: 0.9, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.timeline-container', start: 'top 75%', once: true }
        });

        // Contact section
        gsap.fromTo('.contact-info', {
            x: -60, opacity: 0
        }, {
            x: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact', start: 'top 75%', once: true }
        });
        gsap.fromTo('.contact-form-wrapper', {
            x: 60, opacity: 0
        }, {
            x: 0, opacity: 1, duration: 1, delay: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact', start: 'top 75%', once: true }
        });

        // Footer
        gsap.fromTo('.footer', {
            y: 40, opacity: 0
        }, {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: '.footer', start: 'top 90%', once: true }
        });

        // Parallax на blob'ах через ScrollTrigger
        gsap.to('.avatar-container', {
            y: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    }

    /* ── 10. Hover tilt на карточках проектов ── */
    function initTilt() {
        document.querySelectorAll('.timeline-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                card.style.transform = `
                    translateY(-12px) scale(1.02)
                    rotateX(${-dy * 5}deg)
                    rotateY(${dx * 5}deg)
                `;
                card.style.boxShadow = `
                    ${-dx * 20}px ${-dy * 20}px 60px rgba(0,0,0,0.5),
                    0 0 50px rgba(255, 124, 42, 0.12)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });

            card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
        });
    }

    /* ── 11. Service cards — glow при hover── */
    function initServiceGlow() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.background = `
                    radial-gradient(
                        300px circle at ${x}px ${y}px,
                        rgba(255, 124, 42, 0.07),
                        transparent 50%
                    ), var(--bg-card)
                `;
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = '';
            });
        });
    }

    /* ── INIT ─────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        addBlobs();
        addMarquee();
        addDividers();
        initTilt();
        initServiceGlow();
        initGSAP();
        applyParallax();
    });

    if (document.readyState !== 'loading') {
        addBlobs();
        addMarquee();
        addDividers();
        initTilt();
        initServiceGlow();
        initGSAP();
    }
})();
