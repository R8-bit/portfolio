/* ==========================================================================
   SLIDER TOUCH PLUGIN
   Добавь этот файл ПОСЛЕ своего slider.js:
   <script src="scripts/slider.js"></script>
   <script src="scripts/slider-touch.js"></script>
   ========================================================================== */

(function() {
    'use strict';

    // Проверяем, загружен ли основной слайдер
    if (typeof slides === 'undefined') {
        console.warn('Slider Touch Plugin: основной слайдер не найден');
        return;
    }

    // Touch переменные
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;
    let startTime = 0;

    const SWIPE_THRESHOLD = 50;
    const TAP_THRESHOLD = 10;
    const TIME_THRESHOLD = 300;

    // Сохраняем оригинальные функции
    const originalNextSlide = window.nextSlide;
    const originalGoToSlide = window.goToSlide;

    // Функция предыдущего слайда (если нет в оригинале)
    window.prevSlide = function() {
        if (typeof isAnimating !== 'undefined' && isAnimating) return;
        if (typeof currentSlide === 'undefined') return;

        currentSlide = (currentSlide - 1 + slides.length) % slides.length;

        // Вызываем updateSlider если он есть
        if (typeof updateSlider === 'function') {
            updateSlider();
        }

        // Сбрасываем автоплей
        if (typeof resetAutoSlide === 'function') {
            resetAutoSlide();
        }
    };

    // Обработчики touch событий
    function handleTouchStart(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        startTime = new Date().getTime();
        isDragging = true;

        // Пауза автоплея
        if (typeof slideInterval !== 'undefined') {
            clearInterval(slideInterval);
        }
    }

    function handleTouchMove(e) {
        if (!isDragging) return;

        const touch = e.touches[0];
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;

        // Предотвращаем скролл при горизонтальном свайпе
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        const endTime = new Date().getTime();
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const diffTime = endTime - startTime;

        // Только горизонтальные свайпы
        if (Math.abs(diffX) > Math.abs(diffY)) {
            const isQuickSwipe = diffTime < TIME_THRESHOLD && Math.abs(diffX) > TAP_THRESHOLD;
            const isLongSwipe = Math.abs(diffX) > SWIPE_THRESHOLD;

            if (isQuickSwipe || isLongSwipe) {
                if (diffX > 0) {
                    // Вправо - назад
                    window.prevSlide();
                } else {
                    // Влево - вперед
                    if (typeof nextSlide === 'function') {
                        nextSlide();
                    }
                }
            }
        }

        // Возобновляем автоплей
        setTimeout(() => {
            if (typeof startAutoSlide === 'function' && !isDragging) {
                startAutoSlide();
            }
        }, 3000);
    }

    // Инициализация
    function initTouch() {
        const sliderImage = document.querySelector('.slider-image');

        if (!sliderImage) return;

        // Добавляем touch события
        sliderImage.addEventListener('touchstart', handleTouchStart, { passive: false });
        sliderImage.addEventListener('touchmove', handleTouchMove, { passive: false });
        sliderImage.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Отключаем контекстное меню
        sliderImage.addEventListener('contextmenu', (e) => e.preventDefault());

        console.log('Slider Touch Plugin: инициализирован');
    }

    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTouch);
    } else {
        initTouch();
    }

})();