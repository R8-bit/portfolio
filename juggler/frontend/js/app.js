// JUGGLER ONEPAGE - Основной JavaScript

// ========== ПОЛУЧЕНИЕ ДАННЫХ ==========
let videosData = []
let photosData = []
let eventsData = []

// Базовый URL API
const API_URL = 'http://localhost:3000/api'

async function fetchData() {
	try {
		const [videosRes, galleryRes, eventsRes] = await Promise.all([
			fetch(`${API_URL}/videos`),
			fetch(`${API_URL}/gallery`),
			fetch(`${API_URL}/events`),
		])

		if (videosRes.ok) videosData = await videosRes.json()
		if (galleryRes.ok) photosData = await galleryRes.json()
		if (eventsRes.ok) eventsData = await eventsRes.json()

		// Инициализация компонентов после загрузки данных
		initVideoSlider()
		initPhotoCarousel()
		initEvents()
	} catch (error) {
		console.error('Error fetching data:', error)
		showNotification('Ошибка загрузки данных', 'error')
	}
}

// ========== НАСТРОЙКИ ==========
let SLIDE_DURATION_VIDEO = 5000
let SLIDE_DURATION_PHOTO = 5000

async function loadSettings() {
	try {
		const res = await fetch(`${API_URL}/settings`)
		const settings = await res.json()
		SLIDE_DURATION_VIDEO = (settings['video_duration'] || 5) * 1000
		SLIDE_DURATION_PHOTO = (settings['photo_duration'] || 5) * 1000
	} catch (e) {}
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'info') {
	const container =
		document.getElementById('notification-container') ||
		createNotificationContainer()
	const notification = document.createElement('div')
	notification.className = `site-notification ${type}`
	notification.innerHTML = `
        <div class="notification-icon">${type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ'}</div>
        <div class="notification-message">${message}</div>
    `

	container.appendChild(notification)

	// Animate in
	setTimeout(() => notification.classList.add('show'), 10)

	// Remove after 3s
	setTimeout(() => {
		notification.classList.remove('show')
		setTimeout(() => notification.remove(), 300)
	}, 3000)
}

function createNotificationContainer() {
	const container = document.createElement('div')
	container.id = 'notification-container'
	container.className = 'notification-container'
	document.body.appendChild(container)
	return container
}

// ========== НАВИГАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
	fetchData() // Load Videos/Photos/Events
	loadDynamicContent() // Load Contacts/Footer
	loadSettings() // Load Durations
	trackVisit() // Track Site Visit

	const header = document.getElementById('header')
	const navLinks = document.querySelectorAll('.nav-link')
	const menuToggle = document.getElementById('menuToggle')
	const nav = document.querySelector('.nav')

	// Scroll header
	window.addEventListener('scroll', () => {
		if (window.scrollY > 50) {
			header.classList.add('scrolled')
		} else {
			header.classList.remove('scrolled')
		}
	})

	// Smooth scroll & active link
	navLinks.forEach(link => {
		link.addEventListener('click', e => {
			e.preventDefault()
			const targetId = link.getAttribute('href')
			const targetSection = document.querySelector(targetId)

			navLinks.forEach(l => l.classList.remove('active'))
			link.classList.add('active')

			if (targetSection) {
				const offset = 80
				const targetPosition = targetSection.offsetTop - offset
				window.scrollTo({
					top: targetPosition,
					behavior: 'smooth',
				})
			}

			// Close mobile menu
			if (nav.classList.contains('active')) {
				nav.classList.remove('active')
			}
		})
	})

	// Mobile menu toggle
	if (menuToggle) {
		menuToggle.addEventListener('click', () => {
			nav.classList.toggle('active')
			menuToggle.classList.toggle('active')
		})
	}

	// Initialize non-data components
	initModals()
	initScrollToTop()
	initScrollSpy()
})

