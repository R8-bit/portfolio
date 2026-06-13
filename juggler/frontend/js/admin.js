// URL API
// API_URL берётся из auth.js

// Навигация
document.addEventListener('DOMContentLoaded', () => {
	// Nav Click Handlers
	document.querySelectorAll('.nav-item').forEach(item => {
		item.addEventListener('click', e => {
			e.preventDefault()
			const section = item.dataset.section

			// Map sections to widgets if they are inside dashboard
			const dashboardWidgets = {
				social: 'social-widget',
				tickets: 'tickets-widget',
				contactforms: 'requests-widget',
				stats: 'stats-widget',
				backup: 'backup-widget',
			}

			// UI Updates for Nav
			document
				.querySelectorAll('.nav-item')
				.forEach(nav => nav.classList.remove('active'))
			item.classList.add('active')

			// Section Switching Logic
			document
				.querySelectorAll('.content-section')
				.forEach(sec => sec.classList.remove('active'))

			if (dashboardWidgets[section]) {
				// Show Dashboard
				document.getElementById('dashboard').classList.add('active')
				// Scroll to widget
				const widget = document.getElementById(dashboardWidgets[section])
				if (widget) {
					setTimeout(() => {
						widget.scrollIntoView({ behavior: 'smooth', block: 'start' })
					}, 100)
				}
			} else {
				// Standard Section Switch
				const target = document.getElementById(section)
				if (target) target.classList.add('active')
			}

			// Title Update
			const titles = {
				dashboard: 'Панель управления',
				videos: 'Управление видео',
				photos: 'Управление фотогалереей',
				events: 'Управление афишей',
				social: 'Социальные сети',
				tickets: 'Билеты',
				contactforms: 'Заявки',
				contacts: 'Контакты',
				footer: 'Footer',
				stats: 'Статистика',
				backup: 'Бэкап',
			}
			document.getElementById('pageTitle').textContent =
				titles[section] || 'Панель управления'
		})
	})

	// Начальная загрузка
	refreshAll()
	setupFilePreviews()
	setupCropper()
})

// Sidebar Toggle
function toggleSidebar() {
	document.querySelector('.sidebar').classList.toggle('active')
	document.querySelector('.burger-btn').classList.toggle('active')
}

function setupFilePreviews() {
	;['videoFile', 'eventFile'].forEach(id => {
		const input = document.getElementById(id)
		if (!input) return

		input.addEventListener('change', function (e) {
			const file = e.target.files[0]
			const parent = input.parentElement // .file-input-wrapper

			// Удаляем старое превью если есть
			const oldPreview = parent.querySelector('.file-preview-container')
			if (oldPreview) oldPreview.remove()

			if (file) {
				const reader = new FileReader()
				reader.onload = function (ev) {
					const div = document.createElement('div')
					div.className = 'file-preview-container'
					div.innerHTML = `
                        <div class="preview-media">
                            ${
															file.type.startsWith('video')
																? `<video src="${ev.target.result}" style="max-height:100px; max-width:100px; object-fit:cover;" controls></video>`
																: `<img src="${ev.target.result}" style="max-height:150px; width:auto; border-radius: 8px;">`
														}
                        </div>
                        <button type="button" class="btn-icon delete-preview" style="color:red;">${ICONS.close}</button>
                    `
					parent.appendChild(div)

					div.querySelector('.delete-preview').onclick = () => {
						input.value = ''
						div.remove()
					}
				}
				reader.readAsDataURL(file)
			}
		})
	})
}

function refreshAll() {
	loadVideos()
	loadPhotos()
	loadEvents()
	// loadContacts() // Not implemented
	// loadFooter() // Not implemented
	loadSocialLinks()
	loadTicketLink()
	loadContactForms()
	updateStats()
	loadDurations()
}

function navigateToSection(sectionId) {
	const navItem = document.querySelector(
		`.nav-item[data-section="${sectionId}"]`,
	)
	if (navItem) navItem.click()
}

// --- НАСТРОЙКИ ДЛИТЕЛЬНОСТИ ---
async function loadDurations() {
	try {
		const res = await fetch(`${API_URL}/settings`)
		const settings = await res.json()

		if (settings.video_duration) {
			const inp = document.getElementById('videoDurationSet')
			if (inp) inp.value = settings.video_duration
		}

		// Также установить мин. дату для событий
		const dateInput = document.getElementById('eventDate')
		if (dateInput) {
			const today = new Date().toISOString().split('T')[0]
			dateInput.min = today
		}
	} catch (e) {}
}

