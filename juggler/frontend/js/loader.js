// Loader JavaScript для JUGGLER
// Отображает анимированный спиннер с надписью "JUGGLER" при загрузке страниц

class PageLoader {
	constructor() {
		this.loader = null
		this.init()
	}

	init() {
		// Создаем элемент загрузчика
		this.createLoader()
		// Показываем при загрузке страницы
		this.show()
		// Скрываем после загрузки
		window.addEventListener('load', () => {
			// Минимальное время показа - 1 секунда, максимум - 3 секунды
			const minDelay = 1000
			setTimeout(() => {
				this.hide()
			}, minDelay)
		})
	}

	createLoader() {
		this.loader = document.createElement('div')
		this.loader.className = 'page-loader'
		this.loader.innerHTML = `
			<div class="loader-content">
				<div class="loader-circle"></div>
				<div class="loader-circle"></div>
				<div class="loader-circle"></div>
				<div class="loader-text">
					<span class="letter">J</span><span class="letter">U</span><span class="letter">G</span><span class="letter">G</span><span class="letter">L</span><span class="letter">E</span><span class="letter">R</span>
				</div>
				<div class="loader-subtext" data-i18n="loader.loading">Загрузка</div>
			</div>
		`
		document.body.prepend(this.loader)
	}

	show() {
		if (this.loader) {
			this.loader.classList.remove('hidden')
			document.body.style.overflow = 'hidden'
		}
	}

	hide() {
		if (this.loader) {
			this.loader.classList.add('hidden')
			document.body.style.overflow = ''
			// Удаляем из DOM через 500мс после скрытия
			setTimeout(() => {
				if (this.loader && this.loader.parentNode) {
					this.loader.remove()
				}
			}, 500)
		}
	}

	// Показать при переходе между страницами
	showTransition() {
		if (!this.loader) {
			this.createLoader()
		}
		this.show()
		// Автоматически скрыть через 3 секунды (макс)
		setTimeout(() => {
			this.hide()
		}, 3000)
	}
}

// Инициализация
const pageLoader = new PageLoader()

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
	module.exports = PageLoader
}
