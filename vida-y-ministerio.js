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
		var day = entry[3];
		var splittedDay = day.split(" ")[1].split("/");
		var date = new Date(2023, splittedDay[1] - 1, splittedDay[0]);
		if (date >= today && entry[5] != '') {
			if (formattedData[date] === undefined) {
				formattedData[date] = [];
			}
			formattedData[date].push(
				{
					"chairman": entry[5],
					"treasures": entry[7],
					"pearls": entry[9],
					"bible-reading": entry[11],
					"teachers-talk": entry[13],
					"teachers-video": entry[14],
					"initial-call-1": [ entry[16], entry[17] ], 
					"initial-call-2": [ entry[19], entry[20] ],
					"return-visit-1": [ entry[22], entry[23] ],
					"return-visit-2": [ entry[25], entry[26] ],
					"bible-study": [ entry[28], entry[29] ],
					"student-talk": entry[31],
					"living-part-1": entry[34],
					"living-part-2": entry[36],
					"congregation-study-conductor": entry[38],
					"congregation-study-reader": entry[39],
					"final-prayer": entry[41]
				}
			);
		}
	}

	console.log(formattedData);

	for (var day in formattedData) {
		var date = new Date(day);
		var item = template.clone();
		fill(item, ".date", date.toLocaleString('es', {  weekday: 'short' }).toUpperCase());
		fill(item, ".number", date.getDate());
		fill(item, ".month", date.toLocaleString('es', {  month: 'short' }).toUpperCase().replace("SEPT", "SET"));
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
