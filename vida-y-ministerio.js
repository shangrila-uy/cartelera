String.prototype.ord = function() {
	var index = this.charCodeAt(0) - 65;

	if (this.length === 1) {
		return index;
	}

	return (index + 1) * 26 + this.charCodeAt(1) - 65;
};

function fill(item, selector, content) {
	var field = item.find(selector);
	
	if (content == null || content === '') {
		if (selector === '.counselor_B') {
			item.find('.counselor').hide();
			item.find('.chairman .room').hide();
			return;
		}
		field.hide();
		return;
	}
	
	if (Array.isArray(content) && content.every(element => element === '')) {
		field.hide();
		return;
	}
	
	if (Array.isArray(content)) {		
		if (Array.isArray(content[0])) {
			if (content[0].every(element => element === '')) {
				field.hide();
				return;	
			}
			for (var i = 0; i < content.length; i++) {
				var subselector = selector + "_" + (i + 1);
				if (content[i].every(element => element === '')) {
					field.find(subselector).hide();
					field.find(".room").hide();
					return;
				}
				field.find(subselector + " .value").html(content[i].join("<br />"));
			}
			return;
		}
		
		for (var i = 0; i < content.length; i++) {
			var subselector = selector + "_" + (i + 1);
			if (content[i] === '') {
				field.find(subselector).hide();
				field.find(".room").hide();
				return;
			}
			field.find(subselector + " .value").text(content[i]);
		}
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
					"chairman_A": entry["F".ord()],
					"counselor_B": entry["G".ord()],
					"treasures-talk": entry["I".ord()],
					"pearls": entry["K".ord()],
					"bible-reading": [ entry["M".ord()], entry["N".ord()] ],
					"teachers-video": entry["O".ord()],
					"initial-call-1": [ 
						[ entry["Q".ord()], entry["R".ord()] ], 
						[ entry["S".ord()], entry["T".ord()] ]
					], 
					"initial-call-2": [
						[ entry["V".ord()], entry["W".ord()] ],
						[ entry["X".ord()], entry["Y".ord()] ]
					],
					"return-visit-1": [
						[ entry["AA".ord()], entry["AB".ord()] ],
						[ entry["AC".ord()], entry["AD".ord()] ]
					],
					"return-visit-2": [
						[ entry["AF".ord()], entry["AG".ord()] ],
						[ entry["AH".ord()], entry["AI".ord()] ]
					],
					"bible-study": [
						[ entry["AK".ord()], entry["AL".ord()] ],
						[ entry["AM".ord()], entry["AN".ord()] ]
					],
					"student-talk": [ entry["AP".ord()], entry["AQ".ord()] ],
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
				fill(row, "." + assignment, date[assignment]);
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
