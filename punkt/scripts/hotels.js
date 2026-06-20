const houseSliders = {
    1: { current: 0, total: 3 },
    2: { current: 0, total: 3 },
    3: { current: 0, total: 3 },
    4: { current: 0, total: 3 }
};

function updateSlider(houseId) {
    const slider = document.querySelector(`[data-house="${houseId}"]`);
    const slides = slider.querySelectorAll('img');
    const dots = slider.querySelectorAll('.dot');
    const current = houseSliders[houseId].current;

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === current);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
    });
}

function changeSlide(houseId, direction) {
    const slider = houseSliders[houseId];
    slider.current = (slider.current + direction + slider.total) % slider.total;
    updateSlider(houseId);
}

function goToSlide(houseId, index) {
    houseSliders[houseId].current = index;
    updateSlider(houseId);
}

//окно

function openModal(houseName) {
    document.getElementById('modalHouseName').textContent = houseName;
    document.getElementById('bookingModal').classList.add('active');
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

function submitBooking() {
    alert('Бронирование оформлено!');
    closeModal();
}

document.getElementById('bookingModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Плавный скролл
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });