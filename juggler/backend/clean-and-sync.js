const fs = require('fs')
const path = require('path')
const { Video, sequelize } = require('./database')

// Путь к папке с видео (относительно скрипта)
const UPLOADS_DIR = path.join(__dirname, '../uploads')
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv']

async function cleanAndSync() {
	try {
		console.log('Подключение к БД...')
		await sequelize.authenticate()

		console.log('Очистка таблицы Video...')
		await Video.destroy({
			where: {},
			truncate: true,
		})
		console.log('Таблица Video очищена.')

		console.log('Начинаю сканирование файлов...')
		let allFiles = []

		// Helper для сканирования
		const scanDir = (dir, prefix) => {
			if (fs.existsSync(dir)) {
				const files = fs.readdirSync(dir)
				files.forEach(file => {
					if (VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
						allFiles.push({
							filename: file,
							path: prefix ? `${prefix}/${file}` : file,
							fullPath: path.join(dir, file),
						})
					}
				})
			}
		}

		// Сканируем uploads/videos (приоритет)
		const videosDir = path.join(UPLOADS_DIR, 'videos')
		scanDir(videosDir, 'uploads/videos')

		// Сканируем корень uploads (на всякий случай)
		scanDir(UPLOADS_DIR, 'uploads')

		console.log(`Найдено ${allFiles.length} видеофайлов.`)

		let addedCount = 0
		for (const file of allFiles) {
			// Создаем красивое название
			const title = file.filename
				.replace(path.extname(file.filename), '')
				.replace(/[_-]/g, ' ')
				.replace(/IMG/i, 'Video') // Заменим IMG на Video для красоты
				.trim()

			await Video.create({
				title: title,
				url: file.path, // Путь вида uploads/videos/file.mp4
				description: 'Gallery Video',
				duration: '',
				preview_url: '',
			})
			console.log(`Добавлено: ${title} (${file.path})`)
			addedCount++
		}

		console.log(`Готово! Добавлено ${addedCount} видео.`)
	} catch (error) {
		console.error('Ошибка:', error)
	}
}

cleanAndSync()
