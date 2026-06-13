const { Sequelize, DataTypes } = require('sequelize')
const path = require('path')

const dbPath = path.join(__dirname, 'database/juggler.sqlite')
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: dbPath,
	logging: console.log,
})

async function migrate() {
	try {
		await sequelize.authenticate()
		console.log('Connected to DB.')

		const queryInterface = sequelize.getQueryInterface()

		// Check and add columns for Videos
		console.log('Checking Videos table...')
		const [vCols] = await sequelize.query('PRAGMA table_info(Videos);')
		const vColNames = vCols.map(c => c.name)

		if (!vColNames.includes('category')) {
			console.log('Adding "category" to Videos...')
			await queryInterface.addColumn('Videos', 'category', {
				type: DataTypes.STRING,
				defaultValue: 'video_page',
				allowNull: false,
			})
		}

		if (!vColNames.includes('crop_data')) {
			console.log('Adding "crop_data" to Videos...')
			await queryInterface.addColumn('Videos', 'crop_data', {
				type: DataTypes.TEXT,
			})
		}

		if (!vColNames.includes('order')) {
			console.log('Adding "order" to Videos...')
			await queryInterface.addColumn('Videos', 'order', {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			})
		}

		// Check and add columns for Galleries
		console.log('Checking Galleries table...')
		const [gCols] = await sequelize.query('PRAGMA table_info(Galleries);')
		const gColNames = gCols.map(c => c.name)

		if (!gColNames.includes('order')) {
			console.log('Adding "order" to Galleries...')
			await queryInterface.addColumn('Galleries', 'order', {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			})
		}

		// Ensure title is nullable in Galleries if needed (SQLite ALTER COLUMN is limited, but we can try)
		// Actually, we can't easily change allowNull in SQLite without recreating table.
		// But since we are providing a default title in API, we might be fine if we just don't touch strict schema constraint if it exists.
		// Let's just focus on adding missing columns for now.

		console.log('Migration completed successfully.')
	} catch (error) {
		console.error('Migration failed:', error)
	} finally {
		await sequelize.close()
	}
}

migrate()
