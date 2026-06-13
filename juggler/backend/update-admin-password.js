const bcrypt = require('bcryptjs')
const { Admin } = require('./database')

async function updateAdminPassword() {
	try {
		// Настройки - измените здесь
		const oldUsername = 'admin' // Текущий логин в базе
		const newUsername = 'Juggler' // Новый логин
		const newPassword = 'Juggler50' // Новый пароль

		// Найти админа по старому логину
		const admin = await Admin.findOne({ where: { username: oldUsername } })

		if (!admin) {
			console.log(`❌ Админ с логином "${oldUsername}" не найден`)
			process.exit(1)
		}

		// Хешировать новый пароль
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Обновить логин и пароль
		await admin.update({
			username: newUsername,
			password: hashedPassword,
		})

		console.log('✅ Логин и пароль успешно обновлены!')
		console.log(`New Username: ${newUsername}`)
		console.log(`New Password: ${newPassword}`)
		process.exit(0)
	} catch (err) {
		console.error('Ошибка обновления пароля:', err)
		process.exit(1)
	}
}

updateAdminPassword()
