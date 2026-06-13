// Main JavaScript для JUGGLER
// Управление навигацией, социальными ссылками, анимациями

// Основной JavaScript для сайта JUGGLER
const API_URL = 'http://localhost:3000/api'

// Функция инициализации i18n
async function initI18n() {
	if (typeof i18n !== 'undefined') {
		await i18n.loadTranslations()
	} else {
		console.error('i18n object is not defined')
	}
}

// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
	// Initial run
	animateTitles()
})

window.addEventListener('i18nUpdated', () => {
	// Reset processed status to re-animate if text changes
	document.querySelectorAll('.page-title, .section-title').forEach(el => {
		el.classList.remove('processed')
		// Restore original text or handle re-render?
		// i18n usually replaces textContent. So we just need to re-run.
		// But i18n might wipe our spans. Yes.
	})
	animateTitles()
})

function animateTitles() {
	// Select all titles that need animation (Page titles, Section titles, Hero Subtitle)
	const titles = document.querySelectorAll(
		'.page-title, .section-title, .hero-subtitle',
	)

	titles.forEach(title => {
		// Check if already processed
		if (title.classList.contains('processed')) return

		const text = title.textContent.trim()
		if (!text) return

		// Clear content
		title.textContent = ''

		// Split into words to check for spaces and wrapping
		// Using split(' ') preserves single spaces.
		// If we want to handle multiple spaces as one, we could use split(/\s+/)
		const words = text.split(/\s+/)
		const totalChars = text.length
		let visibleCharIndex = 0

		words.forEach((wordText, wordIndex) => {
			const wordSpan = document.createElement('span')
			wordSpan.classList.add('word')
			wordSpan.style.display = 'inline-block'
			wordSpan.style.whiteSpace = 'nowrap'
			// Add a small margin to ensure separation if spaces collapse,
			// though the text node space below should handle it.

			const letters = wordText.split('')

			letters.forEach((char, charIndex) => {
				const span = document.createElement('span')
				span.textContent = char
				span.classList.add('letter')

				// Add rabbit to the last letter of the last word
				const isLastWord = wordIndex === words.length - 1
				const isLastChar = charIndex === letters.length - 1
				const isAboutSection = title.closest('#about')

				if (isLastWord && isLastChar && !isAboutSection) {
					span.classList.add('rabbit-decoration')
				}

				// Animation delay
				// Calculate index relative to total length for consistent direction
				// We use visibleCharIndex to track "letters so far"
				const delay = (totalChars - visibleCharIndex) * 0.1
				span.style.animationDelay = `${delay}s`

				wordSpan.appendChild(span)
				visibleCharIndex++
			})

			title.appendChild(wordSpan)

			// Add space after word if not the last one
			if (wordIndex < words.length - 1) {
				const space = document.createTextNode(' ')
				title.appendChild(space)
				visibleCharIndex++ // Count space in delay loop (optional, but keeps rhythm)
			}
		})

		title.classList.add('processed')

		// Add observer to trigger animation when in view
		// We'll add a class 'animate-in' when visible
		observeTitle(title)
	})
}

function observeTitle(title) {
	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible')
					observer.unobserve(entry.target)
				}
			})
		},
		{ threshold: 0.5 },
	)

	observer.observe(title)
}

document.addEventListener('DOMContentLoaded', async () => {
	// Инициализация компонентов
	await initI18n()
	initNavigation()
	initMobileMenu() // Инициализация бургер-меню
	initScrollAnimations()
	await loadSocialLinks()
	await loadTicketLink()
	trackVisit()
})

function initNavigation() {
	const header = document.getElementById('header')
	const navLinks = document.querySelectorAll('.nav-link')

	// Highlight active page
	const currentPage = window.location.pathname.split('/').pop() || 'index.html'
	navLinks.forEach(link => {
		const linkPage = link.getAttribute('href')
		if (linkPage === currentPage) {
			link.classList.add('active')
		}
	})

	// Header scroll effect
	if (header) {
		window.addEventListener('scroll', () => {
			if (window.scrollY > 100) {
				header.classList.add('scrolled')
			} else {
				header.classList.remove('scrolled')
			}
		})
	}

	// Smooth scroll для якорных ссылок
	navLinks.forEach(link => {
		link.addEventListener('click', e => {
			const href = link.getAttribute('href')

			// Только для якорей на текущей странице
			if (href.startsWith('#')) {
				e.preventDefault()
				const targetId = href
				const targetSection = document.querySelector(targetId)

				if (targetSection) {
					const offset = 80
					const targetPosition = targetSection.offsetTop - offset
					window.scrollTo({
						top: targetPosition,
						behavior: 'smooth',
					})
				}

				// Закрыть мобильное меню
				// closeMobileMenu() // This function is now handled by initMobileMenu
			}
		})
	})

	// Language switcher
	const langSwitcher = document.getElementById('langSwitcher')
	if (langSwitcher) {
		langSwitcher.addEventListener('click', () => {
			const currentLang = i18n.getCurrentLanguage()
			const newLang = currentLang === 'ru' ? 'en' : 'ru'
			i18n.switchLanguage(newLang)
		})
	}

	// Scroll arrow (Home page)
	const scrollArrow = document.querySelector('.scroll-arrow')
	if (scrollArrow) {
		scrollArrow.addEventListener('click', e => {
			e.preventDefault()
			const aboutSection = document.querySelector('#about')
			if (aboutSection) {
				aboutSection.scrollIntoView({ behavior: 'smooth' })
			}
		})
	}

	// Scroll Down Button (Video/Gallery pages)
	const scrollDownBtn = document.getElementById('scrollDownBtn')
	if (scrollDownBtn) {
		scrollDownBtn.addEventListener('click', () => {
			const galleryStart = document.getElementById('galleryStart')
			const nextSection =
				galleryStart || document.querySelector('section:nth-of-type(1)') // Fallback
			if (nextSection) {
				nextSection.scrollIntoView({ behavior: 'smooth' })
			}
		})
	}
}

