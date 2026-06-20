const slides = [
    { image: 'images/тропы.jpg', text: 'Десятки км маршрутов для хайкинга, скандинавской ходьбы или утреннего бега.' },
    { image: 'images/басик.jpg', text: 'Личный горячий бассейн с подогревом 36°С круглые сутки.' },
    { image: 'images/йога.jpg', text: 'Занятия на специальных платформах среди леса -коврики уже ждут вас.' },
    { image: 'images/костер.jpg', text: 'Треск дров в костре, теплый плед и разговоры, которые запомнятся надолго.' },
    { image: 'images/грибы.png', text: 'Грибные места: прямо за домом. Лисички, белые, подосиновики, опята.' },
    { image: 'images/олень.png', text: 'Лесные соседи: белки, лоси, лисы, олени (наблюдаем с безопасного расстояния)' },
    { image: 'images/ягоды.png', text: 'Ягодные поляны: черника, малина, земляника - собирай и ешь.' },
    { image: 'images/рыбалка.png', text: 'Рыбалка 24/7: свои снасти не нужны. Щука, окунь, плотва - уха гарантирована.' }
];

let currentSlide = 0;
let slideInterval;
let isAnimating = false; // Блокировка кликов во время анимации

function updateSlider() {
    if (isAnimating) return;
    isAnimating = true;

    const container = document.querySelector('.slider-image');
    if (!container) return;

    const oldImgs = container.querySelectorAll('img');
    const oldImg = oldImgs[oldImgs.length - 0]; // Берем текущую картинку

    // Если картинка уже нужная - ничего не делаем
    if (oldImg && oldImg.src.includes(slides[currentSlide].image.split('/').pop())) {
        isAnimating = false;
        return;
    }

    // Создаем новую картинку поверх старой
    const newImg = document.createElement('img');
    newImg.src = slides[currentSlide].image;
    newImg.alt = 'Слайд';
    newImg.style.position = 'absolute';
    newImg.style.top = '0';
    newImg.style.left = '0';
    newImg.style.width = '100%';
    newImg.style.height = '100%';
    newImg.style.objectFit = 'cover';
    newImg.style.opacity = '0'; // Скрыто до анимации
    newImg.style.zIndex = '1';

    // Вставляем изображение под возможную шторку (img-reveal-curtain)
    const curtain = container.querySelector('.img-reveal-curtain');
    if (curtain) {
        container.insertBefore(newImg, curtain);
    } else {
        container.appendChild(newImg);
    }

    // GSAP Анимация плавного проявления (Crossfade) + легкий Zoom Out
    const tl = gsap.timeline({
        onComplete: () => {
            // Удаляем старые картинки после завершения анимации новой
            oldImgs.forEach(img => img.remove());
            isAnimating = false;
        }
    });

    tl.to(newImg, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut"
    }, 0)
    .fromTo(newImg, 
        { scale: 1.1 }, 
        { scale: 1, duration: 1.5, ease: "power2.out" }, 
    0);
    
    // Обновление текста слайдера
    document.querySelectorAll('.slider-text').forEach((text, index) => {
        gsap.killTweensOf(text); // Останавливаем конфликтующие анимации
        if (index === currentSlide) {
            text.classList.add('active');
            gsap.fromTo(text, 
                { opacity: 0, y: 15, autoAlpha: 1 }, // autoAlpha включает visibility
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
        } else {
            text.classList.remove('active');
            gsap.to(text, { 
                opacity: 0, 
                duration: 0.3, 
                onComplete: () => gsap.set(text, { autoAlpha: 0 }) // Прячем полностью
            });
        }
    });
    
    // Обновление точек
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    if (isAnimating) return;
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    resetAutoSlide();
}

function goToSlide(index) {
    if (isAnimating || currentSlide === index) return;
    currentSlide = index;
    updateSlider();
    resetAutoSlide();
}

function startAutoSlide() {
    // Автолистание каждые 7 секунд
    slideInterval = setInterval(nextSlide, 7000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// Запускаем таймер при загрузке скрипта
startAutoSlide();

// Плавный скролл
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

// ========== ПОЯВЛЕНИЕ СЛАЙДЕРА ПРИ СКРОЛЛЕ ==========
const sliderSection = document.querySelector('.slider-section');
const sliderImg = document.querySelector('.slider-image');
const sliderContent = document.querySelector('.slider-content');
const sliderDots = document.querySelector('.slider-dots');

// Изначально скрываем элементы слайдера
if (sliderImg) {
    sliderImg.style.opacity = '0';
    sliderImg.style.transform = 'scale(0.9)';
}
if (sliderContent) {
    sliderContent.style.opacity = '0';
    sliderContent.style.transform = 'scale(0.9)';
}
if (sliderDots) {
    sliderDots.style.opacity = '0';
    sliderDots.style.transform = 'scale(0.8)';
}

const sliderObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Сначала фото — просто проявление с места
            if (sliderImg) {
                sliderImg.style.transition = 'all 0.7s ease-out';
                sliderImg.style.opacity = '1';
                sliderImg.style.transform = 'scale(1)';
            }
            
            // Потом текст с задержкой
            setTimeout(() => {
                if (sliderContent) {
                    sliderContent.style.transition = 'all 0.7s ease-out';
                    sliderContent.style.opacity = '1';
                    sliderContent.style.transform = 'scale(1)';
                }
            }, 250);
            
            // Точки последние
            setTimeout(() => {
                if (sliderDots) {
                    sliderDots.style.transition = 'all 0.6s ease-out';
                    sliderDots.style.opacity = '1';
                    sliderDots.style.transform = 'scale(1)';
                }
            }, 500);
            
            sliderObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

if (sliderSection) {
    sliderObserver.observe(sliderSection);
}

