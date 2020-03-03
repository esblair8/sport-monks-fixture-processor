'use strict'
const main = require('./src/controllers/predictionProcessingController')

module.exports.processFixtures = async event => {
  main()
  return { message: 'Fixtures for today have been processed', event }
}