// ========== ОТСЛЕЖИВАНИЕ СКРОЛЛА ==========
function initScrollSpy() {
	const sections = document.querySelectorAll('section')
	const navLinks = document.querySelectorAll('.nav-link')

	if (sections.length === 0 || navLinks.length === 0) return

	window.addEventListener('scroll', () => {
		let current = ''

		sections.forEach(section => {
			const sectionTop = section.offsetTop
			const sectionHeight = section.clientHeight
			if (scrollY >= sectionTop - 150) {
				// 150px offset for header
				current = section.getAttribute('id')
			}
		})

		navLinks.forEach(link => {
			link.classList.remove('active')
			if (current && link.getAttribute('href').includes(current)) {
				link.classList.add('active')
			}
		})
	})
}

// ========== ВИДЕО КАРУСЕЛЬ ==========
function initVideoSlider() {
	const track = document.getElementById('videoCarouselTrack')
	const controls = document.getElementById('videoControls')
	const subtitle = document.getElementById('videoSubtitle')

	if (!track || !controls) return

	track.innerHTML = ''
	controls.innerHTML = ''

	if (videosData.length === 0) {
		console.warn('Juggler: No videos data to render slider.')
		track.innerHTML =
			'<div style="color:white; padding:20px; text-align:center;">Нет видео</div>'
		if (subtitle) subtitle.textContent = ''
		return
	}

	let currentIndex = 0
	let autoSlideInterval
	// Use global configuration or fallback
	const SLIDE_DURATION =
		typeof SLIDE_DURATION_VIDEO !== 'undefined' ? SLIDE_DURATION_VIDEO : 5000

	// Create Slides
	videosData.forEach(video => {
		const slide = document.createElement('div')
		slide.className = 'video-slide'

		let videoSrc = video.url
		if (!video.url.startsWith('http')) {
			videoSrc = `/${video.url}`
		}

		slide.innerHTML = `
            <video class="video-element" muted loop playsinline poster="${video.preview_url || ''}">
                <source src="${videoSrc}" type="video/mp4">
            </video>
        `

		slide.addEventListener('click', () => openVideoModal(video))
		track.appendChild(slide)
	})

	// Create Indicators
	videosData.forEach((_, index) => {
		const indicator = document.createElement('div')
		indicator.className = 'video-indicator'
		indicator.innerHTML = '<div class="video-progress"></div>'
		indicator.addEventListener('click', () => goToSlide(index))
		controls.appendChild(indicator)
	})

	function updateSlide() {
		track.style.transform = `translateX(-${currentIndex * 100}%)`

		// Update Subtitle (Description above)
		if (subtitle && videosData[currentIndex]) {
			const vid = videosData[currentIndex]
			subtitle.innerHTML = `<span style="display:block; font-size: 1.5em; font-weight: bold; color: var(--accent-red); margin-bottom: 5px;">${vid.title}</span><span style="color: var(--text-gray); font-size: 1rem;">${vid.description || ''}</span>`
			subtitle.style.minHeight = '60px'
		}

		// Update indicators
		Array.from(controls.children).forEach((ind, i) => {
			ind.classList.toggle('active', i === currentIndex)
		})

		// Play current video preview, pause others
		const slides = track.children
		Array.from(slides).forEach((slide, i) => {
			const vid = slide.querySelector('video')
			if (vid) {
				if (i === currentIndex) {
					vid.currentTime = 0
					vid.play().catch(() => {})
				} else {
					vid.pause()
				}
			}
		})
	}

	function goToSlide(index) {
		currentIndex = index
		updateSlide()
		resetTimer()
	}

	function nextSlide() {
		currentIndex = (currentIndex + 1) % videosData.length
		updateSlide()
	}

	function resetTimer() {
		clearInterval(autoSlideInterval)
		autoSlideInterval = setInterval(nextSlide, SLIDE_DURATION)
	}

	// Initialize
	updateSlide()
	resetTimer()

	// Arrows Logic
	const nextBtn = document.getElementById('videoNextBtn')
	const prevBtn = document.getElementById('videoPrevBtn')

	// Use onclick to avoid multiple listener issues if function called multiple times
	if (nextBtn) {
		nextBtn.onclick = () => {
			nextSlide()
			resetTimer()
		}
	}

	if (prevBtn) {
		prevBtn.onclick = () => {
			currentIndex = (currentIndex - 1 + videosData.length) % videosData.length
			updateSlide()
			resetTimer()
		}
	}

	// Pause on hover
	const container = document.querySelector('.video-carousel')
	if (container) {
		container.addEventListener('mouseenter', () =>
			clearInterval(autoSlideInterval),
		)
		container.addEventListener('mouseleave', resetTimer)
	}
}