let mobileMenuInitialized = false // Флаг инициализации

function initMobileMenu() {
	if (mobileMenuInitialized) {
		return
	}

	const menuToggle = document.getElementById('menuToggle')
	const mainNav = document.getElementById('mainNav')

	if (!menuToggle) {
		return
	}

	// Создаём overlay если его нет
	let overlay = document.querySelector('.nav-overlay')
	if (!overlay) {
		overlay = document.createElement('div')
		overlay.className = 'nav-overlay'
		document.body.appendChild(overlay)
	}

	function toggleMenu() {
		menuToggle?.classList.toggle('active')
		mainNav?.classList.toggle('active')
		overlay.classList.toggle('active')

		document.body.style.overflow = mainNav?.classList.contains('active')
			? 'hidden'
			: ''
	}

	// Добавляем обработчик только один раз
	menuToggle.addEventListener(
		'click',
		e => {
			e.preventDefault()
			e.stopPropagation()
			toggleMenu()
		},
		{ once: false },
	)

	overlay.addEventListener('click', toggleMenu)

	// Закрытие меню при клике на ссылку
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', () => {
			if (window.innerWidth <= 1024 && mainNav?.classList.contains('active')) {
				toggleMenu()
			}
		})
	})

	mobileMenuInitialized = true
}

// ========== АНИМАЦИИ ПРИ СКРОЛЛЕ ==========
function initScrollAnimations() {
	// Animated title на главной странице
	const animatedTitle = document.getElementById('animatedTitle')
	if (animatedTitle) {
		// Запустить анимацию через небольшую задержку после загрузки
		setTimeout(() => {
			animatedTitle.classList.add('animate')
		}, 500)
	}

	// Анимация About секции перенесена в about-animation.js

	// Scroll reveal для других элементов
	const observerOptions = {
		threshold: 0.3,
		rootMargin: '0px 0px -100px 0px',
	}

	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('revealed')
			}
		})
	}, observerOptions)

	// Наблюдать за элементами с классом scroll-reveal
	document.querySelectorAll('.scroll-reveal:not(.about-text)').forEach(el => {
		observer.observe(el)
	})
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

// ========== ГЕНЕРАЦИЯ SVG ИКОНОК ==========
function getSocialIcon(name) {
	const iconName = name.toLowerCase()
	const icons = {
		instagram: `
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
						<stop offset="0%" style="stop-color:#f09433;stop-opacity:1" />
						<stop offset="25%" style="stop-color:#e6683c;stop-opacity:1" />
						<stop offset="50%" style="stop-color:#dc2743;stop-opacity:1" />
						<stop offset="75%" style="stop-color:#cc2366;stop-opacity:1" />
						<stop offset="100%" style="stop-color:#bc1888;stop-opacity:1" />
					</linearGradient>
				</defs>
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="url(#instagramGradient)"/>
			</svg>
		`,
		youtube: `
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
			</svg>
		`,
		telegram: `
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="#0088cc"/>
			</svg>
		`,
		x: `
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#ffffff"/>
			</svg>
		`,
		threads: `
			<svg width="24" height="24" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" fill="#ffffff"/>
			</svg>
		`,
		twitter: `
			<svg width="24" height="24" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" fill="#ffffff"/>
			</svg>
		`,
	}

	return icons[iconName] || icons.x
}

// ========== ЗАГРУЗКА СОЦИАЛЬНЫХ ССЫЛОК ==========
async function loadSocialLinks() {
	try {
		const response = await fetch(`${API_URL}/social-links`)
		const links = await response.json()

		const container = document.getElementById('socialLinks')
		if (!container) return

		container.innerHTML = ''

		// Сортировать по order
		links.sort((a, b) => a.order - b.order)

		links.forEach(link => {
			if (link.isActive) {
				const a = document.createElement('a')
				a.href = link.url
				a.target = '_blank'
				a.rel = 'noopener noreferrer'
				a.title = link.name
				a.setAttribute('aria-label', link.name)

				// Использовать встроенную SVG иконку
				a.innerHTML = getSocialIcon(link.name)

				container.appendChild(a)
			}
		})
	} catch (error) {
		console.error('Ошибка загрузки социальных ссылок:', error)
	}
}

// ========== ЗАГРУЗКА ССЫЛКИ НА БИЛЕТЫ ==========
async function loadTicketLink() {
	try {
		const response = await fetch(`${API_URL}/ticket-link`)
		const data = await response.json()

		const ticketsLink = document.getElementById('ticketsLink')
		if (ticketsLink && data.url) {
			ticketsLink.href = data.url
			ticketsLink.target = '_blank'
			if (data.label) {
				ticketsLink.textContent = data.label
			}
		}
	} catch (error) {
		console.error('Ошибка загрузки ссылки на билеты:', error)
	}
}

// ========== ОТСЛЕЖИВАНИЕ ПОСЕЩЕНИЙ ==========
async function trackVisit() {
	try {
		await fetch(`${API_URL}/stats/visit`, { method: 'POST' })
	} catch (error) {
		console.error('Ошибка отслеживания посещения:', error)
	}
}
