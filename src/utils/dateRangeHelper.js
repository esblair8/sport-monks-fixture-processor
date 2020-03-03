const moment = require('moment')

module.exports.fetchDateRange = function(startDate, stopDate) {
    var dateArray = []
    var currentDate = moment(startDate)
    var stopDate = moment(stopDate)
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
      currentDate = moment(currentDate).add(1, 'days')
    }
    return dateArray
  }