// ========== ФОТО КАРУСЕЛЬ ==========
function initPhotoCarousel() {
	const track = document.getElementById('photoCarouselTrack')
	const indicators = document.getElementById('carouselIndicators')
	const subtitle = document.getElementById('photoSubtitle')

	if (!track) return

	track.innerHTML = ''
	indicators.innerHTML = ''

	if (photosData.length === 0) {
		track.innerHTML = '' // Очищаем контейнер, если пусто
		if (subtitle) subtitle.textContent = ''
		return
	}

	let currentIndex = 0
	let autoPlayInterval
	let isPlaying = true // Keep simple auto-play

	// Generate slides
	photosData.forEach((photo, index) => {
		const slide = document.createElement('div')
		slide.className = 'photo-slide'
		slide.style.overflow = 'hidden' // Ensure crop is contained

		slide.innerHTML = ''

		if (photo.image_url) {
			slide.innerHTML = getCroppedImgHtml(photo.image_url, photo.crop_data)
		} else {
			slide.style.background =
				photo.background_gradient ||
				'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
		}

		track.appendChild(slide)

		// Generate indicators
		const indicator = document.createElement('div')
		indicator.className = 'carousel-indicator' + (index === 0 ? ' active' : '')
		indicator.addEventListener('click', () => goToSlide(index))
		indicators.appendChild(indicator)
	})

	function goToSlide(index) {
		currentIndex = index
		updateCarousel()
		resetAutoPlay()
	}

	function updateCarousel() {
		track.style.transform = `translateX(-${currentIndex * 100}%)`

		const allIndicators = indicators.children
		Array.from(allIndicators).forEach((ind, i) => {
			ind.classList.toggle('active', i === currentIndex)
		})

		// Update Subtitle
		if (subtitle && photosData[currentIndex]) {
			const photo = photosData[currentIndex]
			subtitle.innerHTML = `<strong>${photo.title}</strong><br>${photo.description || ''}`
			subtitle.style.minHeight = '60px'
		}
	}

	function nextSlide() {
		currentIndex = (currentIndex + 1) % photosData.length
		updateCarousel()
	}

	function resetAutoPlay() {
		clearInterval(autoPlayInterval)
		autoPlayInterval = setInterval(nextSlide, SLIDE_DURATION_PHOTO)
	}

	// Auto Slide
	resetAutoPlay()

	const photoContainer = document.querySelector('.photo-carousel')
	if (photoContainer) {
		photoContainer.addEventListener('mouseenter', () =>
			clearInterval(autoPlayInterval),
		)
		photoContainer.addEventListener('mouseleave', resetAutoPlay)
	}

	// Arrows
	const photoNext = document.getElementById('photoNextBtn')
	const photoPrev = document.getElementById('photoPrevBtn')

	if (photoNext) {
		photoNext.onclick = () => {
			nextSlide()
			resetAutoPlay()
		}
	}

	if (photoPrev) {
		photoPrev.onclick = () => {
			currentIndex = (currentIndex - 1 + photosData.length) % photosData.length
			updateCarousel()
			resetAutoPlay()
		}
	}

	// Explicitly start
	resetAutoPlay()
}

// ========== ДИНАМИЧЕСКИЙ КОНТЕНТ (Контакты, Футер, Статистика) ==========
async function trackVisit() {
	try {
		await fetch(`${API_URL}/stats/visit`, { method: 'POST' })
	} catch (e) {
		console.error('Failed to track visit', e)
	}
}

