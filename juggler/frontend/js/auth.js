// Authentication Logic for Admin Panel (Server-side)

const API_URL = 'http://localhost:3000/api'

// Check authentication (server-side)
async function checkAuth() {
	try {
		const response = await fetch(`${API_URL}/auth/verify`, {
			credentials: 'include', // Include cookies
		})

		if (!response.ok) {
			window.location.href = 'login.html'
			return false
		}

		const data = await response.json()
		return data.authenticated
	} catch (err) {
		console.error('Auth check error:', err)
		window.location.href = 'login.html'
		return false
	}
}

// Handle login form submission
if (window.location.pathname.includes('login.html')) {
	// Check if already authenticated
	fetch(`${API_URL}/auth/verify`, { credentials: 'include' })
		.then(res => res.json())
		.then(data => {
			if (data.authenticated) {
				window.location.href = 'admin.html'
			}
		})
		.catch(() => {})

	document
		.getElementById('loginForm')
		?.addEventListener('submit', async function (e) {
			e.preventDefault()

			const username = document.getElementById('username').value
			const password = document.getElementById('password').value
			const errorMessage = document.getElementById('errorMessage')

			try {
				const response = await fetch(`${API_URL}/auth/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include', // Include cookies
					body: JSON.stringify({ username, password }),
				})

				const data = await response.json()

				if (response.ok && data.success) {
					// Successful login
					window.location.href = 'admin.html'
				} else {
					// Failed login
					errorMessage.textContent = data.error || 'Неверный логин или пароль'
					errorMessage.classList.add('show')

					// Clear error after 3 seconds
					setTimeout(() => {
						errorMessage.classList.remove('show')
					}, 3000)

					// Clear password field
					document.getElementById('password').value = ''
				}
			} catch (err) {
				console.error('Login error:', err)
				errorMessage.textContent = 'Ошибка подключения к серверу'
				errorMessage.classList.add('show')
			}
		})
}

// Logout function
async function logout() {
	try {
		await fetch(`${API_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		})
		window.location.href = 'login.html'
	} catch (err) {
		console.error('Logout error:', err)
		window.location.href = 'login.html'
	}
}

// Export for use in admin.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { checkAuth, logout }
} else {
	// For browser environment
	window.checkAuth = checkAuth
	window.logout = logout
}
