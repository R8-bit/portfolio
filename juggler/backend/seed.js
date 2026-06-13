// Скрипт для наполнения базы данных тестовыми данными
const db = require('./database')

async function seedDatabase() {
	console.log('🌱 Наполнение базы данных тестовыми данными...\n')

	try {
		// 1. Видео (если нет)
		const videoCount = await db.Video.count()
		if (videoCount === 0) {
			console.log('🎥 Добавление тестовых видео...')
			await db.Video.bulkCreate([
				{
					title: 'Закат над океаном',
					description: 'Красивый таймлапс заката.',
					duration: '0:15',
					url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
				},
				{
					title: 'Утренняя зарядка',
					description: 'Энергичное начало дня.',
					duration: '0:12',
					url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
				},
				{
					title: 'Природа и горы',
					description: 'Путешествие в горы.',
					duration: '0:15',
					url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
				},
			])
			console.log('✅ Видео добавлены\n')
		} else {
			console.log('ℹ️  Видео уже существуют\n')
		}

		// 2. Фото (если нет)
		const galleryCount = await db.Gallery.count()
		if (galleryCount === 0) {
			console.log('📸 Добавление тестовых фото...')
			await db.Gallery.bulkCreate([
				{
					title: 'Абстракция 1',
					description: 'Яркие краски',
					image_url: 'https://picsum.photos/id/20/800/600',
					background_gradient:
						'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
				},
				{
					title: 'Неон',
					description: 'Городской стиль',
					image_url: 'https://picsum.photos/id/10/800/600',
					background_gradient:
						'linear-gradient(135deg, #c31432 0%, #240b36 100%)',
				},
				{
					title: 'Технологии',
					description: 'Будущее рядом',
					image_url: 'https://picsum.photos/id/48/800/600',
					background_gradient:
						'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 100%)',
				},
			])
			console.log('✅ Фото добавлены\n')
		} else {
			console.log('ℹ️  Фото уже существуют\n')
		}

		// 3. Социальные сети
		const socialCount = await db.SocialLink.count()
		if (socialCount === 0) {
			console.log('📱 Добавление социальных сетей...')
			await db.SocialLink.bulkCreate([
				{
					name: 'Instagram',
					url: 'https://instagram.com/juggler_show',
					icon: 'instagram',
					isActive: true,
					order: 1,
				},
				{
					name: 'Telegram',
					url: 'https://t.me/juggler_show',
					icon: 'telegram',
					isActive: true,
					order: 2,
				},
				{
					name: 'YouTube',
					url: 'https://youtube.com/@juggler_show',
					icon: 'youtube',
					isActive: true,
					order: 3,
				},
				{
					name: 'Threads',
					url: 'https://www.threads.net/@juggler_show',
					icon: 'threads',
					isActive: true,
					order: 4,
				},
				{
					name: 'X',
					url: 'https://x.com/juggler_show',
					icon: 'x',
					isActive: false,
					order: 5,
				},
			])
			console.log('✅ Социальные сети добавлены\n')
		} else {
			console.log('ℹ️  Социальные сети уже существуют\n')
		}

		// 4. Ссылка на билеты
		const ticketCount = await db.TicketLink.count()
		if (ticketCount === 0) {
			console.log('🎫 Добавление ссылки на билеты...')
			await db.TicketLink.create({
				url: 'https://example.com/tickets',
				label: 'Купить билеты',
				isActive: true,
			})
			console.log('✅ Ссылка на билеты добавлена\n')
		} else {
			console.log('ℹ️  Ссылка на билеты уже существует\n')
		}

		// 5. Контакты
		const contactCount = await db.Contact.count()
		if (contactCount === 0) {
			console.log('📞 Добавление контактов...')
			await db.Contact.bulkCreate([
				{ type: 'email', value: 'info@juggler-show.ru', label: 'Email' },
				{ type: 'phone', value: '+7 (999) 123-45-67', label: 'Телефон' },
				{
					type: 'address',
					value: 'Москва, ул. Примерная, д. 1',
					label: 'Адрес',
				},
			])
			console.log('✅ Контакты добавлены\n')
		} else {
			console.log('ℹ️  Контакты уже существуют\n')
		}

		// 6. Footer ссылки
		const footerCount = await db.FooterLink.count()
		if (footerCount === 0) {
			console.log('🔗 Добавление footer ссылок...')
			await db.FooterLink.bulkCreate([
				{ text: 'Главная', url: 'index.html', order: 1 },
				{ text: 'Видео', url: 'video.html', order: 2 },
				{ text: 'Галерея', url: 'gallery.html', order: 3 },
				{ text: 'Связь с нами', url: 'contact.html', order: 4 },
			])
			console.log('✅ Footer ссылки добавлены\n')
		} else {
			console.log('ℹ️  Footer ссылки уже существуют\n')
		}

		// 7. Настройки
		const settingCount = await db.Setting.count()
		if (settingCount === 0) {
			console.log('⚙️ Добавление настроек...')
			await db.Setting.bulkCreate([
				{ key: 'video_duration', value: '5' },
				{ key: 'photo_duration', value: '5' },
				{ key: 'site_name', value: 'JUGGLER' },
			])
			console.log('✅ Настройки добавлены\n')
		} else {
			console.log('ℹ️  Настройки уже существуют\n')
		}

		// 8. Начальная статистика
		const today = new Date().toISOString().split('T')[0]
		const statExists = await db.SiteStat.findOne({ where: { date: today } })
		if (!statExists) {
			console.log('📊 Инициализация статистики...')
			await db.SiteStat.create({
				date: today,
				visits: 0,
			})
			console.log('✅ Статистика инициализирована\n')
		} else {
			console.log('ℹ️  Статистика уже инициализирована\n')
		}

		console.log('🎉 База данных успешно проверена и заполнена!')
		console.log('\n📋 В базе данных:')
		console.log(`  - Видео: ${await db.Video.count()}`)
		console.log(`  - Фото: ${await db.Gallery.count()}`)
		console.log(`  - Социальные сети: ${await db.SocialLink.count()}`)
		console.log(`  - Ссылки на билеты: ${await db.TicketLink.count()}`)
		console.log(`  - Контакты: ${await db.Contact.count()}`)
		console.log(`  - Footer ссылки: ${await db.FooterLink.count()}`)
		console.log(`  - Настройки: ${await db.Setting.count()}`)
		console.log(`  - Заявки: ${await db.ContactForm.count()}`)
		console.log(`  - События: ${await db.Event.count()}\n`)
	} catch (error) {
		console.error('❌ Ошибка при наполнении базы данных:', error)
	} finally {
		process.exit()
	}
}

// Запуск скрипта
seedDatabase()
