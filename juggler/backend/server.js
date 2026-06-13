require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const db = require('./database')
const apiRoutes = require('./routes/api')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({ credentials: true, origin: true })) // Enable credentials for cookies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // Parse cookies

// Static files for uploads (serving from root/uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')))

// Routes
app.use('/api/auth', authRoutes) // Auth routes (login, logout, verify)
app.use('/api', apiRoutes)

// Base route (optional, but good for checking API status)
app.get('/api-status', (req, res) => {
	res.json({ message: 'Juggler API is running' })
})

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
