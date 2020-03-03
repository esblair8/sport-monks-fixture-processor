'use strict'
require('dotenv').config()
const mongoose = require('mongoose')
const db = 
const SportmonksApi = require('./services/sportmonks')
const FixtureModel = require('./schemas/fixtureModel')
const jsonFormatHelper = require('./utils/jsonFormatHelper')
const sportmonksClient = new SportmonksApi(process.env.SPORTMONKS_API_KEY)
const startDate = process.argv[2]
const endDate = process.argv[3]

const main = async () => {
	m
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

module.exports.main = main