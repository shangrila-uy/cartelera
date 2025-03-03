const WOL_SEARCH = "https://wol.jw.org/es/wol/l/r4/lp-s?q=";

String.prototype.ord = function() {
    var index = this.charCodeAt(0) - 65;

    if (this.length === 1) {
        return index;
    }

    return (index + 1) * 26 + this.charCodeAt(1) - 65;
};

String.prototype.parse = function() {
    return [...this.matchAll(/([^()]+)(\(.+\).*(\(.+\))?)/g)][0]
};

String.prototype.label = function() {
	const matches = this.parse();
    return matches !== undefined ? matches[1] : this;
};

String.prototype.info = function() {
	const matches = this.parse();
    return matches !== undefined ? matches[2] : this;
};

function addLink(element, text, link) {
	element.text("")
		.append(
			$("<a>")
				.attr("href", link)
				.attr("target", "_blank")
				.text(text)
		);
}

function fill(item, selector, content, label, info, link) {
    var field = item.find(selector);

    if (label !== undefined) {
		if (link !== undefined) {
			addLink(field.find(".label"), label, link);
		} else {
	        field.find(".label").text(label);
		}
    }

    if (info !== undefined) {
        field.find(".info").text(info);
    }

    if (content == null || content === '') {
        field.remove();
        return;
    }

    if (Array.isArray(content) && content.every(element=>element === '')) {
        field.remove();
        return;
    }

    if (Array.isArray(content)) {
        if (Array.isArray(content[0])) {
            if (content[0].every(element=>element === '')) {
                field.remove();
                return;
            }
            for (var i = 0; i < content.length; i++) {
                var subselector = selector + "_" + (i + 1);
                if (content[i].every(element=>element === '')) {
                    field.find(subselector).remove();
                    field.find(".room").remove();
                    return;
                }
                field.find(subselector + " .value").html(content[i].join("<br />"));
            }
            return;
        }

        for (var i = 0; i < content.length; i++) {
            var subselector = selector + "_" + (i + 1);
            if (content[i] === '') {
                field.find(subselector).remove();
                field.find(".room").remove();
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

function fillSpecialEvents(formattedData, elements) {
	const selector = "special";
    var meeting = $(".meeting." + selector);

    for (var day in formattedData) {
        var date = new Date(day);
        if (formattedData[day]["type"] === selector) {
			var item = meeting.clone();

	        fill(item, ".date", date.toLocaleString('es', {
	            weekday: 'long'
	        }).toUpperCase());
	        fill(item, ".number", date.getDate());
	
	        var specialEvent = formattedData[day]["special-event"];
			fillLink(item, formattedData[day]["stream"]);

            fill(item, ".section.special-event", specialEvent);
	        item.show();
	        elements.set(date, item);
		}
	}
}

function fillInRow(formattedData, selector, elements) {
    var meeting = $(".meeting." + selector);

    for (var day in formattedData) {
        var date = new Date(day);
        if (formattedData[day]["type"] !== selector) continue;
		
        var item = meeting.clone();

        fill(item, ".date", date.toLocaleString('es', {
            weekday: 'long'
        }).toUpperCase());
        fill(item, ".number", date.getDate());

        var row = item.find(".row").clone();
        item.find(".row").remove();
        fillLink(item, formattedData[day]["stream"]);

		const labels = formattedData[day]["labels"];
		const info = formattedData[day]["info"];
		const assignments = formattedData[day]["assignments"];
		const link = formattedData[day]["links"];

		for (const assignment in assignments) {
			const assignmentInfo = info !== undefined ? info[assignment] : undefined; 
			const assignmentLink = link !== undefined ? link[assignment] : undefined; 
			fill(row, "." + assignment, assignments[assignment], labels[assignment], assignmentInfo, assignmentLink);
			item.find(".rows").append(row);
		}

        item.show();
        elements.set(date, item);
    }
}

function readMidweekSheet(meetingsRequest, today, formattedData) {
	var meetingsV2Data = JSON.parse(meetingsRequest.responseText);

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
	                "type": "special",
                    "special-event": entry["F".ord()],
                    "stream": entry["BK".ord()],
                };
                continue;
            }
			if (entry["G".ord()] == '') {
				continue;
			}
			
			const wolWeek = entry["BL".ord()];
			
            formattedData[date] = {
                "type": "midweek",
                "stream": entry["BK".ord()],
                "labels": {
					"bible-chapters":			entry["K".ord()].label(),
					"chairman":					"Canción " + entry["F".ord()] + " y oración | Palabras de introducción",
	                "treasures-talk": 			entry["I".ord()].label(),
					"pearls": 					"Busquemos perlas escondidas",
					"bible-reading": 			"Lectura de la Biblia",
                    "teachers-discussion-1": 	entry["P".ord()].label(),
                    "teachers-discussion-2": 	entry["R".ord()].label(),
                    "student-assignment-1": 	entry["T".ord()].label(),
                    "student-assignment-2": 	entry["Y".ord()].label(),
                    "student-assignment-3": 	entry["AD".ord()].label(),
                    "student-assignment-4": 	entry["AI".ord()].label(),
                    "student-talk": 			entry["AN".ord()].label(),
					"song-2":					"Canción " + entry["AQ".ord()],
                    "living-part-1": 			entry["AR".ord()].label(),
                    "living-part-2": 			entry["AT".ord()].label(),
                    "congregation-study": 		entry["AV".ord()].label(),
					"conclusion":				"Palabras de conclusión | Canción " + entry["AY".ord()],
                },
				"links" : {
					"bible-chapters": 			WOL_SEARCH + entry["K".ord()].label(),
					"treasures-talk":			wolWeek,
					"pearls": 					wolWeek,
                    "bible-reading": 			wolWeek,
                    "teachers-discussion-1": 	wolWeek,
                    "teachers-discussion-2": 	wolWeek,
                    "student-assignment-1": 	wolWeek,
                    "student-assignment-2": 	wolWeek,
                    "student-assignment-3": 	wolWeek,
                    "student-assignment-4": 	wolWeek,
                    "student-talk": 			wolWeek,
					"living-part-1": 			wolWeek,
					"living-part-2": 			wolWeek,
					"congregation-study": 		wolWeek,
				},
				"info" : {
                    "treasures-talk": 			entry["I".ord()].info(),
                    "bible-reading": 			entry["M".ord()],
                    "teachers-discussion-1": 	entry["P".ord()].info(),
                    "teachers-discussion-2": 	entry["R".ord()].info(),
                    "student-assignment-1": 	entry["T".ord()].info(),
                    "student-assignment-2": 	entry["Y".ord()].info(),
                    "student-assignment-3": 	entry["AD".ord()].info(),
                    "student-assignment-4": 	entry["AI".ord()].info(),
                    "student-talk": 			entry["AN".ord()].info(),
                    "living-part-1": 			entry["AR".ord()].info(),
                    "living-part-2": 			entry["AT".ord()].info(),
                    "congregation-study": 		entry["AV".ord()].info(),
				},
                "assignments": {
					"bible-chapters":			"-",
                    "chairman": 				[entry["G".ord()], entry["H".ord()]],
                    "treasures-talk": 			entry["J".ord()],
                    "pearls": 					entry["L".ord()],
                    "bible-reading": 			[entry["N".ord()], entry["O".ord()]],
                    // ---
	                "teachers-discussion-1": 	entry["Q".ord()],
                    "teachers-discussion-2": 	entry["S".ord()],
                    "student-assignment-1": 	[[entry["U".ord()], entry["V".ord()]], [entry["W".ord()], entry["X".ord()]]],
                    "student-assignment-2": 	[[entry["Z".ord()], entry["AA".ord()]], [entry["AB".ord()], entry["AC".ord()]]],
                    "student-assignment-3": 	[[entry["AE".ord()], entry["AF".ord()]], [entry["AG".ord()], entry["AH".ord()]]],
                    "student-assignment-4": 	[[entry["AJ".ord()], entry["AK".ord()]], [entry["AL".ord()], entry["AM".ord()]]],
                    "student-talk": 			[entry["AO".ord()], entry["AP".ord()]],
					"song-2":					"-",
                    "living-part-1": 			entry["AS".ord()],
                    "living-part-2": 			entry["AU".ord()],
                    "congregation-study": 		[[entry["AW".ord()], entry["AX".ord()]]],
                    "conclusion": 				"-",
                    "final-prayer": 			entry["AZ".ord()],
                    // ---
                    "multimedia": 				[entry["BA".ord()], entry["BB".ord()]],
                    "hall": 					entry["BF".ord()],
                    "attendants": 				[entry["BG".ord()], entry["BH".ord()]],
                    "parking": 					entry["BI".ord()],
                    "stage": 					entry["BE".ord()],
                    "microphones": 				[[entry["BC".ord()], entry["BD".ord()]]],
                    "cleaning": 				"Grupos " + entry["BJ".ord()],
                }
            }
        }
    }
}

