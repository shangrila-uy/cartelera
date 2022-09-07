function fill(item, selector, content, link) {
	var field = item.find(selector);
	
	if (content == null || content.length == 0) {
		field.hide();
		return;
	}
	
	if (link === undefined || link == null) {
		field.find(".value").text(content);
		return;
	}
	
	field.find(".value")
		.text("")
		.append(
			$("<a>")
				.attr("target", "_blank")
				.attr("href", link)
				.text(content)
		);
}

function addDoNotCalls(territoriesData, territory, link, doNotCallField) {
	var hasDoNotCalls = false;
	var doNotCall = findTerritoryDoNotCall(territoriesData, territory);
	if (doNotCall != '') {
		hasDoNotCalls = true;
		var addressList = doNotCall.split("\n");
		link.append(
			$("<span>").addClass('arrow-right')
		);
		var ul = $("<ul>");
		doNotCallField
			.find(".value")
			.append(
				$("<ul>")
					.addClass("dnc-list")
					.hide()
					.append(
						$("<li>")
							.text("Territorio " + territory)
							.append(ul)
					)		
			);
		$.each(addressList, function(key, value) {
			var url = "https://www.google.com/maps/search/?api=1&query=" + value;
			$("<li>")
				.append(
					$("<a>")
						.attr("target", "_blank")
						.attr("href", url)
						.text(value)
				)
				.appendTo(ul);
		});
	}
	return hasDoNotCalls;
}

function fillAssignments(item, assignments, territoriesData) {
	var assignmentsField = item.find(".assignments");
	var doNotCallField = item.find(".do-not-call");
	if (assignments.length > 0) {
		var element = assignmentsField.find(".value").text("");
		var hasDoNotCalls = false;
		$.each(assignments, function(key, value) {
			var drive = findTerritoryDrive(territoriesData, value);
			var link = $("<a>")
				.attr("target", "_blank")
				// .attr("href", "territorios/mapa.html?territorio=" + value)
				.attr("href", drive)
				.text(value)
				.appendTo(element);
			// hasDoNotCalls = addDoNotCalls(territoriesData, value, link, doNotCallField);
		});
		if (hasDoNotCalls) {
			doNotCallField.find(".value").prepend(
			$("<a>")
				.attr("href", "#")
				.text("Ver más...")
				.addClass("see-more")
				.click(function (event) {
					event.preventDefault();
					var link = $(this);
					if (link.text() == "Ver más...") {
						link.text("Ver menos");
					} else {
						link.text("Ver más...");
					}
					doNotCallField.find(".value .dnc-list").slideToggle();
				})
		);
		} else {
			doNotCallField.hide();
		}
	} else {
		assignmentsField.hide();
		doNotCallField.hide();
	}
}

function findPlace(data, place) {
	for (var i in data.values) {
		if (data.values[i][0] == place) {
			return data.values[i][1];
		}
	}
	return null;
}

function findAssignment(data) {
	var assignments = [];
	if (data !== undefined) {
		assignments = data.split(",")
	}
	return assignments;
}

function findTerritoryDoNotCall(data, territory) {
	var territories = [];
	for (var i in data.values) {
		if (data.values[i][0] == territory) {
			return data.values[i][1];
		}
	}
	return '';
}

function findTerritoryDrive(data, territory) {
	var territories = [];
	for (var i in data.values) {
		if (data.values[i][0] == territory) {
			return data.values[i][1];
		}
	}
	return '';
}

function processData(groupsRequest, homeRequest, phoneRequest) {
	var groupsData = JSON.parse(groupsRequest.responseText);
	var placesData = JSON.parse(homeRequest.responseText);
	var territoriesData = JSON.parse(phoneRequest.responseText);
	var formattedGroupsData = {};
	var template = $(".event");
	var phoneLink = "https://wa.me/598";
	var today = new Date(1900 + new Date().getYear(), new Date().getMonth(), new Date().getDate());

	for (var i = 1; i < groupsData.values.length; i++) {
		var entry = groupsData.values[i];
		var day = entry[9];
		var splittedDay = day.split("/");
		var date = new Date(splittedDay[2], splittedDay[1] - 1, splittedDay[0]);
		if (date >= today) {
			if (formattedGroupsData[date] === undefined) {
				formattedGroupsData[date] = [];
			}
			formattedGroupsData[date].push({
				"hour": entry[1],
				"conductor": entry[4],
				// "auxiliar": entry[5],
				"conductorPhone": "", // entry[7] === undefined ? "" : entry[7].slice(1).replace(/ /g, ""),
				// "auxiliarPhone": entry[8] === undefined ? "" : entry[8].slice(1).replace(/ /g, ""),
				"place": entry[2],
				"notes": entry[5],
				"assignments": findAssignment(entry[11]),
				"placeLink": entry[12]
			});
		}
	}
	for (var day in formattedGroupsData) {
		var date = new Date(day);
		var item = template.clone();
		fill(item, ".number", date.getDate());
		fill(item, ".date", date.toLocaleString('es', {  weekday: 'long' }));
		var times = formattedGroupsData[day];
		var templateRow = item.find(".row").clone();
		item.find(".row").remove();
		for (var i in times) {
			var row = templateRow.clone();
			var time = times[i];
			var conductorPhone = time.conductorPhone != "" ? phoneLink + time.conductorPhone : null;
			var auxiliarPhone = time.auxiliarPhone != "" ? phoneLink + time.auxiliarPhone : null;
			if (time.notes == "Campaña de invitación a la Conmemoración") {
				row.addClass("highlight_2");
			} else if (time.notes == "Visita de circuito") {
				row.addClass("highlight_3");
			}
			
			fill(row, ".time", time.hour);
			fill(row, ".place", time.place, time.placeLink /*findPlace(placesData, time.place)*/);
			fill(row, ".cond", time.conductor, conductorPhone);
			fill(row, ".aux", time.auxiliar, auxiliarPhone);
			fill(row, ".notes", time.notes);
			fillAssignments(row, time.assignments, territoriesData);
			item.find(".rows").append(row);
		}
		item.show();
		$("#table").append(item);
		$(".lds-dual-ring").slideUp();
	}
}

function groups() {
	var groups = 'https://sheets.googleapis.com/v4/spreadsheets/10jxjr-xV0UWNV1XjNIRYrGCKsw8tXxRgjb3BzmHpOp4/values/programa?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
	var homeTerritories = 'https://sheets.googleapis.com/v4/spreadsheets/10jxjr-xV0UWNV1XjNIRYrGCKsw8tXxRgjb3BzmHpOp4/values/territorios_casas?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
	var phoneTerritories = 'https://sheets.googleapis.com/v4/spreadsheets/10jxjr-xV0UWNV1XjNIRYrGCKsw8tXxRgjb3BzmHpOp4/values/territorios_telefonos?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';

	var groupsRequest = new XMLHttpRequest();
	groupsRequest.open('GET', groups);
	groupsRequest.onload = function() {

		var homeRequest = new XMLHttpRequest();
		homeRequest.open('GET', homeTerritories);
		homeRequest.onload = function() {

			var phoneRequest = new XMLHttpRequest();
			phoneRequest.open('GET', phoneTerritories);
			phoneRequest.onload = function() {
				processData(groupsRequest, homeRequest, phoneRequest);
			}
			phoneRequest.send();
				
		}
		homeRequest.send();
		
	}
	groupsRequest.send();
}
