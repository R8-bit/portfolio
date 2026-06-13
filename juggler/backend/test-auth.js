// Automated Test Script for Authentication
// Run this to verify auth system works

const API_URL = 'http://localhost:3000/api'

async function runTests() {
	console.log('🧪 Starting Authentication Tests...\n')
	let testsPassed = 0
	let testsFailed = 0

	// Test 1: Verify endpoint exists
	console.log('Test 1: Checking /api/auth/verify endpoint...')
	try {
		const res = await fetch(`${API_URL}/auth/verify`)
		if (res.status === 401) {
			console.log(
				'✅ PASS: Endpoint returns 401 for unauthenticated requests\n',
			)
			testsPassed++
		} else {
			console.log(`❌ FAIL: Expected 401, got ${res.status}\n`)
			testsFailed++
		}
	} catch (err) {
		console.log(`❌ FAIL: ${err.message}\n`)
		testsFailed++
	}

	// Test 2: Login with wrong credentials
	console.log('Test 2: Login with WRONG credentials...')
	try {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
		})
		const data = await res.json()
		if (res.status === 401 && data.error) {
			console.log('✅ PASS: Returns 401 with error message\n')
			testsPassed++
		} else {
			console.log(`❌ FAIL: Expected 401, got ${res.status}\n`)
			testsFailed++
		}
	} catch (err) {
		console.log(`❌ FAIL: ${err.message}\n`)
		testsFailed++
	}

	// Test 3: Login with correct credentials
	console.log('Test 3: Login with CORRECT credentials (Juggler/Juggler50)...')
	try {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ username: 'Juggler', password: 'Juggler50' }),
		})
		const data = await res.json()

		if (res.ok && data.success) {
			console.log('✅ PASS: Login successful\n')
			testsPassed++

			// Test 4: Check if we're authenticated now
			console.log('Test 4: Verify token after login...')
			const verifyRes = await fetch(`${API_URL}/auth/verify`, {
				credentials: 'include',
			})
			const verifyData = await verifyRes.json()

			if (verifyData.authenticated && verifyData.username === 'Juggler') {
				console.log('✅ PASS: Token verification successful\n')
				testsPassed++
			} else {
				console.log('❌ FAIL: Token verification failed\n')
				testsFailed++
			}

			// Test 5: Logout
			console.log('Test 5: Testing logout...')
			const logoutRes = await fetch(`${API_URL}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			})
			const logoutData = await logoutRes.json()

			if (logoutData.success) {
				console.log('✅ PASS: Logout successful\n')
				testsPassed++

				// Test 6: Verify we're logged out
				console.log('Test 6: Verify token after logout...')
				const verifyAfterLogout = await fetch(`${API_URL}/auth/verify`, {
					credentials: 'include',
				})

				if (verifyAfterLogout.status === 401) {
					console.log('✅ PASS: Token cleared after logout\n')
					testsPassed++
				} else {
					console.log('❌ FAIL: Still authenticated after logout\n')
					testsFailed++
				}
			} else {
				console.log('❌ FAIL: Logout failed\n')
				testsFailed++
			}
		} else {
			console.log(`❌ FAIL: Login failed - ${data.error}\n`)
			testsFailed++
		}
	} catch (err) {
		console.log(`❌ FAIL: ${err.message}\n`)
		testsFailed++
	}

	// Summary
	console.log('═══════════════════════════════════════')
	console.log(`Tests Passed: ${testsPassed}/${testsPassed + testsFailed}`)
	console.log(`Tests Failed: ${testsFailed}/${testsPassed + testsFailed}`)
	console.log('═══════════════════════════════════════')

	if (testsFailed === 0) {
		console.log(
			'🎉 All tests passed! Authentication system is working correctly.',
		)
	} else {
		console.log('⚠️  Some tests failed. Please check the logs above.')
	}
}

runTests()
