function fill(item, selector, content, max, href) {
	var field = item.find(selector);
	
	if (content == null || content.length == 0 || content === undefined) {
		field.hide();
		return;
	}
	

	if (Array.isArray(content)) {
		field.find(".button").attr("href", href);
		
		if (content.every(e => e === '')) {
			field.find(".value").hide();
			return;
		}
		
		field.find(".value").html(content.filter(e => e !== '').join("<br />"));
		
		var assigned = content.filter(e => e !== '').length;
		// field.find(".value").text(assigned + " / " + max + " voluntarios");

		// if (assigned == max) {
			field.find(".button").hide();
		// }
		return;
	}
	
	field.find(".value").text(content);
}

function getNextSaturdayDate() {
  const today = new Date();
  // Calculate days until Saturday (0 = Sunday, 6 = Saturday)
  const daysUntilSaturday = 6 - today.getDay(); 
  
  const nextSaturday = new Date(today);
  // Add 7 to ensure it's next week
  nextSaturday.setDate(today.getDate() + daysUntilSaturday + 7); 
  
  return nextSaturday;
}

function processContent(content) {
	if (content === undefined || content === '') return [];
	
	if (typeof content === 'string') {
		return content.split("\n");
	}
	
	return content;
}

function processData(request) {
	const data = JSON.parse(request.responseText);
	const template = $(".event");
	const today = new Date(1900 + new Date().getYear(), new Date().getMonth(), new Date().getDate());
	// https://docs.google.com/forms/d/e/1FAIpQLScScCAr5r86J0depVrnr2odURDqJZNRoZXbRj3uwDByrBsf9w/viewform?usp=pp_url&entry.991199226=2023-09-25&entry.535397679=Break+(9:00+-+10:30)&entry.1187083074=Ismael+Machado
	const link = "https://docs.google.com/forms/d/e/1FAIpQLScScCAr5r86J0depVrnr2odURDqJZNRoZXbRj3uwDByrBsf9w/viewform?usp=pp_url&entry.991199226=${1}&entry.535397679=${2}&entry.1187083074=";
	const nextSaturday = getNextSaturdayDate();
	let formattedData = {};

	for (var i = 1; i < data.values.length; i++) {
		var entry = data.values[i];
		var day = entry[0];
		var splittedDay = day.split("/");
		var date = new Date(20 + splittedDay[2], splittedDay[1] - 1, splittedDay[0]);
		if (date >= today && date <= nextSaturday) {
			if (formattedData[date] === undefined) {
				formattedData[date] = [];
			}
			formattedData[date].push({
				"start": "9:00",
				"finish": "10:30",
				"title": "Break",
				"volunteers": processContent(entry[1]),
				"max": 2
			});
			formattedData[date].push({
				"start": "10:00",
				"finish": "11:00",
				"title": "Fruta",
				"volunteers": processContent(entry[2]),
				"max": 4
			});
			formattedData[date].push({
				"start": "11:00",
				"finish": "13:00",
				"title": "Almuerzo",
				"volunteers": processContent(entry[3]),
				"max": 3
			});
			/*
			formattedData[date].push({
				"start": "9:00",
				"finish": "10:30",
				"title": "Break de la tarde",
				"volunteers": processContent(entry[4]),
				"max": 2
			});
			*/
			formattedData[date].push({
				"start": "18:00",
				"finish": "19:00",
				"title": "Limpieza",
				"volunteers": processContent(entry[5]),
				"max": 4
			});
			/*
			formattedData[date].push({
				"start": "18:30",
				"finish": "19:00",
				"title": "Desarmado",
				"volunteers": processContent(entry[6]),
				"max": 3
			});
			formattedData[date].push({
				"start": "21:00",
				"finish": "21:30",
				"title": "Armado",
				"volunteers": processContent(entry[7]),
				"max": 3
			});
			*/
		}
	}
	
	console.log(formattedData);
	
	for (var day in formattedData) {
		var date = new Date(day);
		var item = template.clone();
		fill(item, ".number", date.getDate());
		fill(item, ".date", date.toLocaleString('es', {  weekday: 'long' }));
		var times = formattedData[day];
		var templateRow = item.find(".row").clone();
		item.find(".row").remove();
		for (var i in times) {
			var time = times[i];
			if (time.volunteers.every(element => element === '-')) continue;
			
			var row = templateRow.clone();
			var schedule = time.start + " - " + time.finish;
			var fullDate = (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()).replace(/\d+/g, c=>c.padStart(2,'0'));
			var href = link.replace("${1}", fullDate)
							.replace("${2}", time.title + " (" + schedule + ")")
							.replaceAll(" ", "+");
			// console.log(href);
			fill(row, ".title", time.title);
			fill(row, ".time", schedule);
			fill(row, ".volunteers", time.volunteers, time.max, href);
			item.find(".rows").append(row);
		}
		item.show();
		$("#table").append(item);
		$(".lds-dual-ring").slideUp();
	}
}

function assignments() {
	var assignments = 'https://sheets.googleapis.com/v4/spreadsheets/1xGeaxFc5JIEC7I7NbdjQU_nV5CnfaLM4k8me9zNT-Iw/values/json?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';

	var request = new XMLHttpRequest();
	request.open('GET', assignments);
	request.onload = function() {
		processData(request);
	}
	request.send();
}
