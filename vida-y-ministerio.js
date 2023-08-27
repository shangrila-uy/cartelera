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
	var header = $(".header");
	var event = $(".event");
	var phoneLink = "https://wa.me/598";
	var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

	for (var i = 55; i < meetingsData.values.length; i++) {
		var entry = meetingsData.values[i];
		var day = entry["D".ord()];
		var splittedDay = day.split(" ")[1].split("/");
		var date = new Date(2023, splittedDay[1] - 1, splittedDay[0]);
		if (date >= today && entry["E".ord()] != '') {
			if (formattedData[date] === undefined) {
				formattedData[date] = [];
			}
			if (isNaN(entry["E".ord()])) {
				formattedData[date].push({
					"special-event": entry["E".ord()]
				});
				continue;
			}
			formattedData[date].push(
				{
					"chairman-A": entry["F".ord()],
					"chairman-B": entry["G".ord()],
					"treasures-talk": entry["I".ord()],
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
	var lastMonth = 0;

	for (var day in formattedData) {
		var date = new Date(day);
		var item = event.clone();
		
		if (date.getMonth() != lastMonth) {
			var month = header.clone();
			fill(
				month, 
				".month", 
				date.toLocaleString('es', {  month: 'long' }).replace("septiembre", "setiembre").toUpperCase() + " " + date.getFullYear()
			);
			month.show();
			$("#table").append(month);
			lastMonth = date.getMonth()
		}
		
		fill(item, ".date", date.toLocaleString('es', {  weekday: 'long' }).toUpperCase());
		fill(item, ".number", date.getDate());
		var dates = formattedData[day];
		var eventRow = item.find(".row").clone();
		item.find(".row").remove();
		
		for (var i in dates) {
			var row = eventRow.clone();
			var date = dates[i];
			
			for (const assignment in date) {
				if (assignment == "special-event") {
					fill(row, ".section." + assignment, date[assignment]);
					row.find(".section,.assignee").hide();
					row.find(".section.special-event").show();
					item.find(".rows").append(row);
					continue;
				}
				fill(row, ".assignee." + assignment, date[assignment]);
				row.find(".section.special-event").hide();
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
