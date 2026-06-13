const { Video } = require('./database')
const path = require('path')
const fs = require('fs')

async function seedVideos() {
	try {
		// 1. Получаем реальные файлы
		const uploadsDir = path.join(__dirname, '../uploads/videos')
		if (!fs.existsSync(uploadsDir)) {
			console.log('❌ Папка uploads/videos не найдена')
			return
		}

		const files = fs
			.readdirSync(uploadsDir)
			.filter(f => f.endsWith('.mp4') || f.endsWith('.MP4'))
		if (files.length === 0) {
			console.log('❌ Нет видео файлов для генерации')
			return
		}

		console.log(`📂 Найдено файлов: ${files.length}`)

		// 2. Очищаем старые (опционально, но для чистоты эксперимента лучше)
		await Video.destroy({ where: {}, truncate: true })
		console.log('🗑️ Старые видео удалены')

		// 3. Генерируем 20 видео
		const titles = [
			'Магия огня',
			'Жонглирование кольцами',
			'Вечернее шоу',
			'Фестиваль света',
			'Акробатический этюд',
			'Уличный перформанс',
			'Мастер-класс',
			'Яркие моменты',
			'Огненное дыхание',
			'Танец с булавами',
			'Цирковая арена',
			'Ночные огни',
			'Ритм жонглера',
			'Искусство баланса',
			'Шоу мыльных пузырей',
			'Команда мечты',
			'Праздник жизни',
			'Световое шоу',
			'Динамика движения',
			'Финал представления',
		]

		for (let i = 0; i < 20; i++) {
			const randomFile = files[Math.floor(Math.random() * files.length)]
			const title = titles[i] || `Video Performance ${i + 1}`

			await Video.create({
				title: title,
				description: `Описание для видео "${title}". Захватывающее зрелище и мастерство.`,
				url: `uploads/videos/${randomFile}`,
				preview_url: null, // Можно добавить картинки, если есть
				duration: 120 + i * 10, // Фейковая длительность
			})
		}

		console.log('✅ Успешно создано 20 видео-записей')

		const count = await Video.count()
		console.log(`📊 Всего видео в БД: ${count}`)
	} catch (error) {
		console.error('❌ Ошибка:', error)
	}
}

seedVideos()
	.then(() => process.exit(0))
	.catch(() => process.exit(1))
