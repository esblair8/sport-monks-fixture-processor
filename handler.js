'use strict'
const main = require('./src/index')

module.exports.processFixtures = async event => {
  main()
  return { message: 'Fixtures for today have been processed', event }
}