function readWeekendSheet(weekendMeetingsRequest, today, formattedData) {
	var weekendMeetingsData = JSON.parse(weekendMeetingsRequest.responseText);

    for (var i = 2; i < weekendMeetingsData.values.length; i++) {
        var entry = weekendMeetingsData.values[i];
        var day = entry["B".ord()];
        var splittedDay = day.split("/");
        var date = new Date("20" + splittedDay[2], splittedDay[1] - 1, splittedDay[0]);
        if (date >= today && entry["E".ord()] != '') {
            if (formattedData[date] === undefined) {
                formattedData[date] = [];
            }
            if (isNaN(entry["D".ord()])) {
                formattedData[date] = {
	                "type": "special",
                    "special-event": entry["D".ord()],
                    "stream": entry["Z".ord()],
                };
                continue;
            }
            formattedData[date] = {
                "type": "weekend",
                "stream": entry["Z".ord()],
                "labels": {
                    "public-talk": entry["H".ord()],
                    "watchtower": entry["K".ord()],
                },
                "assignments": {
                    "chairman": entry["E".ord()],
                    "public-talk": entry["F".ord()] != "" ? entry["F".ord()] + " (" + entry["I".ord()] + ")" : "",
                    "watchtower": [[entry["L".ord()], entry["M".ord()]]],
                    "final-prayer": entry["O".ord()],
                    // ---
                    "multimedia": [entry["P".ord()], entry["Q".ord()]],
                    "hall": entry["U".ord()],
                    "attendants": [entry["V".ord()], entry["W".ord()]],
                    "parking": entry["X".ord()],
                    "stage": entry["T".ord()],
                    "microphones": [[entry["R".ord()], entry["S".ord()]]],
                    "cleaning": "Grupos " + entry["Y".ord()],
                }
            };
        }
    }
}