async function loadDynamicContent() {
	try {
		const [contacts, footerLinks] = await Promise.all([
			fetch(`${API_URL}/contacts`).then(res => res.json()),
			fetch(`${API_URL}/footer`).then(res => res.json()),
		])

		// Render Contacts
		const contactCards = document.querySelectorAll('.contact-card')
		if (contactCards.length >= 3) {
			// Email (Card 0)
			const email = contacts.find(c => c.type === 'email')
			if (email) {
				const link = contactCards[0].querySelector('a')
				if (link) {
					link.href = `mailto:${email.value}`
					link.textContent = email.value
				}
			}

			// Phone (Card 1)
			const phone = contacts.find(c => c.type === 'phone')
			if (phone) {
				const link = contactCards[1].querySelector('a')
				if (link) {
					link.href = `tel:${phone.value.replace(/[^\d+]/g, '')}`
					link.textContent = phone.value
				}
			}

			// Address (Card 2)
			const address = contacts.find(c => c.type === 'address')
			if (address) {
				const p = contactCards[2].querySelector('p')
				if (p) p.innerHTML = address.value.replace(/\n/g, '<br>')
			}
		}

		// Render Footer (Second Column "Information")
		const footerLists = document.querySelectorAll('.footer-links ul')
		if (footerLists.length >= 2 && footerLinks.length > 0) {
			// Sort by order just in case
			footerLinks.sort((a, b) => (a.order || 0) - (b.order || 0))

			footerLists[1].innerHTML = footerLinks
				.map(link => `<li><a href="${link.url}">${link.text}</a></li>`)
				.join('')
		}
	} catch (e) {
		console.error('Error loading dynamic content', e)
	}
}
function initEvents() {
	const grid = document.getElementById('eventsGrid')
	const filterBtns = document.querySelectorAll('.filter-btn')

	if (!grid) return

	let currentFilter = 'all'

	function renderEvents(filter = 'all') {
		grid.innerHTML = ''
		if (eventsData.length === 0) {
			grid.innerHTML = '<div class="no-data">Мероприятий пока нет</div>'
			return
		}

		// Logic for filtering
		const filtered =
			filter === 'all'
				? eventsData
				: eventsData.filter(e => {
						const cat = (e.category || '').toLowerCase()
						if (filter === 'concert') return cat.includes('концерт')
						if (filter === 'theater') return cat.includes('театр')
						if (filter === 'exhibition') return cat.includes('выставк')
						if (filter === 'festival') return cat.includes('фестивал')
						return true
					})

		filtered.forEach(event => {
			const card = document.createElement('div')
			card.className = 'event-card'

			// Image handling - use robust crop
			let imageHtml = ''
			if (event.image_url) {
				imageHtml = `<div class="event-image" style="padding:0; overflow:hidden;">${getCroppedImgHtml(event.image_url, event.crop_data)}<div class="event-tag">${event.title}</div></div>`
			} else {
				imageHtml = `<div class="event-image" style="background: ${event.gradient || 'var(--gradient-1)'}"><div class="event-tag">${event.title}</div></div>`
			}

			card.innerHTML = `
                ${imageHtml}
                <div class="event-content">
                    <div class="event-date">${new Date(event.date).toLocaleDateString()}</div>
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-details">
                        <div class="event-detail">📍 ${event.location || 'TBA'}</div>
                        <div class="event-detail">🕐 ${event.time || ''}</div>
                    </div>
                    <p class="event-description">${event.description || ''}</p>
                </div>
            `
			card.addEventListener('click', () => openEventModal(event))
			grid.appendChild(card)
		})
	}

	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			filterBtns.forEach(b => b.classList.remove('active'))
			btn.classList.add('active')
			const filter = btn.dataset.filter
			renderEvents(filter)
		})
	})

	renderEvents()
}

// Helper for robust crop rendering
function getCroppedImgHtml(url, cropData) {
	if (!url) return ''
	const src = url.startsWith('http') ? url : `/${url}`

	let imgStyle = 'width: 100%; height: 100%; object-fit: cover;'
	let wrapperStyle =
		'width: 100%; height: 100%; overflow: hidden; position: relative;'

	if (cropData) {
		try {
			const c = JSON.parse(cropData)
			if (c.naturalWidth && c.naturalHeight && c.width > 0 && c.height > 0) {
				const widthPct = (c.naturalWidth / c.width) * 100
				const heightPct = (c.naturalHeight / c.height) * 100
				const xPct = (c.x / c.naturalWidth) * 100
				const yPct = (c.y / c.naturalHeight) * 100

				imgStyle = `
					width: ${widthPct}%; 
					height: ${heightPct}%; 
					max-width: none;
					position: absolute;
					top: 0; left: 0;
					transform: translate(-${xPct}%, -${yPct}%);
					transform-origin: 0 0;
					object-fit: fill;
				`
			}
		} catch (e) {}
	}

	return `<div style="${wrapperStyle}"><img src="${src}" style="${imgStyle}"></div>`
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function initModals() {
	const videoModal = document.getElementById('videoModal')
	const eventModal = document.getElementById('eventModal')
	const closeVideoBtn = document.getElementById('closeVideoModal')
	const closeEventBtn = document.getElementById('closeEventModal')

	if (closeVideoBtn)
		closeVideoBtn.addEventListener('click', () => closeModal(videoModal))
	if (closeEventBtn)
		closeEventBtn.addEventListener('click', () => closeModal(eventModal))
	;[videoModal, eventModal].forEach(modal => {
		if (!modal) return
		modal.addEventListener('click', e => {
			if (e.target === modal) closeModal(modal)
		})
	})

	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			closeModal(videoModal)
			closeModal(eventModal)
		}
	})
}

