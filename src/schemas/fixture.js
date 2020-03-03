const mongoose = require('mongoose')

module.exports = new mongoose.model('Fixture', {
    leagueId: String,
    fixtureId: String,
    time: String,
    localTeam: String,
    localTeamId: String,
    visitorTeam: String,
    visitorTeamId: String,
    halfTimeScore: String,
    fullTimeScore: String,
    topPredictedScore: String,
    predictions: Object,
    predicted1X2: String,
    actual1X2: String,
    predicted1X2Correct: Boolean,
    actualScoreInTopPredictions: Boolean,
    topPredictedScoreCorrect: Boolean,
    predictedScoresOver5: Array,
    betfairOdds: {
        matchOdds: {
            homeWinOdds: Number,
            awayWinOdds: Number,
            drawOdds: Number
        },
        correctScoreOdds: Object
    }
})