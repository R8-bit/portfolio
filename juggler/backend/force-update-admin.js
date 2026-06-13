const bcrypt = require('bcryptjs')
const { Admin } = require('./database')

async function forceSetAdmin() {
	try {
		const targetUsername = 'Juggler'
		const targetPassword = 'Juggler50'

		console.log(`🔒 Starting credentials update...`)
		console.log(`Target Username: ${targetUsername}`)

		// 1. Try to find existing 'Juggler'
		let admin = await Admin.findOne({ where: { username: targetUsername } })

		if (admin) {
			console.log(
				`✓ Found existing user '${targetUsername}'. Updating password...`,
			)
		} else {
			// 2. Try to find 'admin' to rename
			console.log(
				`— User '${targetUsername}' not found. Checking for 'admin'...`,
			)
			admin = await Admin.findOne({ where: { username: 'admin' } })

			if (admin) {
				console.log(
					`✓ Found user 'admin'. Renaming to '${targetUsername}' and updating password...`,
				)
			} else {
				console.log(
					`— User 'admin' not found. Creating new user '${targetUsername}'...`,
				)
			}
		}

		// Hash the password
		console.log(`🔑 Hashing password...`)
		const hashedPassword = await bcrypt.hash(targetPassword, 10)

		// Verify hash format
		if (
			hashedPassword.startsWith('$2a$') ||
			hashedPassword.startsWith('$2b$')
		) {
			console.log(`✓ Password hashed successfully (Bcrypt format detected)`)
			console.log(`  Hash sample: ${hashedPassword.substring(0, 10)}...`)
		} else {
			console.error(`❌ ERROR: Password hashing failed or format incorrect!`)
			process.exit(1)
		}

		if (admin) {
			// Update existing
			await admin.update({
				username: targetUsername,
				password: hashedPassword,
			})
		} else {
			// Create new
			await Admin.create({
				username: targetUsername,
				password: hashedPassword,
			})
		}

		console.log(`\n✅ SUCCESS! Credentials updated.`)
		console.log(`Login: ${targetUsername}`)
		console.log(`Password: ${targetPassword}`)
		console.log(`Hash stored in DB: ${hashedPassword}`)

		// Additional verification: Compare
		const isMatch = await bcrypt.compare(targetPassword, hashedPassword)
		console.log(`\n🔍 Verification Test:`)
		console.log(`bcrypt.compare('${targetPassword}', hash) -> ${isMatch}`)

		if (isMatch) {
			console.log(
				`✓ Hash verification passed. Authentication should work correctly.`,
			)
		} else {
			console.error(`❌ Hash verification FAILED.`)
		}

		process.exit(0)
	} catch (err) {
		console.error('❌ Error:', err)
		process.exit(1)
	}
}

forceSetAdmin()
