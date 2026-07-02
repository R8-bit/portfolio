document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    /* =============================================
       КАСТОМНЫЙ КУРСОР
       ============================================= */
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");

    if (window.matchMedia("(pointer: fine)").matches) {
        dot.style.display = "block";
        ring.style.display = "block";

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.08, ease: "none" });
        });

        // Кольцо с задержкой (lerp)
        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.left = ringX + "px";
            ring.style.top = ringY + "px";
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover-эффект на интерактивных элементах
        const hoverTargets = document.querySelectorAll("a, button, .timeline-card, .skill-tag, .social-card, input, textarea");
        hoverTargets.forEach(el => {
            el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
            el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
        });
    }

    /* =============================================
       ПРОГРЕСС СКРОЛЛА
       ============================================= */
    const progressBar = document.getElementById("scrollProgress");

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + "%";
    }

    /* =============================================
       SCROLL-TO-TOP КНОПКА
       ============================================= */
    const scrollTopBtn = document.getElementById("scrollTopBtn");

    function handleScroll() {
        updateScrollProgress();

        // Показать/скрыть кнопку наверх
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add("visible");
        } else {
            scrollTopBtn.classList.remove("visible");
        }

        // Navbar compact при скролле
        const navbar = document.getElementById("navbar");
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Active nav link
        updateActiveNav();
    }

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    /* =============================================
       ACTIVE NAVIGATION LINK
       ============================================= */
    const sections = document.querySelectorAll("section[id], header[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                const id = section.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("data-section") === id) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }

    /* =============================================
       БУРГЕР-МЕНЮ
       ============================================= */
    const burger = document.getElementById("burger");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");
    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
        burger.classList.toggle("open", menuOpen);
        mobileMenu.classList.toggle("open", menuOpen);
        burger.setAttribute("aria-expanded", menuOpen);
        document.body.style.overflow = menuOpen ? "hidden" : "";
    }

    burger.addEventListener("click", toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (menuOpen) toggleMenu();
        });
    });

    // Закрыть по клавише Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuOpen) toggleMenu();
    });


    /* =============================================
       TYPEWRITER ЭФФЕКТ

       ============================================= */
    const typewriterEl = document.getElementById("typewriter");
    const phrases = [
        "Создаю цифровые впечатления",
        "Frontend Developer",
        "Canvas & GSAP Enthusiast",
        "UI/UX Creator"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function typeWriter() {
        const current = phrases[phraseIndex];
        if (isDeleting) {
            typewriterEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 50;
        } else {
            typewriterEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 100;
        }

        if (!isDeleting && charIndex === current.length) {
            isDeleting = true;
            typeDelay = 2000; // пауза перед удалением
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeDelay = 400;
        }

        setTimeout(typeWriter, typeDelay);
    }

    setTimeout(typeWriter, 1200);

    /* =============================================
       HERO АНИМАЦИЯ (ЗАГРУЗКА)
       ============================================= */
    const heroTl = gsap.timeline({ delay: 0.2 });

    heroTl
        .from(".navbar", { y: -80, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(".hero-badge", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .from(".hero-title", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
        .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
        .from(".hero-buttons", {
            y: 20, opacity: 0, duration: 0.5, ease: "power3.out"
        }, "-=0.4")
        .from(".hero-scroll-hint", { opacity: 0, duration: 0.5 }, "-=0.2")
        .from(".avatar-container", {
            x: 60, opacity: 0, duration: 1, ease: "power3.out"
        }, "-=1.2");

    /* =============================================
       SCROLL REVEAL — перенесено в scroll-animations.js
       ============================================= */

    /* =============================================
       COUNT-UP АНИМАЦИЯ (статистика)
       ============================================= */
    const statNumbers = document.querySelectorAll(".stat-number");

    function countUp(el) {
        const targetStr = el.getAttribute("data-target");
        const target = parseInt(targetStr);
        if (isNaN(target)) {
            el.textContent = targetStr.trim();
            return;
        }
        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing: easeOutExpo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.floor(ease * target);
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target;
        }

        requestAnimationFrame(update);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(countUp);
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid) statsObserver.observe(statsGrid);

    /* =============================================
       ФОРМА КОНТАКТОВ
       ============================================= */
    const form = document.getElementById("contactForm");
    const formSuccess = document.getElementById("formSuccess");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll("input, textarea");
            let valid = true;

            inputs.forEach(input => {
                input.classList.remove("error");
                if (!input.value.trim()) {
                    input.classList.add("error");
                    valid = false;
                }
            });

            if (!valid) return;

            const submitBtn = document.getElementById("formSubmit");
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";

            // Симуляция отправки
            setTimeout(() => {
                form.style.display = "none";
                formSuccess.classList.add("visible");
            }, 1000);
        });

        // Снимаем класс ошибки при вводе
        form.querySelectorAll("input, textarea").forEach(input => {
            input.addEventListener("input", () => input.classList.remove("error"));
        });
    }

    /* =============================================
       ГОД В ФУТЕРЕ
       ============================================= */
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* =============================================
       GSAP ПАРАЛЛАКС ШЕЙПОВ В HERO (аватар)
       ============================================= */
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            gsap.to(".avatar-svg", {
                rotateY: x * 0.5,
                rotateX: -y * 0.5,
                duration: 1,
                ease: "power2.out"
            });
        });
    }
});
