const { Sequelize, DataTypes } = require('sequelize')
const path = require('path')

// Adjusted path to DB since we are running from backend dir
const dbPath = path.join(__dirname, 'database/juggler.sqlite')
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: dbPath,
	logging: console.log,
})

async function checkSchema() {
	try {
		await sequelize.authenticate()
		console.log('Connection has been established successfully.')

		const [results, metadata] = await sequelize.query(
			'PRAGMA table_info(Videos);',
		)
		console.log(
			'Videos table columns:',
			results.map(c => c.name),
		)

		const [gResults] = await sequelize.query('PRAGMA table_info(Galleries);')
		console.log(
			'Galleries table columns:',
			gResults.map(c => c.name),
		)
	} catch (error) {
		console.error('Unable to connect to the database:', error)
	} finally {
		await sequelize.close()
	}
}

checkSchema()
