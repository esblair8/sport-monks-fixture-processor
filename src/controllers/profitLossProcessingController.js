//===================================
// NEED TO INTEGRATE WITH MONGOOSE 
//========================================

var STARTINGBALANCE = 1000;

var cumulativeProfitLossDocs = db.fixtures.aggregate( [ 
	{ 
		$group: 
		{ 
			_id : "$time", 
			sumOfDutchingOutcomePerDay: { 
				$sum : "$correctScoreDutchingOutcome"  
			} 
		} 
	},
	{
	    $sort : { _id : 1 } 
	}

] ).map(doc => {STARTINGBALANCE += doc.sumOfDutchingOutcomePerDay; return Object.assign(doc, { cumulativeAmount: STARTINGBALANCE }); })

db.cumulativeProfitLoss.save(cumulativeProfitLossDocs)