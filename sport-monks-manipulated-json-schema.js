var json = {
	leagueid: string,
	fixtureid: string,
	datetime: string,
	localteam: string,
	localteamid: string,
	visitorteamid: string,
	visitorteam: string,
	htscore: string,
	ftscore: string,
	toppredictedscore: string,
	predictions: {
		ftover0_5 : double,
		ftover1_5 : double,
		ftunder0_5 : double,
		ftunder15 : double,
		htover0_5 : double,
		htover1_5 : double,
		htunder0_5 : double,
		htunder1_5 : double,
		over2_5 : double,
		over3_5 : double,
		under2_5 : double,
		draw : double,
		home : double,
		away : double,
		btts : double,
		correctScore: {
			scoreline: odds,
		  	scoreline: odds,
		   	scoreline: odds,
		   	etc: etc	
		},
	},
	predicted1x2: string,
	actual1x2: string,
	predicted1x2correct: string,
	odds: {
		matchodds: {
			homewinodds: double,
			awaywinodds: double,
			drawodds: double
		},
		correctscoreodds: {
			scoreline: odds,
		  	scoreline: odds,
		   	scoreline: odds,
		   	etc: etc	
		}
	}	
}