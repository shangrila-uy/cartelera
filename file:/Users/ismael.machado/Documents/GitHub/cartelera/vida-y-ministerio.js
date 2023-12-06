String.prototype.ord = function() {
	var index = this.charCodeAt(0) - 65;

	if (this.length === 1) {
		return index;
	}

	return (index + 1) * 26 + this.charCodeAt(1) - 65;
};

function fill(item, selector, content, label) {
	var field = item.find(selector);

	if (label !== undefined) {
		field.find(".label").text(label);
	}
	
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

function fillLink(item, link) {
	var element = item.find(".link a");
	
	if (link === undefined) {
		element.hide();
		return;
	}

	if (link.indexOf("stream") > 0) {
		element.find("img").attr("src", "images/jw-stream.png");
	}
	
	element.attr("href", link);
}


function processData(meetingsRequest, meetingsV2Request) {
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
				formattedData[date] = {
					"special-event": entry["E".ord()],
					"link": entry["BL".ord()],
				};
				continue;
			}
			formattedData[date] = {
				"link": entry["BL".ord()],
				"labels": {
					"living-part-1": entry["AS".ord()],
					"living-part-2": entry["AU".ord()],
				},
				"assignments": {
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
					"congregation-study": [ [ entry["AX".ord()], entry["AY".ord()] ] ],
					"final-prayer": entry["BA".ord()],
					// ---
					"multimedia": [ entry["BB".ord()], entry["BC".ord()] ],
					"hall": entry["BG".ord()],
					"attendants": [ entry["BH".ord()], entry["BI".ord()] ],
					"parking": entry["BJ".ord()],
					"stage": entry["BF".ord()],
					"microphones": [ [ entry["BD".ord()], entry["BE".ord()] ] ],
					"cleaning": "Grupos " + entry["BK".ord()],
					// ---
					"teachers-discussion-1": "",
					"teachers-discussion-2": "",
					"student-assignment-1": [], 
					"student-assignment-2": [], 
					"student-assignment-3": [], 
					"student-assignment-4": [], 
				}
			};
		}
	}

	var meetingsV2Data = JSON.parse(meetingsV2Request.responseText);
	for (var i = 2; i < meetingsV2Data.values.length; i++) {
		var entry = meetingsV2Data.values[i];
		var day = entry["D".ord()];
		var splittedDay = day.split("/");
		var date = new Date("20" + splittedDay[2], splittedDay[1] - 1, splittedDay[0]);
		if (date >= today && entry["F".ord()] != '') {
			if (formattedData[date] === undefined) {
				formattedData[date] = [];
			}
			if (isNaN(entry["F".ord()])) {
				formattedData[date] = {
					"special-event": entry["F".ord()],
					"link": entry["BK".ord()],
				};
				continue;
			}
			formattedData[date] = {
				"link": entry["BK".ord()],
				"labels": {
					"treasures-talk": entry["I".ord()],
					"teachers-discussion-1": entry["P".ord()],
					"teachers-discussion-2": entry["R".ord()],
					"student-assignment-1": entry["T".ord()],
					"student-assignment-2": entry["Y".ord()],
					"student-assignment-3": entry["AD".ord()],
					"student-assignment-4": entry["AI".ord()],
					"student-talk": entry["AN".ord()],
				 	"living-part-1": entry["AR".ord()],
				 	"living-part-2": entry["AT".ord()],
				},
				"assignments": {
					"chairman_A": entry["G".ord()],
					"counselor_B": entry["H".ord()],
					"treasures-talk": entry["J".ord()],
					"pearls": entry["L".ord()],
					"bible-reading": [ entry["N".ord()], entry["O".ord()] ],
					// ---
					"teachers-discussion-1": entry["Q".ord()],
					"teachers-discussion-2": entry["S".ord()],
					"student-assignment-1": [ 
					 	[ entry["U".ord()], entry["V".ord()] ], 
					 	[ entry["W".ord()], entry["X".ord()] ]
					], 
					"student-assignment-2": [ 
					 	[ entry["Z".ord()], entry["AA".ord()] ], 
					 	[ entry["AB".ord()], entry["AC".ord()] ]
					], 
					"student-assignment-3": [ 
					 	[ entry["AE".ord()], entry["AF".ord()] ], 
					 	[ entry["AG".ord()], entry["AH".ord()] ]
					], 
					"student-assignment-4": [ 
					 	[ entry["AJ".ord()], entry["AK".ord()] ], 
					 	[ entry["AL".ord()], entry["AM".ord()] ]
					], 
					"student-talk": [ entry["AO".ord()], entry["AP".ord()] ],
					"living-part-1": entry["AS".ord()],
					"living-part-2": entry["AU".ord()],
					"congregation-study": [ [ entry["AW".ord()], entry["AX".ord()] ] ],
					"final-prayer": entry["AZ".ord()],
					// ---
					"multimedia": [ entry["BA".ord()], entry["BB".ord()] ],
					"hall": entry["BF".ord()],
					"attendants": [ entry["BG".ord()], entry["BH".ord()] ],
					"parking": entry["BI".ord()],
					"stage": entry["BE".ord()],
					"microphones": [ [ entry["BC".ord()], entry["BD".ord()] ] ],
					"cleaning": "Grupos " + entry["BJ".ord()],
					// --- Legacy
					"teachers-video": "",
					"initial-call-1": [], 
					"initial-call-2": [],
					"return-visit-1": [],
					"return-visit-2": [],
					"bible-study": [],
				}
			};
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

		var row = item.find(".row").clone();
		item.find(".row").remove();
		var specialEvent = formattedData[day]["special-event"];
		fillLink(item, formattedData[day]["link"]);

		if (specialEvent !== undefined) {
			row = row.filter(".special-event").clone();
			fill(row, ".section.special-event", specialEvent);
			item.find(".rows").append(row);
		} else {
			var labels = formattedData[day]["labels"];
			var assignments = formattedData[day]["assignments"];

			for (const assignment in assignments) {
				row.find(".section.special-event").hide();
				fill(row, "." + assignment, assignments[assignment], labels[assignment]);
				item.find(".rows").append(row);
			}
		}

		item.show();
		$("#table").append(item);
    	item.find(".row.tasks .assignee:visible:last").addClass("last");
		$(".lds-dual-ring").slideUp();
	}
}

function meetings() {
	var meetingsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/vida%20y%20ministerio?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
	var meetingsV2Url = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/vida%20y%20ministerio%202024?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
	
	var meetingsRequest = new XMLHttpRequest();
	meetingsRequest.open('GET', meetingsUrl);
	meetingsRequest.onload = function() {
		var meetingsV2Request = new XMLHttpRequest();
		meetingsV2Request.open('GET', meetingsV2Url);
		meetingsV2Request.onload = function() {
			processData(meetingsRequest, meetingsV2Request);
		}
		meetingsV2Request.send();
	}
	meetingsRequest.send();
}