function addHeader(day, header, table) {
	var date = new Date(day);
	var month = header.clone();
	fill(month, ".month", date.toLocaleString('es', {
		month: 'long'
	}).replace("septiembre", "setiembre").toUpperCase() + " " + date.getFullYear());
	month.show();
	table.append(month);
}

function processData(meetingsRequest, weekendMeetingsRequest) {
    var formattedData = {};
    var phoneLink = "https://wa.me/598";
    var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());

	readMidweekSheet(meetingsRequest, today, formattedData);
    readWeekendSheet(weekendMeetingsRequest, today, formattedData);
    
    console.log(formattedData);
    
    var elements = new Map();
    fillSpecialEvents(formattedData, elements);
    fillInRow(formattedData, "midweek", elements);
    fillInRow(formattedData, "weekend", elements);
    const orderedElements = sort(elements);
    
    // console.log(orderedElements);
    
    var lastMonth = 0;
    const header = $(".header");
	const table = $("#table");
    // addHeader(orderedElements.keys().next().value, header, table);

    for (const [day,element] of orderedElements) {
        var date = new Date(day);
        if (date.getMonth() != lastMonth) {
            addHeader(day, header, table);
        }

        table.append(element);
    }

    $(".lds-dual-ring").slideUp();
}

function sort(map) {
    let keys = Array.from(map.keys()).sort((a,b)=>new Date(a).getTime() - new Date(b).getTime());

    let sorted = new Map();
    for (let key of keys) {
        sorted.set(key, map.get(key));
    }
    return sorted;
}

function toggleFilterButton(active, name) {
    $(".assignee-filter").toggleClass("active");
    if (active) {
        $(".assignee-filter .icon").text("\uE6F0");
        $(".assignee-filter .friend").text(name);
    } else {
        $(".assignee-filter .icon").text("\uE62F");
        $(".assignee-filter .friend").text("");
    }
}

function onFriendClickedListener(name, filterData) {
    if (filterData.filterActive) {
        $(".meeting, .section, .assignee").slideDown();
        $(".meeting").eq(0).hide();
        $(".meeting").eq(1).hide();
        $(".meeting").eq(2).hide();

        $(".row .section h2.first").filter(function() {
            return !$(this).parent().hasClass("tasks");
        }).removeClass("first");
        $(".row").each(function() {
            var assignee = $(".assignee", this);
            assignee.filter(function(index) {
                return index < assignee.length - 1;
            }).removeClass("last");
        });

        filterData.filterActive = false;
    } else {
        $(".meeting").filter(function(index) {
            var filteredRows = $(".row > .assignee", this).filter(function(index) {
                if ($(".value:contains('" + name + "')", this).length > 0) {
                    return false;
                }
                return true;
            });

            var filteredSections = $(".section", this).filter(function(index) {
                var filteredAssignees = $(".assignee", this).filter(function(index) {
                    if ($(".value:contains('" + name + "')", this).length > 0) {
                        return false;
                    }
                    return true;
                });
                if ($(".assignee", this).length !== filteredAssignees.length) {
                    filteredAssignees.slideUp();
                    return false;
                }
                return true;
            });
            if ($(".row > .assignee", this).length !== filteredRows.length || $(".section", this).length !== filteredSections.length) {
                filteredRows.slideUp();
                filteredSections.slideUp();
                return false;
            }
            return true;
        }).slideUp();

        setTimeout(function() {
            $(".row:visible .section:visible > *:visible:first-child, .row:visible .assignee:visible:first-child").addClass("first");
            $(".row:visible .section:visible .assignee:visible, .row:visible .assignee:visible").addClass("last");
        }, 400);

        filterData.filterActive = true;
        toggleFilterButton(true, name);
        toggleFilterPopup(filterData);
    }
}

