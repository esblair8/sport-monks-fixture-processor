module.exports.reformatFixture = fixture => {

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
            ...manipulateMatchOddsData(data)
        },
        correctScoreOdds: {
            ...manipulateCorrectScoreOdds(data)
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