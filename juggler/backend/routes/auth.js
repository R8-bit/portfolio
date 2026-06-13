const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Admin } = require('../database')
const { JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// Login endpoint
router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body

		if (!username || !password) {
			return res.status(400).json({ error: 'Username and password required' })
		}

		// Find admin user
		const admin = await Admin.findOne({ where: { username } })

		if (!admin) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, admin.password)

		if (!isValidPassword) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: admin.id, username: admin.username },
			JWT_SECRET,
			{ expiresIn: '24h' },
		)

		// Set httpOnly cookie
		res.cookie('auth_token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // HTTPS only in production
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			sameSite: 'strict',
		})

		res.json({ success: true, username: admin.username })
	} catch (err) {
		console.error('Login error:', err)
		res.status(500).json({ error: 'Server error' })
	}
})

// Logout endpoint
router.post('/logout', (req, res) => {
	res.clearCookie('auth_token')
	res.json({ success: true })
})

// Verify token endpoint
router.get('/verify', (req, res) => {
	const token = req.cookies.auth_token

	if (!token) {
		return res.status(401).json({ authenticated: false })
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET)
		res.json({ authenticated: true, username: decoded.username })
	} catch (err) {
		res.status(401).json({ authenticated: false })
	}
})

module.exports = router