function toggleFilterPopup(filterData) {
    if (filterData.popupVisible) {
        $(".popup").css("display", "none");
        $(".header").css("position", "sticky");
    } else {
        $(".popup").css("display", "block");
        $(".header").css("position", "static");
		$("#autocomplete").focus();
    }
}

function onFilterClickedListener(filterData) {
    if (filterData.filterActive) {
        toggleFilterButton(false);
        onFriendClickedListener("", filterData);
        filterData.popupVisible = false;
    } else {
        $("#autocomplete").val("");
        $(".friend-list li").show();
        $(".search-field a")
			.addClass("search")
            .text("\uE67D");
        toggleFilterPopup(filterData);
        filterData.popupVisible = !filterData.popupVisible;
    }
}

function onFilterClosed(filterData) {
	toggleFilterPopup(filterData);
	filterData.popupVisible = false;
}

function getInitials(fullName) {
    const names = fullName.split(" ");
    return names[0][0] + names [names.length - 1][0];
}

function renderAssignee(filterData, assignee) {
    const initials = $("<span>")
        .addClass("initials")
        .text(getInitials(assignee));
    const circle = $("<span>")
        .addClass("circle")
        .append(initials);
    const name = $("<span>")
        .addClass("name")
        .text(assignee);
    const link = $("<a>").attr("href", "#")
        .append(circle)
        .append(name)
        .on("click", function() {
            onFriendClickedListener(assignee, filterData);
        }
    );
    
    return $("<li>").append(link)
}

function initFilters(filterData) {
    const assignmentsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/Asignaciones?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    const assignmentsRequest = new XMLHttpRequest();

    assignmentsRequest.open('GET', assignmentsUrl);
    assignmentsRequest.onload = function() {
        const assignmentsData = JSON.parse(assignmentsRequest.responseText);
        const assignees = [];

        for (const row in assignmentsData.values) {
            if (row == 0) continue;

            assignees.push(assignmentsData.values[row][0]);
        }
        
        const input = $("<input>")
            .attr("type", "text")
            .attr("name", "country")
            .attr("id", "autocomplete")
            .attr("placeholder", "Nombre");
        const icon = $("<a>")
            .attr("href", "#")
            .addClass("search")
            .text("\uE67D");
		const close = $("<a>")
            .attr("href", "#")
            .addClass("close")
            .text("\uE6F1")
			.on("click", function() {
				onFilterClosed(filterData);
			});
		const topbar = $("<div>")
            .addClass("topbar")
			.append(close);
        const searchField = $("<div>")
            .addClass("search-field")
            .append(icon)
            .append(input);
        const ul = $("<ul>");
        const friendList = $("<div>")
            .addClass("friend-list")
            .append(ul);
        const friends = $("<div>")
            .addClass("friends")
			.append(topbar)
            .append(searchField)
            .append(friendList)
            .appendTo(".popup");

        for (const i in assignees) {
            const assignee = assignees[i];
            const item = renderAssignee(filterData, assignee);
            item.appendTo(ul);
        }

        input.on("change paste keyup", function() {
            const value = input.val();
            
            if (value === "") {
                icon.text("\uE67D")
                    .addClass("search")
                    .off("click");
                ul.find("li").show();    
                return;
            }

            icon.text("\uE6F0")
                .removeClass("search")
                .on("click", function() {
                    input.val("");
                    input.trigger("change");
                });
            
            ul.find("li").hide();
            ul
                .find("li")
                .filter(function(index) {
                    return $(".name", this)
                        .text()
                        .toLowerCase()
                        .startsWith(value.toLowerCase());
                })
                .show();
        });
    }
    assignmentsRequest.send();
}

function meetings() {
    var meetingsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/vida%20y%20ministerio?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    var weekendMeetingsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/Fin%20de%20semana?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    var filterData = {
        popupVisible: false,
        filterActive: false
    };

    var meetingsRequest = new XMLHttpRequest();
    meetingsRequest.open('GET', meetingsUrl);
    meetingsRequest.onload = function() {
		var weekendMeetingsRequest = new XMLHttpRequest();
		weekendMeetingsRequest.open('GET', weekendMeetingsUrl);
		weekendMeetingsRequest.onload = function() {
			processData(meetingsRequest, weekendMeetingsRequest);
			$(".assignee-filter").on("click", function() {
				onFilterClickedListener(filterData);
			});
		}
		weekendMeetingsRequest.send();
    }
    meetingsRequest.send();

    initFilters(filterData);
}
