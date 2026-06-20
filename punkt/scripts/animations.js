/**
 * Animations.js - Продвинутые анимации (GSAP, ScrollTrigger, Lenis)
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Инициализация Lenis (Плавный скролл)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Установка начальных состояний
  gsap.set(".hero-content h1", { opacity: 1 });
  gsap.set(".feature-item", { opacity: 1 });

  // 2. PAGE TRANSITION (Переход между страницами)
  const pageTransition = gsap.timeline();

// Появление страницы (Intro)
  pageTransition
    .to(".page-transition-logo", {
      opacity: 1,
      y: -20,
      duration: 0.5,
      ease: "power2.out",
    })
    .to(".page-transition-logo", {
      opacity: 0,
      y: -40,
      duration: 0.5,
      delay: 0.2,
      ease: "power2.in",
    })
    .to(".page-transition", {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut",
      onComplete: initHeroAnimations, // Запуск Hero посте транзишена
    });

  // Уход со страницы (Outro)
  document
    .querySelectorAll(".nav-links a, .btn-primary, .btn-details")
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (
          href &&
          !href.startsWith("#") &&
          href !== window.location.pathname.split("/").pop()
        ) {
          e.preventDefault();
          gsap.set(".page-transition", { yPercent: 100 });
          gsap.to(".page-transition", {
            yPercent: 0,
            duration: 0.6,
            ease: "power4.inOut",
            onComplete: () => {
              window.location.href = href;
            },
          });
        }
      });
    });

  // 3. HERO ANIMATIONS
  function initHeroAnimations() {
    const heroTl = gsap.timeline();

    // Анимация параллакса фона (при загрузке он приближается)
    if (document.querySelector(".hero-bg")) {
      heroTl.to(
        ".hero-bg",
        {
          scale: 1,
          duration: 2.5,
          ease: "power3.out",
        },
        0,
      );

      // И параллакс при скролле
      gsap.to(".hero-bg", {
        yPercent: 30, // Фон уезжает медленнее скролла
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (document.querySelector(".hero-content h1")) {
      const h1 = document.querySelector(".hero-content h1");
      const text = h1.innerHTML.split("<br>");
      h1.innerHTML = "";

      text.forEach((line) => {
        if (line.trim() !== "") {
          const spanWrap = document.createElement("span");
          spanWrap.style.display = "block";
          spanWrap.style.overflow = "hidden";

          const spanInner = document.createElement("span");
          spanInner.style.display = "block";
          spanInner.innerHTML = line;
          spanInner.classList.add("hero-line");

          spanWrap.appendChild(spanInner);
          h1.appendChild(spanWrap);
        }
      });

      heroTl.from(
        ".hero-line",
        {
          y: 100,
          opacity: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power4.out",
        },
        0,
      ); // Стартует вместе с фоном
    }
  }

  // 4. IMAGE REVEAL (Шторка) И ПАРАЛЛАКС ИЗОБРАЖЕНИЙ
  const revealWrappers = document.querySelectorAll(
    ".house-slider, .route-map",
  );

  revealWrappers.forEach((wrapper) => {
    // Обертка для шторки, если ее нет
    if (!wrapper.querySelector(".img-reveal-curtain")) {
      wrapper.classList.add("img-reveal-wrapper");
      const curtain = document.createElement("div");
      curtain.classList.add("img-reveal-curtain");
      wrapper.appendChild(curtain);
    }

    const img = wrapper.querySelector("img");
    const curtain = wrapper.querySelector(".img-reveal-curtain");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    // Открытие шторки
    tl.to(curtain, {
      scaleY: 0,
      transformOrigin: "bottom",
      duration: 1,
      ease: "power3.inOut",
    })
      // Масштабирование картинки внутри до нормального размера
      .fromTo(
        img,
        { scale: 1.3 },
        { scale: 1, duration: 1.5, ease: "power3.out" },
        "-=0.8",
      );

    // Параллакс внутри картинки при скролле
    gsap.to(img, {
      yPercent: 15, // легкий сдвиг фото внутри контейнера
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // 5. ПАРАЛЛАКС ЛИСТЬЕВ И ФОНОВ СЕКЦИЙ
  if (document.querySelector(".leaf-top-left")) {
    gsap.to(".leaf-top-left", {
      yPercent: 50,
      rotation: -45,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1, // scrub: 1 дает небольшую задержку (smoothness)
      },
    });
  }

  if (document.querySelector(".leaf-bottom-right")) {
    gsap.to(".leaf-bottom-right", {
      yPercent: -80,
      rotation: 210,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  }

  // Параллакс фона секции слайдера (заменяем background-attachment: fixed)
  if (document.querySelector(".slider-section")) {
    gsap.to(".slider-section", {
      backgroundPosition: "50% 100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".slider-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // 6. STAGGER АНИМАЦИИ
  const fadeUpElements = gsap.utils.toArray(
    ".about-title, .about-text, .section-title, .places-description, .contact-info, .contact-form",
  );

  fadeUpElements.forEach((elem) => {
    gsap.from(elem, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: elem,
        start: "top 85%",
      },
    });
  });

  if (document.querySelector(".features-grid")) {
    gsap.from(".feature-item", {
      y: 80,
      opacity: 0,
      rotationX: -15,
      duration: 1,
      stagger: 0.2, // Появление по очереди
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".features-grid",
        start: "top 75%",
      },
    });
  }

  if (document.querySelector(".house-card")) {
    gsap.utils.toArray(".house-card").forEach((card, i) => {
      gsap.from(card, {
        x: i % 2 === 0 ? -100 : 100, // Четные слева, нечетные справа
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
      });
    });
  }

  // 7. MAGNETIC BUTTONS (Магнитные кнопки)
  const magneticElements = document.querySelectorAll(
    ".btn-primary, .btn-details, .btn-book, .social-links a",
  );

  magneticElements.forEach((elem) => {
    elem.addEventListener("mousemove", (e) => {
      const position = elem.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;

      gsap.to(elem, {
        x: x * 0.4,
        y: y * 0.4,
        duration: 0.5,
        ease: "power2.out",
      });
    });

    elem.addEventListener("mouseleave", () => {
      gsap.to(elem, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.3)",
      });
    });
  });

  // Убираем старые reveal
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.remove("reveal");
    el.style.opacity = 1;
    el.style.transform = "none";
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.querySelector('.nav-links');
  const body = document.body;
  
  if (burger && navLinks) {
    burger.addEventListener('click', function() {
      burger.classList.toggle('active');
      navLinks.classList.toggle('active');
      body.classList.toggle('menu-open');
    });
    
    // Закрываем меню при клике на ссылку
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
      });
    });
    
    // Закрываем меню при клике вне его
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !burger.contains(e.target) && navLinks.classList.contains('active')) {
        burger.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });
  }
});

