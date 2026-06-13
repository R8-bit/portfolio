require('dotenv').config({ path: '../.env' })
const nodemailer = require('nodemailer')

async function testEmail() {
	console.log('Testing Email Sending...')
	console.log('Host:', process.env.SMTP_HOST)
	console.log('User:', process.env.SMTP_USER)

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	})

	try {
		await transporter.verify()
		console.log('SMTP Connection Verified!')

		const info = await transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to: process.env.EMAIL_TO,
			subject: 'Test Email from Juggler Debugger',
			text: 'If you see this, email sending is working!',
		})

		console.log('Message sent:', info.messageId)
	} catch (error) {
		console.error('Error:', error)
	}
}

testEmail()
