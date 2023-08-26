String.prototype.ord = function() {
	var index = this.charCodeAt(0) - 65;

	if (this.length === 1) {
		return index;
	}

	return (index + 1) * 26 + this.charCodeAt(1) - 65;
};

function fill(item, selector, content) {
	var field = item.find(selector);
	
	if (content == null || content.length == 0) {
		field.hide();
		return;
	}
	
	if (Array.isArray(content) && content.every(element => element === '')) {
		field.hide();
		return;
	}
	
	if (Array.isArray(content)) {
		field.find(".value").html(content.join("<br />"));
		return;
	}
	
	field.find(".value").text(content);
}


function processData(meetingsRequest) {
	var meetingsData = JSON.parse(meetingsRequest.responseText);
	var formattedData = {};
	var template = $(".event");
	var phoneLink = "https://wa.me/598";
	var today = new Date(1900 + new Date().getYear(), new Date().getMonth(), new Date().getDate());

	for (var i = 55; i < meetingsData.values.length; i++) {
		var entry = meetingsData.values[i];
		var day = entry["D".ord()];
		var splittedDay = day.split(" ")[1].split("/");
		var date = new Date(2023, splittedDay[1] - 1, splittedDay[0]);
		if (date >= today && entry["E".ord()] != '') {
			if (formattedData[date] === undefined) {
				formattedData[date] = [];
			}
			formattedData[date].push(
				{
					"chairman-A": entry["F".ord()],
					"chairman-B": entry["G".ord()],
					"treasures": entry["I".ord()],
					"pearls": entry["K".ord()],
					"bible-reading-A": entry["M".ord()],
					"bible-reading-B": entry["N".ord()],
					"teachers-video": entry["O".ord()],
					"initial-call-1-A": [ entry["Q".ord()], entry["R".ord()] ], 
					"initial-call-1-B": [ entry["S".ord()], entry["T".ord()] ], 
					"initial-call-2-A": [ entry["V".ord()], entry["W".ord()] ],
					"initial-call-2-B": [ entry["X".ord()], entry["Y".ord()] ],
					"return-visit-1-A": [ entry["AA".ord()], entry["AB".ord()] ],
					"return-visit-1-B": [ entry["AC".ord()], entry["AD".ord()] ],
					"return-visit-2-A": [ entry["AF".ord()], entry["AG".ord()] ],
					"return-visit-2-A": [ entry["AH".ord()], entry["AI".ord()] ],
					"bible-study-A": [ entry["AK".ord()], entry["AL".ord()] ],
					"bible-study-B": [ entry["AM".ord()], entry["AN".ord()] ],
					"student-talk-A": entry["AP".ord()],
					"student-talk-B": entry["AQ".ord()],
					"living-part-1": entry["AT".ord()],
					"living-part-2": entry["AV".ord()],
					"congregation-study-conductor": entry["AX".ord()],
					"congregation-study-reader": entry["AY".ord()],
					"final-prayer": entry["BA".ord()]
				}
			);
		}
	}

	console.log(formattedData);

	for (var day in formattedData) {
		var date = new Date(day);
		var item = template.clone();
		fill(item, ".date", date.toLocaleString('es', {  weekday: 'long' }));
		fill(item, ".number", date.getDate());
		fill(item, ".month", "de " + date.toLocaleString('es', {  month: 'long' }).replace("septiembre", "setiembre"));
		var dates = formattedData[day];
		var templateRow = item.find(".row").clone();
		item.find(".row").remove();
		
		for (var i in dates) {
			var row = templateRow.clone();
			var date = dates[i];
			
			for (const assignment in date) {
				fill(row, ".assignee." + assignment, date[assignment]);
				item.find(".rows").append(row);
			}
		}
		item.show();
		$("#table").append(item);
		$(".lds-dual-ring").slideUp();
	}
}

function meetings() {
	var meetingsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/programa?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';

	var meetingsRequest = new XMLHttpRequest();
	meetingsRequest.open('GET', meetingsUrl);
	meetingsRequest.onload = function() {
		processData(meetingsRequest);
	}
	meetingsRequest.send();
}