async function saveDurationSetting(type, value) {
	try {
		const key = type === 'video' ? 'video_duration' : 'photo_duration'
		await fetch(`${API_URL}/settings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ [key]: value }),
		})
		showNotification('Таймер обновлен')
	} catch (e) {
		showNotification('Ошибка сохранения таймера', 'error')
	}
}

async function updateStats() {
	try {
		// Also load durations here just to be safe or on load
		const [v, p, e, s] = await Promise.all([
			fetch(`${API_URL}/videos`, { credentials: 'include' }).then(res =>
				res.json(),
			),
			fetch(`${API_URL}/gallery`, { credentials: 'include' }).then(res =>
				res.json(),
			),
			fetch(`${API_URL}/events`, { credentials: 'include' }).then(res =>
				res.json(),
			),
			fetch(`${API_URL}/stats`, { credentials: 'include' }).then(res =>
				res.json(),
			),
		])

		// ... (existing update logic)
		document.getElementById('videoCount').textContent = v.length || 0
		document.getElementById('photoCount').textContent = p.length || 0
		document.getElementById('eventCount').textContent = e.length || 0

		// Update Visits
		if (document.getElementById('visitCount')) {
			document.getElementById('visitCount').textContent = s.total || 0
		}
		if (document.getElementById('statsToday')) {
			document.getElementById('statsToday').textContent = s.today || 0
		}
		if (document.getElementById('statsTotal')) {
			document.getElementById('statsTotal').textContent = s.total || 0
		}
	} catch (err) {
		console.error(err)
	}
}

async function resetStats() {
	if (!(await showConfirm('Вы хотите сбросить всю статистику посещений?')))
		return
	if (!(await showConfirm('Вы ТОЧНО уверены? Это действие нельзя отменить!')))
		return

	try {
		await fetch(`${API_URL}/stats`, { method: 'DELETE' })
		showNotification('Статистика сброшена')
		updateStats()
	} catch (err) {
		showNotification('Ошибка сброса', 'error')
	}
}

// --- NOTIFICATIONS (используем новую систему) ---
function showNotification(message, type = 'success') {
	if (typeof notificationSystem !== 'undefined') {
		notificationSystem.show(message, type)
	} else {
		// Fallback на старую систему если новая не загружена
		const container = document.getElementById('notification-container')
		const notif = document.createElement('div')
		notif.className = `admin-notification ${type}`
		notif.innerHTML = `
			<div class="icon">${type === 'success' ? '✔' : '✖'}</div>
			<div class="message">${message}</div>
		`
		container.appendChild(notif)
		setTimeout(() => notif.classList.add('show'), 10)
		setTimeout(() => {
			notif.classList.remove('show')
			setTimeout(() => notif.remove(), 300)
		}, 3000)
	}
}

// SVG Icons
// SVG Иконки
const ICONS = {
	edit: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
	trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
	plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
	close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
}

// --- ВИДЕО ---
let videosDragDrop = null
let socialDragDrop = null

async function loadVideos() {
	try {
		const res = await fetch(`${API_URL}/videos`, { credentials: 'include' })
		const videos = await res.json()

		// Отображаем в виде сетки карточек вместо таблицы
		const grid = document.getElementById('videosGrid')
		if (grid) {
			grid.innerHTML = videos
				.map(
					v => `
				<div class="video-card" data-id="${v.id}">
					<div class="video-preview">
						${v.url ? `<video src="${v.url.startsWith('http') ? v.url : API_URL + '/../' + v.url}" style="width:100%; height:100%; object-fit:cover;"></video>` : '<div style="width:100%; height:100%; background:#333; display:flex; align-items:center; justify-content:center;">Нет видео</div>'}
					</div>
					<div class="video-info">
						<span style="display:inline-block; padding:2px 6px; background:${v.category === 'gallery' ? '#9c27b0' : '#2196f3'}; color:white; border-radius:4px; font-size:10px; margin-bottom:5px;">${v.category === 'gallery' ? 'Галерея' : 'Видео'}</span>
						<h4>${v.title}</h4>
						<p>${v.description || ''}</p>
						<small>${v.duration || ''}</small>
						<div class="video-actions">
							<button class="btn-icon edit" onclick="editVideo(${v.id})">${ICONS.edit}</button>
							<button class="btn-icon delete" onclick="deleteVideo(${v.id}, this)">${ICONS.trash}</button>
						</div>
					</div>
				</div>
			`,
				)
				.join('')

			// Инициализируем drag-and-drop
			if (typeof DragDropManager !== 'undefined' && videos.length > 0) {
				videosDragDrop = new DragDropManager(
					'#videosGrid',
					'.video-card',
					async orderData => {
						try {
							await fetch(`${API_URL}/videos/reorder`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								credentials: 'include',
								body: JSON.stringify({ order: orderData }),
							})
							showNotification('Порядок видео обновлен')
						} catch (err) {
							showNotification('Ошибка изменения порядка', 'error')
						}
					},
				)
			}
		}
	} catch (err) {
		console.error(err)
	}
}

function showAddVideoForm() {
	document.getElementById('addVideoForm').style.display = 'block'
	document.getElementById('videoId').value = ''
	document.querySelector('#addVideoForm form').reset()
}

function hideAddVideoForm() {
	document.getElementById('addVideoForm').style.display = 'none'
}

async function saveVideo(e) {
	e.preventDefault()
	const id = document.getElementById('videoId').value
	const category = document.getElementById('videoCategory').value
	const title = document.getElementById('videoTitle').value
	const desc = document.getElementById('videoDescription').value

	// Construct Duration
	const min = document.getElementById('videoDurationMin').value
	const sec = document.getElementById('videoDurationSec').value
	const duration = `${min}:${sec}`

	const url = document.getElementById('videoUrl').value
	const file = document.getElementById('videoFile').files[0]

	const formData = new FormData()
	formData.append('category', category)
	formData.append('title', title)
	formData.append('description', desc)
	formData.append('duration', duration)
	if (url) formData.append('url', url)
	if (file) formData.append('videoFile', file)

	try {
		const method = id ? 'PUT' : 'POST'
		const endpoint = id ? `${API_URL}/videos/${id}` : `${API_URL}/videos`

		const res = await fetch(endpoint, {
			method: method,
			credentials: 'include',
			body: formData, // No Content-Type header needed for FormData
		})

		if (!res.ok) throw new Error('Ошибка сохранения')

		showNotification('Видео сохранено')
		hideAddVideoForm()
		loadVideos()
		updateStats()
	} catch (err) {
		showNotification(err.message, 'error')
	}
}

// --- UNDO DELETION UTILS ---
let deletionTimer = null
let pendingDeletion = null // { type, id, element }

function showUndoNotification(message, onUndo) {
	if (typeof notificationSystem !== 'undefined') {
		notificationSystem.showUndo(message, onUndo, 5000)
	} else {
		// Fallback
		const container = document.getElementById('notification-container')
		const notif = document.createElement('div')
		notif.className = 'admin-notification warning'
		notif.innerHTML = `
			<div class="message">${message}</div>
			<button class="undo-btn" style="margin-left:10px; padding:5px 10px; background:white; color:black; border:none; cursor:pointer;">Отменить</button>
		`
		container.innerHTML = ''
		container.appendChild(notif)
		setTimeout(() => notif.classList.add('show'), 10)
		notif.querySelector('.undo-btn').onclick = () => {
			onUndo()
			notif.classList.remove('show')
			setTimeout(() => notif.remove(), 300)
		}
	}
}

// GENERIC DELETE WITH DELAY
// --- УДАЛЕНИЕ С "ОТМЕНОЙ" (5 сек) ---
let pendingDeletions = new Map() // ID -> { timer, element }

function secureDelete(id, type, apiPath, btnElement) {
	// Находим карточку элемента (родителя кнопки)
	const card =
		btnElement.closest('tr') ||
		btnElement.closest('.photo-card') ||
		btnElement.closest('.video-card')

	// Скрываем сразу (оптимистично)
	if (card) {
		card.style.opacity = '0.3'
		card.style.pointerEvents = 'none'
	}

	// Если уже было запланировано удаление этого элемента, сбрасываем старый таймер (на всякий случай)
	const key = `${type}_${id}`
	if (pendingDeletions.has(key)) {
		clearTimeout(pendingDeletions.get(key).timer)
	}

	// Показываем уведомление с кнопкой "Отмена"
	showUndoNotification(`Объект удалится через 5 сек`, () => {
		// Логика ОТМЕНЫ
		if (pendingDeletions.has(key)) {
			clearTimeout(pendingDeletions.get(key).timer)
			pendingDeletions.delete(key)
			if (card) {
				card.style.opacity = '1'
				card.style.pointerEvents = 'all'
			}
			showNotification('Удаление отменено', 'success')
		}
	})

	// Таймер на 5 секунд
	const timer = setTimeout(async () => {
		try {
			await fetch(`${API_URL}/${apiPath}/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			})
			// После успешного удаления совсем убираем элемент из DOM (если еще есть)
			if (card) card.remove()
			showNotification('Успешно удалено')

			// Опционально: обновить статистику
			updateStats()

			pendingDeletions.delete(key)
		} catch (err) {
			// Если ошибка - возвращаем всё назад
			if (card) {
				card.style.opacity = '1'
				card.style.pointerEvents = 'all'
			}
			showNotification('Ошибка при удалении', 'error')
			console.error(err)
		}
	}, 5000)

	pendingDeletions.set(key, { timer, card })
}

