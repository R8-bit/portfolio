const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')

const API_URL = 'http://localhost:3000/api'

async function testUpload() {
	try {
		// Create a dummy file
		const dummyPath = path.join(__dirname, 'test_image.txt')
		fs.writeFileSync(dummyPath, 'This is a test image content')

		const formData = new FormData()
		formData.append('title', 'Test Photo')
		formData.append('description', 'Testing upload')
		formData.append('imageFile', fs.createReadStream(dummyPath))

		console.log('Sending POST to ' + API_URL + '/gallery')
		const res = await fetch(`${API_URL}/gallery`, {
			method: 'POST',
			body: formData,
		})

		const text = await res.text()
		console.log('Response Status:', res.status)
		console.log('Response Body:', text)

		if (res.ok) {
			console.log('✅ Upload successful!')
		} else {
			console.error('❌ Upload failed.')
		}

		// Clean up
		fs.unlinkSync(dummyPath)
	} catch (err) {
		console.error('Error:', err)
	}
}

testUpload()
