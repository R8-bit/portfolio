const fs = require('fs')
const path = require('path')
const { Gallery } = require('./database')

async function importGalleryPhotos() {
	const uploadsDir = path.join(__dirname, '../uploads/gallery')

	try {
		// Проверяем, существует ли папка
		if (!fs.existsSync(uploadsDir)) {
			console.log('❌ Папка uploads/gallery не найдена')
			return
		}

		// Читаем все файлы
		const files = fs.readdirSync(uploadsDir)
		const imageFiles = files.filter(file =>
			/\.(jpg|jpeg|png|gif|webp)$/i.test(file),
		)

		if (imageFiles.length === 0) {
			console.log('❌ В папке uploads/gallery нет изображений')
			return
		}

		console.log(`📸 Найдено ${imageFiles.length} изображений`)

		// Импортируем каждое фото
		for (const file of imageFiles) {
			const relativePath = `uploads/gallery/${file}`
			const title = file
				.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
				.replace(/[_-]/g, ' ')

			// Проверяем, не добавлено ли уже
			const existing = await Gallery.findOne({
				where: { image_url: relativePath },
			})

			if (existing) {
				console.log(`⏭️  Пропущено (уже есть): ${file}`)
				continue
			}

			// Создаём запись
			await Gallery.create({
				title: title,
				description: 'Импортировано из uploads/gallery',
				image_url: relativePath,
				background_gradient: null,
				crop_data: null,
			})

			console.log(`✅ Добавлено: ${file}`)
		}

		console.log('\n🎉 Импорт завершён!')

		// Показываем статистику
		const total = await Gallery.count()
		console.log(`📊 Всего фото в галерее: ${total}`)
	} catch (error) {
		console.error('❌ Ошибка импорта:', error)
	}
}

// Запускаем импорт
importGalleryPhotos()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
