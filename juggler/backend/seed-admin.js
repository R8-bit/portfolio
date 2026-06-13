const bcrypt = require('bcryptjs')
const { Admin } = require('./database')

async function createAdminUser() {
	try {
		// Check if admin already exists
		const existingAdmin = await Admin.findOne({ where: { username: 'admin' } })

		if (existingAdmin) {
			console.log('Admin user already exists')
			return
		}

		// Hash password
		const hashedPassword = await bcrypt.hash('admin123', 10)

		// Create admin user
		await Admin.create({
			username: 'admin',
			password: hashedPassword,
		})

		console.log('✅ Admin user created successfully!')
		console.log('Username: admin')
		console.log('Password: admin123')
		process.exit(0)
	} catch (err) {
		console.error('Error creating admin user:', err)
		process.exit(1)
	}
}

createAdminUser()