function openVideoModal(video) {
	const modal = document.getElementById('videoModal')
	const videoEl = document.getElementById('modalVideo')
	const title = document.getElementById('videoTitle')
	const desc = document.getElementById('videoDesc')

	if (!modal) return

	videoEl.src = video.url.startsWith('http') ? video.url : `/${video.url}`
	title.textContent = video.title
	desc.textContent = video.description || ''

	modal.classList.add('active')
	document.body.style.overflow = 'hidden'
	videoEl.play().catch(() => {})
}

function openEventModal(event) {
	const modal = document.getElementById('eventModal')
	if (!modal) return

	// Update contents...
	// Note: DB model might not have ALL these fields (like gradient, fullDescription vs description).
	// Mapping what we have.

	const bgDiv = document.getElementById('modalBg')
	if (event.image_url) {
		const url = event.image_url.startsWith('http')
			? event.image_url
			: `/${event.image_url}`
		bgDiv.style.backgroundImage = `url('${url}')`
		bgDiv.style.backgroundSize = 'cover'
		bgDiv.className = 'modal-header-bg'
	} else {
		bgDiv.className = `modal-header-bg`
		bgDiv.style.background = 'var(--gradient-1)' // Fallback
	}

	document.getElementById('modalTag').textContent = event.category || 'Событие'
	document.getElementById('modalDate').textContent = new Date(
		event.date,
	).toLocaleDateString()
	document.getElementById('modalTitle').textContent = event.title
	document.getElementById('modalLocation').textContent = event.location || 'TBA'
	document.getElementById('modalTime').textContent = event.time || ''
	document.getElementById('modalDuration').textContent = event.duration || ''

	document.getElementById('modalFullDescription').textContent =
		event.description || ''

	// Bind new fields from DB
	document.getElementById('modalAge').textContent = event.age_restriction || ''
	document.getElementById('modalGenre').textContent = event.genre || ''
	document.getElementById('modalCapacity').textContent = event.capacity || ''
	document.getElementById('modalArtists').textContent = event.participants || ''

	document.getElementById('modalPrice').textContent =
		event.price || 'Цена не определена'

	// Ticket Button Logic
	const buyBtn = document.getElementById('buyTicketBtn')
	if (buyBtn) {
		// Remove old listeners by cloning or just setting onclick (simpler)
		buyBtn.onclick = () => {
			if (event.ticket_url && event.ticket_url.startsWith('http')) {
				window.open(event.ticket_url, '_blank')
			} else {
				showNotification('Продажа еще не открыта!', 'info')
			}
		}
	}

	modal.classList.add('active')
	document.body.style.overflow = 'hidden'
}

function closeModal(modal) {
	if (!modal) return
	modal.classList.remove('active')
	document.body.style.overflow = ''

	const video = modal.querySelector('video')
	if (video) {
		video.pause()
		video.src = ''
	}
}

// ========== SCROLL TO TOP ==========
function initScrollToTop() {
	const btn = document.getElementById('scrollToTop')
	if (!btn) return

	window.addEventListener('scroll', () => {
		if (window.scrollY > 300) {
			btn.classList.add('visible')
		} else {
			btn.classList.remove('visible')
		}
	})

	btn.addEventListener('click', () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		})
	})
}
