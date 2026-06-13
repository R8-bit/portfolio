const fs = require('fs')
const path = require('path')
const { Video } = require('./database')

// Путь к папке с видео (относительно скрипта)
const UPLOADS_DIR = path.join(__dirname, '../uploads')
// Мы будем искать видео в корне uploads и в папке videos, если она есть
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv']

async function syncVideos() {
	try {
		console.log('Начинаю синхронизацию видео...')

		// 1. Получаем список всех файлов
		let allFiles = []

		// Проверяем корень uploads
		if (fs.existsSync(UPLOADS_DIR)) {
			const files = fs.readdirSync(UPLOADS_DIR)
			files.forEach(file => {
				if (VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
					allFiles.push({
						filename: file,
						path: `uploads/${file}`,
						fullPath: path.join(UPLOADS_DIR, file),
					})
				}
			})

			// Проверяем подпапку videos
			const videosDir = path.join(UPLOADS_DIR, 'videos')
			if (fs.existsSync(videosDir)) {
				const videoFiles = fs.readdirSync(videosDir)
				videoFiles.forEach(file => {
					if (VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
						allFiles.push({
							filename: file,
							path: `uploads/videos/${file}`,
							fullPath: path.join(videosDir, file),
						})
					}
				})
			}
		} else {
			console.error('Папка uploads не найдена!')
			return
		}

		console.log(`Найдено ${allFiles.length} видеофайлов.`)

		// 2. Проверяем каждый файл в БД
		let addedCount = 0

		for (const file of allFiles) {
			// Ищем по URL (пути) или по названию (если путь мог измениться)
			const existingVideo = await Video.findOne({
				where: {
					url: file.path,
				},
			})

			if (!existingVideo) {
				// Создаем красивое название из имени файла
				const title = file.filename
					.replace(path.extname(file.filename), '') // Убираем расширение
					.replace(/[_-]/g, ' ') // Заменяем _ и - на пробелы
					.replace(/^\w/, c => c.toUpperCase()) // Первая буква заглавная

				await Video.create({
					title: title,
					url: file.path,
					description: 'Загружено автоматически',
				})

				console.log(`Добавлено: ${title}`)
				addedCount++
			}
		}

		console.log(`Синхронизация завершена. Добавлено новых видео: ${addedCount}`)
	} catch (error) {
		console.error('Ошибка синхронизации:', error)
	}
}

syncVideos()