async function deletePhoto(id, btn) {
	// if (!(await showConfirm('Удалить фото?'))) return // Убираем confirm, делаем через undo
	secureDelete(id, 'photo', 'gallery', btn)
}

async function deleteVideo(id, btn) {
	// if (!(await showConfirm('Удалить видео?'))) return
	secureDelete(id, 'video', 'videos', btn)
}

async function editVideo(id) {
	const res = await fetch(`${API_URL}/videos`, { credentials: 'include' })
	const videos = await res.json()
	const video = videos.find(v => v.id == id)
	if (!video) return

	document.getElementById('videoId').value = video.id
	document.getElementById('videoCategory').value =
		video.category || 'video_page'
	document.getElementById('videoTitle').value = video.title
	document.getElementById('videoDescription').value = video.description

	// Parse duration
	if (video.duration && video.duration.includes(':')) {
		const parts = video.duration.split(':')
		document.getElementById('videoDurationMin').value = parts[0] || '0'
		document.getElementById('videoDurationSec').value = parts[1] || '00'
	} else {
		document.getElementById('videoDurationMin').value = '0'
		document.getElementById('videoDurationSec').value = '00'
	}

	document.getElementById('videoUrl').value = video.url
	document.getElementById('addVideoForm').style.display = 'block'
}

// --- ФОТОГАЛЕРЕЯ ---
let photosDragDrop = null

async function loadPhotos() {
	try {
		const res = await fetch(`${API_URL}/gallery`, { credentials: 'include' })
		const photos = await res.json()
		const grid = document.getElementById('photosGrid')
		grid.innerHTML = photos
			.map(p => {
				const mediaContent = getCroppedImgHtml(p.image_url, p.crop_data)

				return `
            <div class="photo-card" data-id="${p.id}">
                <div class="photo-preview" style="background:none;">${mediaContent}</div>
                <div class="photo-info">
                    <h4>${p.title}</h4>
                    <div class="photo-actions">
                         <button class="btn-icon edit" onclick="editPhoto(${p.id})">${ICONS.edit}</button>
                        <button class="btn-icon delete" onclick="deletePhoto(${p.id}, this)">${ICONS.trash}</button>
                    </div>
                </div>
            </div>
            `
			})
			.join('')

		// Инициализируем drag-and-drop
		if (typeof DragDropManager !== 'undefined' && photos.length > 0) {
			photosDragDrop = new DragDropManager(
				'#photosGrid',
				'.photo-card',
				async orderData => {
					try {
						await fetch(`${API_URL}/gallery/reorder`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							credentials: 'include',
							body: JSON.stringify({ order: orderData }),
						})
						showNotification('Порядок фото обновлен')
					} catch (err) {
						showNotification('Ошибка изменения порядка', 'error')
					}
				},
			)
		}
	} catch (err) {
		console.error(err)
	}
}

function clearPhotoForm() {
	document.getElementById('photoId').value = ''
	// Title and Description removed
	document.getElementById('photoFile').value = ''
	currentCroppedBlob = null
	currentCropData = null

	const preview = document.querySelector(
		'#addPhotoForm .file-preview-container',
	)
	if (preview) preview.remove()

	const recrop = document.querySelector('#addPhotoForm .recrop-container')
	if (recrop) recrop.remove()
}

