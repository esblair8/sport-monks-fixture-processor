'use strict'
const SportmonksApi = require('sportmonks').SportmonksApi
const sportmonks = new SportmonksApi('84HMehwk80n3kZcF3OpWUYz7x68c6paRh80nftyVfNNq8Fdi9WYXWJKHo8QU')

module.exports.predictions = async (event, context, callback) => {

  const fixtures = await sportmonks.get('v2.0/fixtures/between/{from}/{to}',
    {
      from: '2019-08-01',
      to: '2019-12-30',
      probability: true,
      localTeam: true,
      visitorTeam: true,
      flatOdds: true
    }
  )

  const reformattedFixtures = fixtures.data.map(fixture => reformatFixture(fixture))

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({ data: reformattedFixtures })
  }
  callback(null, response)
}

const reformatFixture = fixture => {
  const fullTimeScore = fixture.scores.ft_score
  const topPredictedScore = getTopPredictedScore(fixture.probability.data.predictions.correct_score)
  const topPredictedScores = getPredictedScoresOver5(fixture.probability.data.predictions.correct_score)
  const predicted1X2 = predictedHomeWinAwayWinOrDraw(topPredictedScore)
  const actual1X2 = predictedHomeWinAwayWinOrDraw(fullTimeScore)
  const actualScoreInTopPredictions = isFtScorePredictionInListOfTopPredictedScores(fullTimeScore, topPredictedScores)
  const predicted1X2Correct = isPredicted1X2Correct(predicted1X2, actual1X2)
  const flatOdds = fixture.flatOdds.data
  console.log(fixture.id, fixture.time)
  return {
    leagueId: fixture.league_id,
    fixtureId: fixture.id,
    time: fixture.time.status.starting_at.date_time,
    localTeam: fixture.localTeam.data.name,
    localTeamId: fixture.localTeam.data.id,
    visitorTeam: fixture.visitorTeam.data.name,
    visitorTeamId: fixture.visitorTeam.data.id,
    htScore: fixture.scores.ht_score,
    ftScore: fullTimeScore,
    topPredictedScore,
    topPredictedScores,
    predicted1X2,
    actual1X2,
    actualScoreInTopPredictions,
    predicted1X2Correct,
    odds: filterBookmakerData(flatOdds)
  }
}

const filterBookmakerData = data => {
  return data.filter(bookie => bookie.bookmaker_id === 15
    && (bookie.market_id === 975909 || bookie.market_id === 1))
}

const isFtScorePredictionInListOfTopPredictedScores = (ftScore, topPredictions) => {
  return topPredictions.includes(ftScore)
}

const isPredicted1X2Correct = (prediction, actual) => {
  return prediction === actual
}

const getTopPredictedScore = correct_score_predictions => {
  return Object.keys(correct_score_predictions).reduce((a, b) => correct_score_predictions[a] > correct_score_predictions[b] ? a : b)
}

const getPredictedScoresOver5 = correct_score_predictions => {
  return Object.keys(correct_score_predictions).filter(a => correct_score_predictions[a] > 5)
  //.map(k => { return { score: k, prediction: correct_score_predictions[k] } })
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
