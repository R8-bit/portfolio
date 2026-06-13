// Анимация "Складывания" Текста (Split Reveal) для секции About
const aboutSection = document.querySelector('.about')
const text1 = document.getElementById('aboutText1')
const text2 = document.getElementById('aboutText2')

// Функция для подготовки текста: разбивает на слова и оборачивает в две части
function prepareText(element) {
	if (!element) return

	// Проверяем, уже ли разбит текст, чтобы не зациклить
	if (element.querySelector('.split-part')) return

	const text = element.innerText.trim()
	if (!text) return // Если текста нет, нечего разбивать (например, до загрузки перевода)

	const words = text.split(' ')
	if (words.length === 0) return

	const half = Math.ceil(words.length / 2)

	const leftWords = words.slice(0, half).join(' ')
	const rightWords = words.slice(half).join(' ')

	element.innerHTML = `
        <span class="split-part left">${leftWords}</span>
        <span class="split-part right">&nbsp;${rightWords}</span>
    `
	// Сброс базовых стилей, которые могли мешать
	element.style.opacity = '1'
	element.style.transform = 'translate(-50%, -50%)' // Центрирование
	element.style.filter = 'none'
	element.style.display = 'none' // Скрыт по умолчанию
	element.style.width = '100%'
	element.style.textAlign = 'center'
	element.style.whiteSpace = 'normal'
}

function observeTextChanges(element) {
	if (!element) return
	const observer = new MutationObserver(mutations => {
		for (const mutation of mutations) {
			// Проверяем, что изменение не вызвано самой функцией prepareText
			// (т.е. элемент еще не содержит .split-part)
			// или если это изменение characterData в текстовом узле, который не является частью .split-part
			if (mutation.type === 'childList' || mutation.type === 'characterData') {
				if (!element.querySelector('.split-part')) {
					prepareText(element)
				}
			}
		}
	})
	// Наблюдаем за изменениями дочерних элементов, поддерева и текстовых данных
	observer.observe(element, {
		childList: true,
		subtree: true,
		characterData: true,
	})
}

if (aboutSection && text1) {
	prepareText(text1)
	observeTextChanges(text1)

	window.addEventListener('scroll', () => {
		const rect = aboutSection.getBoundingClientRect()
		const windowHeight = window.innerHeight

		// Прогресс прохождения секции
		const totalDist = windowHeight + rect.height
		const scrolledDist = windowHeight - rect.top
		let progress = scrolledDist / totalDist
		progress = Math.max(0, Math.min(1, progress))

		// Показываем текст, когда секция немного прокручена
		if (progress > 0.35 && progress < 0.85) {
			text1.style.display = 'block'
			requestAnimationFrame(() => {
				text1.classList.add('visible')
			})
		} else {
			text1.classList.remove('visible')
			// Не скрываем display:none сразу, чтобы анимация исчезновения проигралась (если есть transition opacity)
			// Но у нас вылет за экран.
			// Если уберем visible, он улетит обратно.
		}
	})

	// Инициализация
	window.dispatchEvent(new Event('scroll'))
}
