// JavaScript для страницы контактов
// API_URL определен в main.js

document.addEventListener('DOMContentLoaded', () => {
	initContactForm()
	loadBackgroundVideo()
})

// Инициализация формы контактов
function initContactForm() {
	const form = document.getElementById('contactForm')
	if (!form) return

	form.addEventListener('submit', async e => {
		e.preventDefault()
		console.log('Form submit triggered!')

		const submitBtn = document.getElementById('submitBtn')
		const formMessage = document.getElementById('formMessage')

		// Валидация
		if (!validateForm()) {
			console.log('Validation failed')
			showMessage(
				'error',
				i18n?.t('contact.form.validationError') ||
					'Пожалуйста, заполните все поля корректно',
			)
			return
		}

		console.log('Validation passed')

		// Подготовка данных
		const formData = {
			firstName: form.firstName.value.trim(),
			lastName: form.lastName.value.trim(),
			phone: form.countryCode.value + form.phone.value.trim(),
			email: form.email.value.trim(),
			subject: form.subject.value.trim(),
		}

		console.log('Form data:', formData)
		console.log('Sending to:', `${API_URL}/contact`)

		// Отправка
		try {
			submitBtn.disabled = true
			submitBtn.innerHTML = `<span data-i18n="contact.form.sending">Отправка...</span>`

			const response = await fetch(`${API_URL}/contact`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			console.log('Response status:', response.status)
			const responseData = await response.json()
			console.log('Response data:', responseData)

			if (response.ok) {
				showMessage(
					'success',
					i18n?.t('contact.form.success') || 'Сообщение отправлено!',
				)
				form.reset()
			} else {
				showMessage(
					'error',
					responseData.error ||
						i18n?.t('contact.form.error') ||
						'Ошибка отправки',
				)
			}
		} catch (error) {
			console.error('Ошибка отправки формы:', error)
			showMessage(
				'error',
				i18n?.t('contact.form.error') || 'Ошибка отправки. Попробуйте позже.',
			)
		} finally {
			submitBtn.disabled = false
			submitBtn.innerHTML = `<span data-i18n="contact.form.submit">Отправить</span>`
			if (typeof i18n !== 'undefined') {
				i18n.updatePage()
			}
		}
	})
}

// Валидация формы
function validateForm() {
	const form = document.getElementById('contactForm')
	if (!form) return false

	// Проверка обязательных полей
	const firstName = form.firstName.value.trim()
	const lastName = form.lastName.value.trim()
	const phone = form.phone.value.trim()
	const email = form.email.value.trim()
	const subject = form.subject.value.trim()

	if (!firstName || !lastName || !phone || !email || !subject) {
		return false
	}

	// Строгая проверка email
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	if (!emailRegex.test(email)) {
		showMessage('error', 'Пожалуйста, введите корректный email адрес')
		return false
	}

	// Проверка телефона (минимум 10 цифр)
	const phoneDigits = phone.replace(/\D/g, '')
	if (phoneDigits.length < 10) {
		showMessage('error', 'Пожалуйста, введите корректный номер телефона')
		return false
	}

	return true
}

// Показать сообщение
function showMessage(type, message) {
	const formMessage = document.getElementById('formMessage')
	if (!formMessage) return

	formMessage.className = `form-message ${type}`
	formMessage.textContent = message
	formMessage.style.display = 'block'

	// Скрыть через 5 секунд
	setTimeout(() => {
		formMessage.style.display = 'none'
	}, 5000)
}

// Загрузка фонового видео
async function loadBackgroundVideo() {
	const bgVideo = document.getElementById('bgVideo')
	if (!bgVideo) return

	try {
		const response = await fetch(`${API_URL}/videos`)
		const videos = await response.json()

		if (videos.length > 0) {
			const videoUrl = videos[0].url.startsWith('http')
				? videos[0].url
				: `/${videos[0].url}`

			bgVideo.src = videoUrl
			bgVideo.play().catch(() => {})
		}
	} catch (error) {
		console.error('Ошибка загрузки фонового видео:', error)
	}
}

// Форматирование ввода телефона (опционально)
document.addEventListener('DOMContentLoaded', () => {
	const phoneInput = document.getElementById('phone')
	if (phoneInput) {
		phoneInput.addEventListener('input', e => {
			// Разрешаем только цифры, пробелы и дефисы
			e.target.value = e.target.value.replace(/[^\d\s-]/g, '')
		})
	}
})
