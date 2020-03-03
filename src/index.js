'use strict'
require('dotenv').config()

const mongoose = require('mongoose')
const SportmonksApi = require('./services/sportmonks')
const FixtureSchema = require('./schemas/fixtureSchema')
const dateRangeHelper = require('./utils/dateRangeHelper')
const jsonFormatHelper = require('./utils/jsonFormatHelper')

const sportmonks = new SportmonksApi(process.env.SPORTMONKS_API_KEY)
const FixtureModel = mongoose.model('Fixture', FixtureSchema)

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CONNECTION_STRING}`, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'mongodb connection error:'))

const startDate = process.argv[2]
const endDate = process.argv[3]

const main = async () => {
  // const dates = dateRangeHelper.fetchDateRange(startDate, endDate)
  startPredictionProcessing(1)
}

const startPredictionProcessing = async (currentPage) => {
  const fixtures = await sportmonks.get('v2.0/fixtures/between/{from}/{to}', {
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
  saveFixturesToDb(processedFixtures, currentPage, numberOfPages)
  if (currentPage < numberOfPages) startPredictionProcessing(currentPage + 1)
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

main()