function showAddPhotoForm() {
	clearPhotoForm()
	document.getElementById('addPhotoForm').style.display = 'block'
}

function hideAddPhotoForm() {
	document.getElementById('addPhotoForm').style.display = 'none'
	clearPhotoForm()
}

async function editPhoto(id) {
	const res = await fetch(`${API_URL}/gallery`, { credentials: 'include' })
	const photos = await res.json()
	const photo = photos.find(p => p.id == id)
	if (!photo) return

	clearPhotoForm() // Clear previous state

	document.getElementById('photoId').value = photo.id
	// Title and Description removed

	// Add Recrop Button if image exists
	if (photo.image_url) {
		const url = photo.image_url.startsWith('http')
			? photo.image_url
			: `${API_URL}/../${photo.image_url}`
		const parent = document.getElementById('photoFile').parentElement

		// Button container
		const btnDiv = document.createElement('div')
		btnDiv.className = 'recrop-container'
		btnDiv.style.marginTop = '10px'
		btnDiv.innerHTML = `
			<button type="button" class="btn-icon edit" style="width:auto; padding:0 10px; gap:5px;" onclick="startRecrop('${url}')">
				${ICONS.edit} Кадрировать текущее фото
			</button>
			<div style="margin-top:5px; font-size:12px; color:#aaa;">Текущее фото: <a href="${url}" target="_blank" style="color:#00c9ff;">Открыть</a></div>
		`
		parent.appendChild(btnDiv)
	}

	document.getElementById('addPhotoForm').style.display = 'block'
}

function startRecrop(url, ratio) {
	const image = document.getElementById('imageToCrop')
	const modal = document.getElementById('cropModal')

	// Load image with crossOrigin to allow canvas export
	image.crossOrigin = 'anonymous'
	image.src = url

	modal.classList.add('active')

	image.onload = () => {
		if (cropper) cropper.destroy()
		cropper = new Cropper(image, {
			aspectRatio: ratio || 2,
			viewMode: 2,
			autoCropArea: 1,
			checkCrossOrigin: false,
		})
	}
}

async function savePhoto(e) {
	e.preventDefault()
	const id = document.getElementById('photoId').value
	// Title and Description removed
	const file = document.getElementById('photoFile').files[0]

	const formData = new FormData()

	// If we have crop data, we send the ORIGINAL file (file input) + crop_data
	// currentCroppedBlob is just for preview now, unless we want to fallback?
	// User asked: "load full photo"

	if (file) {
		formData.append('imageFile', file)
	}

	if (currentCropData) {
		formData.append('crop_data', currentCropData)
	}

	try {
		const method = id ? 'PUT' : 'POST'
		const endpoint = id ? `${API_URL}/gallery/${id}` : `${API_URL}/gallery`

		await fetch(endpoint, { method: method, body: formData })
		showNotification('Фото сохранено')
		hideAddPhotoForm()
		loadPhotos()
		updateStats()
	} catch (err) {
		showNotification(err.message, 'error')
	}
}

// --- АФИША (СОБЫТИЯ) ---
// Moved logic to combined replace above
// This block is redundant if I used multi-replace logic correctly.
// But wait, the TargetContent in previous call was ONLY loadPhotos.
// I must use multi_replace OR a second replace call for loadEvents.
// I will use this call for loadEvents.

async function loadEvents() {
	try {
		const res = await fetch(`${API_URL}/events`, { credentials: 'include' })
		const events = await res.json()
		const tbody = document.getElementById('eventsTableBody')
		if (!tbody) return // Exit if element not found

		tbody.innerHTML = events
			.map(e => {
				const thumb = e.image_url
					? `<div style="width:60px; height:80px; border-radius:4px; overflow:hidden;">${getCroppedImgHtml(e.image_url, e.crop_data)}</div>`
					: '<div style="width:60px; height:80px; background:#ddd; border-radius:4px;"></div>'

				return `
            <tr>
				<td>${thumb}</td>
                <td>${e.date}</td>
                <td>${e.title}</td>
                <td>${e.location}</td>
                <td>
                    <button class="btn-icon edit" onclick="editEvent(${e.id})">${ICONS.edit}</button>
                    <button class="btn-icon delete" onclick="deleteEvent(${e.id}, this)">${ICONS.trash}</button>
                </td>
            </tr>
         `
			})
			.join('')
	} catch (err) {
		console.error(err)
	}
}

function showAddEventForm() {
	document.getElementById('addEventForm').style.display = 'block'
	document.getElementById('eventId').value = '' // Clear ID for new
	document.querySelector('#addEventForm form').reset()

	// Clear artifacts
	currentCropData = null
	currentCroppedBlob = null
	const prev = document.querySelector('#addEventForm .file-preview-container')
	if (prev) prev.remove()
	const recrop = document.querySelector('#addEventForm .recrop-container')
	if (recrop) recrop.remove()
}
function hideAddEventForm() {
	document.getElementById('addEventForm').style.display = 'none'
	// Cleanup
	currentCropData = null
	const prev = document.querySelector('#addEventForm .file-preview-container')
	if (prev) prev.remove()
	const recrop = document.querySelector('#addEventForm .recrop-container')
	if (recrop) recrop.remove()
}

