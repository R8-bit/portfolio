const { Video } = require('./database')

async function checkVideos() {
	try {
		const videos = await Video.findAll({
			limit: 5,
			order: [['id', 'DESC']],
		})

		console.log('--- Last 5 Videos ---')
		videos.forEach(v => {
			console.log(`ID: ${v.id}, Title: ${v.title}, URL: '${v.url}'`)
		})
	} catch (error) {
		console.error(error)
	}
}

checkVideos()
