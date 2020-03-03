'use strict'
require('dotenv').config()

const mongoose = require('mongoose');
const FixtureSchema = require('./fixtureSchema')
const FixtureModel = mongoose.model('Fixture', FixtureSchema)
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CONNECTION_STRING}`, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const SportmonksApi = require('sportmonks').SportmonksApi
const sportmonks = new SportmonksApi(process.env.SPORTMONKS_API_KEY)

const startDate = process.argv[2]
const endDate = process.argv[3]
console.log(startDate, endDate)

const moment = require('moment')
const dates = fetchDateRange(startDate, endDate)


dates.forEach(date =>  startPredictionProcessing(date))

// dates.forEach(date=> startPredictionProcessing(date))

function fetchDateRange(startDate, stopDate) {
  var dateArray = []
  var currentDate = moment(startDate)
  var stopDate = moment(stopDate)
  while (currentDate <= stopDate) {
    dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
    currentDate = moment(currentDate).add(1, 'days')
  }
  return dateArray
}

async function startPredictionProcessing(date) {
  const fixtures = await sportmonks.get('v2.0/fixtures/between/{from}/{to}', {
    from: startDate,
    to: date,
    probability: true,
    localTeam: true,
    visitorTeam: true,
    flatOdds: true
  })

  const reformattedFixtures = fixtures.data.map(fixture => reformatFixture(fixture))
  var count = 0;
  reformattedFixtures.forEach(fixture => {
    count++
    console.log(fixture.fixtureId, 'retrieved from sport monks')
    new FixtureModel(fixture).save((err, fixture) => {
      if (err) return console.error(err)
      console.log(fixture.fixtureId, 'saved to fixture collection')
    })
  })
}

const reformatFixture = fixture => {

  const flatOdds = fixture.flatOdds.data
  const fullTimeScore = fixture.scores.ft_score
  const predictions = fixture.probability.data.predictions
  const topPredictedScore = getTopPredictedScore(fixture.probability.data.predictions.correct_score)
  const predicted1X2 = predictedHomeWinAwayWinOrDraw(topPredictedScore)
  const actual1X2 = predictedHomeWinAwayWinOrDraw(fullTimeScore)
  const predicted1X2Correct = isPredictionCorrect(predicted1X2, actual1X2)
  const predictedScoresOver5 = getPredictedScoresOver5(predictions.correct_score)
  const actualScoreInTopPredictions = isFtScorePredictionInListOfTopPredictedScores(fullTimeScore, predictedScoresOver5)
  const betfairOdds = manipulateBookmakerData(flatOdds)
  const topPredictedScoreCorrect = isPredictionCorrect(topPredictedScore, fullTimeScore)

  return {
    leagueId: fixture.league_id,
    fixtureId: fixture.id,
    time: fixture.time.starting_at.date_time,
    localTeam: fixture.localTeam.data.name,
    localTeamId: fixture.localTeam.data.id,
    visitorTeam: fixture.visitorTeam.data.name,
    visitorTeamId: fixture.visitorTeam.data.id,
    halfTimeScore: fixture.scores.ht_score,
    fullTimeScore,
    topPredictedScore,
    predicted1X2,
    actual1X2,
    predicted1X2Correct,
    actualScoreInTopPredictions,
    predictedScoresOver5,
    topPredictedScoreCorrect,
    predictions,
    betfairOdds
  }
}

const manipulateBookmakerData = data => {
  const filteredBookieData = data.filter(bookie => bookie.bookmaker_id === 15 && (bookie.market_id === 975909 || bookie.market_id === 1))

  return {
    matchOdds: {
      ...manipulateMatchOddsData(filteredBookieData)
    },
    correctScoreOdds: {
      ...manipulateCorrectScoreOdds(filteredBookieData)
    }
  }
}

const manipulateMatchOddsData = (data) => {
  try {
    return {
      homeWinOdds: data[0]['odds'][0]['dp3'],
      awayWinOdds: data[0]['odds'][1]['dp3'],
      drawOdds: data[0]['odds'][2]['dp3']
    }
  } catch (e) {
    console.error('no match odds data available')
    return {}
  }
}
const isFtScorePredictionInListOfTopPredictedScores = (ftScore, topPredictions) => {
  return topPredictions.includes(ftScore)
}

const isPredictionCorrect = (prediction, actual) => {
  return prediction === actual
}

const getTopPredictedScore = correct_score_predictions => {
  return Object.keys(correct_score_predictions).reduce((a, b) => correct_score_predictions[a] > correct_score_predictions[b] ? a : b)
}
const getPredictedScoresOver5 = correct_score_predictions => {
  return Object.keys(correct_score_predictions).filter(a => correct_score_predictions[a] > process.env.CS_PROBABILITY_THRESHOLD)
}

const predictedHomeWinAwayWinOrDraw = scoreLine => {
  if (!scoreLine)
    return null
  const scorelineArr = scoreLine.split('-')
  if (scorelineArr[0] === scorelineArr[1])
    return 'draw'
  else if (scorelineArr[0] > scorelineArr[1])
    return 'home'
  else
    return 'away'
}

const manipulateCorrectScoreOdds = data => {
  try {
    let reducedData = data[1]['odds'].reduce((obj, item) => (obj[item.label.replace(':', '-')] = Number(item['dp3']), obj), {})
    const orderedData = {}
    Object.keys(reducedData).sort().forEach(function (key) { orderedData[key] = reducedData[key] })
    return orderedData;
  } catch (e) {
    console.error('no correct score odds data available')
    return {}
  }
}
