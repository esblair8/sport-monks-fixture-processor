'use strict'
require('dotenv').config()
const mongoose = require('mongoose')
const connectToDatabase = require('../database/connection')
const SportmonksApi = require('../services/sportmonks')
const FixtureModel = require('../schemas/fixture')
const jsonFormatHelper = require('../utils/jsonFormatHelper')
const sportmonksClient = new SportmonksApi(process.env.SPORTMONKS_API_KEY)
const startDate = process.argv[2]
const endDate = process.argv[3]


// mongoose.Promise = global.Promise
// const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CONNECTION_STRING}`
// mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
// mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))

const main = async () => {
	await connectToDatabase(mongoose)
	await startPredictionProcessing(1)
	 mongoose.disconnect()
}

const startPredictionProcessing = async (currentPage) => {
	const fixtures = await sportmonksClient.get('v2.0/fixtures/between/{from}/{to}', {
		from: startDate,
		to: endDate,
		page: currentPage,
		bookmakers: process.env.BOOKMAKER_IDS.split(','),
		markets: process.env.MARKET_IDS.split(','),
		includes: {
			probability: true,
			localTeam: true,
			visitorTeam: true,
			flatOdds: true
		}
	})
	const processedFixtures = fixtures.data.map(fixture => jsonFormatHelper.reformatFixture(fixture))
	const numberOfPages = fixtures.meta.pagination.total_pages
	await saveFixturesToDb(processedFixtures, currentPage, numberOfPages)
	if (currentPage < numberOfPages) await startPredictionProcessing(currentPage + 1)
	else return
}

const saveFixturesToDb = async (fixtures, currentPage, numberOfPages) => {
	if (fixtures && fixtures.length) {
		FixtureModel.collection.insertMany(fixtures, err => {
			if (err) return console.error(err)
			else console.log(`page ${currentPage} of ${numberOfPages} for date ${endDate} inserted into collection`)
		})
	}
}

// module.exports = main
main()