// ... (editEvent)
async function editEvent(id) {
	const res = await fetch(`${API_URL}/events`, { credentials: 'include' })
	const events = await res.json()
	const event = events.find(e => e.id == id)
	if (!event) return

	// Cleanup first
	currentCropData = null
	const prev = document.querySelector('#addEventForm .file-preview-container')
	if (prev) prev.remove()
	const recrop = document.querySelector('#addEventForm .recrop-container')
	if (recrop) recrop.remove()

	document.getElementById('eventId').value = event.id
	document.getElementById('eventCategory').value = event.category
	document.getElementById('eventTitle').value = event.title
	document.getElementById('eventDate').value = event.date
	document.getElementById('eventTime').value = event.time
	document.getElementById('eventLocation').value = event.location
	document.getElementById('eventDescription').value = event.description

	// New fields
	document.getElementById('eventDuration').value = event.duration || ''
	document.getElementById('eventAge').value = event.age_restriction || ''
	document.getElementById('eventGenre').value = event.genre || ''

	// Parse Capacity (remove ' мест')
	let cap = event.capacity || ''
	document.getElementById('eventCapacity').value = cap.replace(/\D/g, '')

	// Parse Price (remove ' ₽')
	let price = event.price || ''
	document.getElementById('eventPrice').value = price.replace(/\D/g, '')

	document.getElementById('eventTicketUrl').value = event.ticket_url || ''
	document.getElementById('eventParticipants').value = event.participants || ''

	// Add Recrop Button
	if (event.image_url) {
		const url = event.image_url.startsWith('http')
			? event.image_url
			: `${API_URL}/../${event.image_url}`
		const parent = document.getElementById('eventFile').parentElement

		const btnDiv = document.createElement('div')
		btnDiv.className = 'recrop-container'
		btnDiv.style.marginTop = '10px'
		btnDiv.innerHTML = `
			<button type="button" class="btn-icon edit" style="width:auto; padding:0 10px; gap:5px;" onclick="activeCropInputId='eventFile'; startRecrop('${url}', 0.75)">
				${ICONS.edit} Кадрировать текущее фото
			</button>
			<div style="margin-top:5px; font-size:12px; color:#aaa;">Текущее фото: <a href="${url}" target="_blank" style="color:#00c9ff;">Открыть</a></div>
		`
		parent.appendChild(btnDiv)
	}

	document.getElementById('addEventForm').style.display = 'block'
}

async function saveEvent(e) {
	e.preventDefault()
	const id = document.getElementById('eventId').value

	const category = document.getElementById('eventCategory').value
	const title = document.getElementById('eventTitle').value
	const date = document.getElementById('eventDate').value
	const time = document.getElementById('eventTime').value
	const location = document.getElementById('eventLocation').value
	const desc = document.getElementById('eventDescription').value

	const duration = document.getElementById('eventDuration').value
	const age = document.getElementById('eventAge').value
	const genre = document.getElementById('eventGenre').value

	// Append suffixes for storage (if simple DB usage)
	let capacity = document.getElementById('eventCapacity').value
	if (capacity) capacity += ' мест'

	let price = document.getElementById('eventPrice').value
	if (price) price += ' ₽'

	const ticketUrl = document.getElementById('eventTicketUrl').value
	const participants = document.getElementById('eventParticipants').value

	const formData = new FormData()
	formData.append('category', category)
	formData.append('title', title)
	formData.append('date', date)
	formData.append('time', time)
	formData.append('location', location)
	formData.append('description', desc)

	formData.append('duration', duration)
	formData.append('age_restriction', age)
	formData.append('genre', genre)
	formData.append('capacity', capacity)
	formData.append('price', price)
	formData.append('ticket_url', ticketUrl)
	formData.append('participants', participants)

	const file = document.getElementById('eventFile').files[0]
	if (file) formData.append('imageFile', file)

	if (currentCropData) {
		formData.append('crop_data', currentCropData)
	}

	try {
		const method = id ? 'PUT' : 'POST'
		const endpoint = id ? `${API_URL}/events/${id}` : `${API_URL}/events`

		const res = await fetch(endpoint, {
			method: method,
			credentials: 'include',
			body: formData,
		})
		if (!res.ok) throw new Error('Ошибка сохранения')

		showNotification('Событие сохранено')
		hideAddEventForm()
		loadEvents()
		updateStats()
	} catch (err) {
		showNotification('Ошибка', 'error')
	}
}

async function deleteEvent(id, btn) {
	// if (!(await showConfirm('Удалить событие?'))) return
	secureDelete(id, 'event', 'events', btn)
}

// --- НАСТРОЙКИ ---
async function loadSettings() {
	try {
		const res = await fetch(`${API_URL}/settings`)
		const settings = await res.json()
		if (settings.footerText)
			document.getElementById('settingFooterText').value = settings.footerText
		if (settings.scrollVideo)
			document.getElementById('settingScrollVideo').value = settings.scrollVideo
	} catch (err) {}
}

async function saveSettings(e) {
	e.preventDefault()
	const footerText = document.getElementById('settingFooterText').value
	const scrollVideo = document.getElementById('settingScrollVideo').value

	try {
		await fetch(`${API_URL}/settings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ footerText, scrollVideo }),
		})
		showNotification('Настройки сохранены')
	} catch (e) {
		showNotification('Ошибка', 'error')
	}
}

// --- БОКОВОЕ МЕНЮ И МОДАЛЬНЫЕ ОКНА ---
function toggleSidebar() {
	document.querySelector('.sidebar').classList.toggle('active')
}

// Логика кастомного подтверждения
let confirmCallback = null
function showConfirm(message = 'Вы уверены?') {
	return new Promise(resolve => {
		document.getElementById('confirmMessage').innerText = message
		document.getElementById('confirmModal').classList.add('active')
		confirmCallback = resolve
	})
}
function closeConfirmModal(result) {
	document.getElementById('confirmModal').classList.remove('active')
	if (confirmCallback) confirmCallback(result)
	confirmCallback = null
}

// --- ФУТЕР (ПОДВАЛ) ---
async function loadFooter() {
	try {
		const res = await fetch(`${API_URL}/footer`, { credentials: 'include' })
		const links = await res.json()
		const container = document.getElementById('footerLinksContainer')
		if (!container) return // Exit if element not found

		container.innerHTML = ''

		// Pre-fill if empty with default site links
		if (links.length === 0) {
			const defaults = [
				{ text: 'Видео', url: '#videos' },
				{ text: 'Галерея', url: '#photos' },
				{ text: 'Афиша', url: '#events' },
				{ text: 'Контакты', url: '#contacts' },
			]
			defaults.forEach(l => addFooterLink(l))
		} else {
			links.forEach(link => addFooterLink(link))
		}
	} catch (err) {
		console.error(err)
	}
}

function addFooterLink(data = {}) {
	const container = document.getElementById('footerLinksContainer')
	const div = document.createElement('div')
	div.className = 'form-row footer-link-row'
	div.innerHTML = `
        <div class="form-group" style="flex: 1;">
            <input type="text" class="footer-text" placeholder="Текст ссылки" value="${data.text || ''}" required>
        </div>
        <div class="form-group" style="flex: 1;">
            <input type="text" class="footer-url" placeholder="URL (#about)" value="${data.url || ''}" required>
        </div>
        <button type="button" class="btn-icon delete" onclick="this.parentElement.remove()">${ICONS.trash}</button>
    `
	container.appendChild(div)
}

async function saveFooter(e) {
	e.preventDefault()
	const container = document.getElementById('footerLinksContainer')
	const rows = container.querySelectorAll('.footer-link-row')
	const links = []

	rows.forEach((row, index) => {
		const text = row.querySelector('.footer-text').value
		const url = row.querySelector('.footer-url').value
		if (text && url) {
			links.push({ text, url, order: index })
		}
	})

	try {
		const res = await fetch(`${API_URL}/footer`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(links),
		})
		if (res.ok) {
			showNotification('Footer обновлен')
		} else {
			showNotification('Ошибка обновления footer', 'error')
		}
	} catch (err) {
		console.error(err)
		showNotification('Ошибка сети', 'error')
	}
}

// --- КОНТАКТЫ ---
async function loadContacts() {
	try {
		const res = await fetch(`${API_URL}/contacts`, { credentials: 'include' })
		const contacts = await res.json()
		// Assuming contacts is array of {type, value}
		// or simplistic key-value? Backend 'Contact' model has type, label, value.
		// Let's assume we map 'email', 'phone', 'address' types.
		const email = contacts.find(c => c.type === 'email')
		const phone = contacts.find(c => c.type === 'phone')
		const address = contacts.find(c => c.type === 'address')

		if (email) document.getElementById('contactEmail').value = email.value
		if (phone) document.getElementById('contactPhone').value = phone.value
		if (address) document.getElementById('contactAddress').value = address.value
	} catch (e) {}
}

async function saveContacts(e) {
	e.preventDefault()
	const email = document.getElementById('contactEmail').value
	const phone = document.getElementById('contactPhone').value
	const address = document.getElementById('contactAddress').value

	const contactsPayload = [
		{ type: 'email', value: email, label: 'Email' },
		{ type: 'phone', value: phone, label: 'Телефон' },
		{ type: 'address', value: address, label: 'Адрес' },
	]

	try {
		await fetch(`${API_URL}/contacts`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(contactsPayload),
		})
		showNotification('Контакты сохранены')
	} catch (e) {
		showNotification('Ошибка', 'error')
	}
}

function exportData() {
	// Implement export if needed
	window.location.href = `${API_URL}/export` // Need to implement this route? Or just JSON
	showNotification('Функция экспорта в разработке', 'info')
}

function downloadBackup() {
	window.location.href = `${API_URL}/backup`
}

// --- CROPPER LOGIC ---
let cropper
let currentCroppedBlob = null

// Stores the ID of the input that is currently being cropped
let activeCropInputId = null

function setupCropper() {
	bindCropper('photoFile', 2) // Gallery: 2:1
	bindCropper('eventFile', 3 / 4) // Events: 3:4 (Portrait) - Assuming standard poster format
}

function bindCropper(inputId, ratio) {
	const input = document.getElementById(inputId)
	const image = document.getElementById('imageToCrop')

	if (!input) return

	input.addEventListener('change', function (e) {
		const files = e.target.files
		if (files && files.length > 0) {
			activeCropInputId = inputId // Remember who triggered this

			const file = files[0]
			const reader = new FileReader()

			reader.onload = function (e) {
				const modal = document.getElementById('cropModal')
				modal.classList.add('active')

				image.src = e.target.result
				image.onload = () => {
					if (cropper) cropper.destroy()
					cropper = new Cropper(image, {
						aspectRatio: ratio,
						viewMode: 1, // Restrict crop box to canvas size
						autoCropArea: 1,
						checkCrossOrigin: false,
					})
				}
			}
			reader.readAsDataURL(file)
		}
	})
}

function closeCropModal() {
	document.getElementById('cropModal').classList.remove('active')
	if (cropper) {
		cropper.destroy()
		cropper = null
	}
	document.getElementById('photoFile').value = '' // Reset input if cancelled
}

// Store both blob (for preview/legacy) and data (for non-destructive)
let currentCropData = null

function saveCrop() {
	if (!cropper) return

	// 1. Get Crop Data & Image Data
	const data = cropper.getData()
	const imageData = cropper.getImageData() // contains naturalWidth, naturalHeight

	const fullData = {
		...data,
		naturalWidth: imageData.naturalWidth,
		naturalHeight: imageData.naturalHeight,
	}

	currentCropData = JSON.stringify(fullData) // Store as string for DB

	// 2. Generate Preview
	// We can still use blob for preview, but we won't upload it.
	cropper.getCroppedCanvas().toBlob(blob => {
		currentCroppedBlob = blob

		// Determine which input triggered this
		const inputId = activeCropInputId || 'photoFile' // Fallback
		const input = document.getElementById(inputId)
		if (!input) return

		const parent = input.parentElement
		const oldPreview = parent.querySelector('.file-preview-container')
		if (oldPreview) oldPreview.remove()

		const recrop = parent.querySelector('.recrop-container')
		if (recrop) recrop.remove()

		const url = URL.createObjectURL(blob)
		const div = document.createElement('div')
		div.className = 'file-preview-container'
		div.innerHTML = `
			<div class="preview-media">
				<img src="${url}" style="max-height:150px; width:auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
			</div>
			<div style="font-size:12px; color:#aaa; margin-top:5px;">Область выделена (фото будет загружено целиком)</div>
			<button type="button" class="btn-icon delete-preview" style="color:red;">${ICONS.close}</button>
		`
		parent.appendChild(div)

		div.querySelector('.delete-preview').onclick = () => {
			input.value = ''
			currentCroppedBlob = null
			currentCropData = null
			div.remove()
		}

		document.getElementById('cropModal').classList.remove('active')
		if (cropper) {
			cropper.destroy()
			cropper = null
		}
	})
}

// Helper for robust crop rendering
function getCroppedImgHtml(url, cropData) {
	if (!url) return ''
	const src = url.startsWith('http') ? url : `${API_URL}/../${url}`

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
		} catch (e) {
			console.error('Crop parse error', e)
		}
	}

	return `<div style="${wrapperStyle}"><img src="${src}" style="${imgStyle}"></div>`
}

// --- СОЦИАЛЬНЫЕ СЕТИ ---
// Генерация SVG иконок
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
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
			</svg>
		`,
		twitter: `
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
			</svg>
		`,
		threads: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="24" height="24" fill="none" stroke="#000000" stroke-width="12">
				<path d="M141.5 126a35 35 0 1 0-51 0"/>
				<path d="M141.5 126v-15.5a43.5 43.5 0 1 0-38 38c11 0 20.5-5 27.5-13"/>
				<path d="M131 134.5c9 10 20.5 17 38 17 28 0 45-21 45-55.5s-17-55.5-45-55.5-59.5 22.5-59.5 55.5c0 23.5 13.5 41.5 33 48.5"/>
			</svg>
		`,
	}

	return icons[iconName] || icons.x
}

async function loadSocialLinks() {
	try {
		const res = await fetch(`${API_URL}/social-links`, {
			credentials: 'include',
		})
		let links = await res.json()

		if (links.length === 0) {
			const defaults = [
				{
					name: 'Instagram',
					url: '#',
					icon: 'instagram',
					order: 0,
					isActive: true,
				},
				{
					name: 'Telegram',
					url: '#',
					icon: 'telegram',
					order: 1,
					isActive: true,
				},
				{
					name: 'YouTube',
					url: '#',
					icon: 'youtube',
					order: 2,
					isActive: true,
				},
				{
					name: 'Threads',
					url: '#',
					icon: 'threads',
					order: 3,
					isActive: true,
				},
			]
			for (const d of defaults) {
				await fetch(`${API_URL}/social-links`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(d),
				})
			}
			const res2 = await fetch(`${API_URL}/social-links`, {
				credentials: 'include',
			})
			links = await res2.json()
		}

		const grid = document.getElementById('socialLinksGrid')
		if (!grid) return

		grid.innerHTML = links
			.map(
				link => `
            <div class="social-card" data-id="${link.id}">
                <div class="social-icon-wrapper">
                    ${getSocialIcon(link.name)}
                </div>
                <div class="social-info">
                    <h4>${link.name}</h4>
                    <a href="${link.url}" target="_blank">${link.url}</a>
                    <span class="social-status ${link.isActive ? 'active' : 'inactive'}">
                        ${link.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                </div>
                <div class="social-actions">
                    <button class="btn-icon edit" onclick="editSocialLink(${link.id})">${ICONS.edit}</button>
                    <button class="btn-icon delete" onclick="deleteSocialLink(${link.id}, this)">${ICONS.trash}</button>
                </div>
            </div>
        `,
			)
			.join('')

		// Initialize DnD
		if (typeof DragDropManager !== 'undefined' && links.length > 0) {
			socialDragDrop = new DragDropManager(
				'#socialLinksGrid',
				'.social-card',
				async orderData => {
					try {
						await fetch(`${API_URL}/social-links/reorder`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							credentials: 'include',
							body: JSON.stringify({ order: orderData }),
						})
						showNotification('Порядок соцсетей обновлен')
					} catch (err) {
						showNotification('Ошибка изменения порядка', 'error')
					}
				},
			)
		}
	} catch (err) {
		console.error(err)
	}
}
function showAddSocialForm() {
	document.getElementById('addSocialForm').style.display = 'block'
	document.getElementById('socialId').value = ''
	document.querySelector('#addSocialForm form').reset()
	document.getElementById('socialActive').checked = true
}

function hideAddSocialForm() {
	document.getElementById('addSocialForm').style.display = 'none'
}

async function saveSocialLink(e) {
	e.preventDefault()
	const id = document.getElementById('socialId').value
	const name = document.getElementById('socialName').value
	const url = document.getElementById('socialUrl').value
	const order = document.getElementById('socialOrder').value
	const isActive = document.getElementById('socialActive').checked

	const icon = name.toLowerCase() // instagram, telegram, x, youtube

	try {
		const method = id ? 'PUT' : 'POST'
		const endpoint = id
			? `${API_URL}/social-links/${id}`
			: `${API_URL}/social-links`

		await fetch(endpoint, {
			method,
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, url, icon, order, isActive }),
		})

		showNotification('Соцсеть сохранена')
		hideAddSocialForm()
		loadSocialLinks()
	} catch (err) {
		showNotification('Ошибка', 'error')
	}
}

async function editSocialLink(id) {
	const res = await fetch(`${API_URL}/social-links`, { credentials: 'include' })
	const links = await res.json()
	const link = links.find(l => l.id == id)
	if (!link) return

	document.getElementById('socialId').value = link.id
	document.getElementById('socialName').value = link.name
	document.getElementById('socialUrl').value = link.url
	document.getElementById('socialOrder').value = link.order || 0
	document.getElementById('socialActive').checked = link.isActive || false
	document.getElementById('addSocialForm').style.display = 'block'
}

async function deleteSocialLink(id, btn) {
	secureDelete(id, 'social', 'social-links', btn)
}

// --- БИЛЕТЫ ---
async function loadTicketLink() {
	try {
		const res = await fetch(`${API_URL}/ticket-link`, {
			credentials: 'include',
		})
		const link = await res.json()
		if (link && link.url) {
			document.getElementById('ticketUrl').value = link.url
			document.getElementById('ticketLabel').value =
				link.label || 'Купить билеты'
			document.getElementById('ticketActive').checked = link.isActive !== false
		}
	} catch (err) {
		console.error(err)
	}
}

async function saveTicketLink(e) {
	e.preventDefault()
	const url = document.getElementById('ticketUrl').value
	const label = document.getElementById('ticketLabel').value
	const isActive = document.getElementById('ticketActive').checked

	try {
		await fetch(`${API_URL}/ticket-link`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url, label, isActive }),
		})
		showNotification('Ссылка на билеты сохранена')
	} catch (err) {
		showNotification('Ошибка', 'error')
	}
}

// --- ЗАЯВКИ "СВЯЗЬ С НАМИ" ---
async function loadContactForms() {
	try {
		const res = await fetch(`${API_URL}/contact-forms`, {
			credentials: 'include',
		})
		const forms = await res.json()
		const grid = document.getElementById('contactFormsGrid')
		if (!grid) return

		if (forms.length === 0) {
			grid.innerHTML =
				'<p style="color: #888; text-align: center; grid-column: 1/-1;">Нет заявок</p>'
			return
		}

		grid.innerHTML = forms
			.map(
				form => `
            <div class="contact-card">
                <div class="contact-header">
                    <div class="contact-name">${form.firstName} ${form.lastName}</div>
                    <div class="contact-date">${new Date(form.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="contact-subject">
                    ${form.subject || 'Без темы'}
                </div>
                <div style="margin-bottom: 15px;">
                    <span class="status-badge ${form.status || 'new'}">${getStatusText(form.status)}</span>
                </div>
                <div class="contact-footer">
                    <button class="btn-icon" onclick="viewContactForm(${form.id})" title="Просмотр">👁️</button>
                    ${
											form.status !== 'archived'
												? `<button class="btn-icon" onclick="updateContactStatus(${form.id}, 'archived')" title="Архивировать">🗄️</button>`
												: ''
										}
                    <button class="btn-icon delete" onclick="deleteContactForm(${form.id}, this)">${ICONS.trash}</button>
                </div>
            </div>
        `,
			)
			.join('')
	} catch (err) {
		console.error(err)
	}
}

function getStatusText(status) {
	const statuses = {
		new: 'Новая',
		read: 'Прочитана',
		archived: 'В архиве',
	}
	return statuses[status] || 'Новая'
}

let currentContactId = null

async function viewContactForm(id) {
	try {
		const res = await fetch(`${API_URL}/contact-forms`, {
			credentials: 'include',
		})
		const forms = await res.json()
		const form = forms.find(f => f.id == id)
		if (!form) return

		currentContactId = id

		const content = document.getElementById('contactDetailsContent')
		content.innerHTML = `
			<div class="detail-row">
				<div class="detail-label">Имя</div>
				<div class="detail-value">${form.firstName} ${form.lastName}</div>
			</div>
			<div class="detail-row">
				<div class="detail-label">Контакты</div>
				<div class="detail-value">
					<a href="mailto:${form.email}" style="color: #fff; text-decoration: none;">${form.email}</a><br>
					<a href="tel:${form.phone}" style="color: #fff; text-decoration: none;">${form.phone}</a>
				</div>
			</div>
			<div class="detail-row">
				<div class="detail-label">Тема</div>
				<div class="detail-value">${form.subject}</div>
			</div>
			<div class="detail-row">
				<div class="detail-label">Сообщение</div>
				<div class="detail-message">${form.message || 'Нет сообщения'}</div>
			</div>
			<div class="detail-row">
				<div class="detail-label">Статус</div>
				<div class="detail-value"><span class="status-badge ${form.status}">${getStatusText(form.status)}</span></div>
			</div>
		`

		const actions = document.getElementById('contactModalActions')
		actions.innerHTML = ''

		if (form.status === 'new') {
			actions.innerHTML += `<button class="btn btn-primary" onclick="updateContactStatus(${id}, 'read')">Ознакомлен</button>`
		}
		if (form.status !== 'archived') {
			actions.innerHTML += `<button class="btn btn-secondary" onclick="updateContactStatus(${id}, 'archived')">В архив</button>`
		}

		document.getElementById('viewContactModal').classList.add('active')
	} catch (err) {
		console.error(err)
	}
}

function closeViewContactModal() {
	document.getElementById('viewContactModal').classList.remove('active')
}

async function updateContactStatus(id, status) {
	try {
		await fetch(`${API_URL}/contact-forms/${id}`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status }),
		})

		if (status === 'read') {
			showNotification('Статус обновлен: Прочитано')
		} else if (status === 'archived') {
			showNotification('Заявка перемещена в архив')
		}

		closeViewContactModal()
		loadContactForms()
	} catch (err) {
		showNotification('Ошибка обновления статуса', 'error')
	}
}

async function deleteContactForm(id, btn) {
	secureDelete(id, 'contactform', 'contact-forms', btn)
}
