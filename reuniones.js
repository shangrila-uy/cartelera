String.prototype.ord = function() {
    var index = this.charCodeAt(0) - 65;

    if (this.length === 1) {
        return index;
    }

    return (index + 1) * 26 + this.charCodeAt(1) - 65;
}
;

function fill(item, selector, content, label) {
    var field = item.find(selector);

    if (label !== undefined) {
        field.find(".label").text(label);
    }

    if (content == null || content === '') {
        if (selector === '.counselor_B') {
            item.find('.counselor').remove();
            item.find('.chairman .room').remove();
            return;
        }
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

function fillInRow(formattedData, selector, elements) {
    var meeting = $(".meeting." + selector);

    for (var day in formattedData) {
        var date = new Date(day);
        if (formattedData[day]["type"] !== selector)
            continue;
        var item = meeting.clone();

        fill(item, ".date", date.toLocaleString('es', {
            weekday: 'long'
        }).toUpperCase());
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
                row.find(".section.special-event").remove();
                fill(row, "." + assignment, assignments[assignment], labels[assignment]);
                item.find(".rows").append(row);
            }
        }

        item.show();
        elements.set(date, item);
    }
}

function processData(meetingsRequest, meetingsV2Request, weekendMeetingsRequest) {
    var meetingsData = JSON.parse(meetingsRequest.responseText);
    var formattedData = {};
    var phoneLink = "https://wa.me/598";
    var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());

    for (var i = 55; i < meetingsData.values.length; i++) {
        var entry = meetingsData.values[i];
        var day = entry["D".ord()];
        var splittedDay = day.split(" ")[1].split("/");
        var date = new Date(2023,splittedDay[1] - 1,splittedDay[0]);
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
                "type": "midweek",
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
                    "bible-reading": [entry["M".ord()], entry["N".ord()]],
                    "teachers-video": entry["O".ord()],
                    "initial-call-1": [[entry["Q".ord()], entry["R".ord()]], [entry["S".ord()], entry["T".ord()]]],
                    "initial-call-2": [[entry["V".ord()], entry["W".ord()]], [entry["X".ord()], entry["Y".ord()]]],
                    "return-visit-1": [[entry["AA".ord()], entry["AB".ord()]], [entry["AC".ord()], entry["AD".ord()]]],
                    "return-visit-2": [[entry["AF".ord()], entry["AG".ord()]], [entry["AH".ord()], entry["AI".ord()]]],
                    "bible-study": [[entry["AK".ord()], entry["AL".ord()]], [entry["AM".ord()], entry["AN".ord()]]],
                    "student-talk": [entry["AP".ord()], entry["AQ".ord()]],
                    "living-part-1": entry["AT".ord()],
                    "living-part-2": entry["AV".ord()],
                    "congregation-study": [[entry["AX".ord()], entry["AY".ord()]]],
                    "final-prayer": entry["BA".ord()],
                    // ---
                    "multimedia": [entry["BB".ord()], entry["BC".ord()]],
                    "hall": entry["BG".ord()],
                    "attendants": [entry["BH".ord()], entry["BI".ord()]],
                    "parking": entry["BJ".ord()],
                    "stage": entry["BF".ord()],
                    "microphones": [[entry["BD".ord()], entry["BE".ord()]]],
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
        var date = new Date("20" + splittedDay[2],splittedDay[1] - 1,splittedDay[0]);
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
                "type": "midweek",
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
                    "bible-reading": [entry["N".ord()], entry["O".ord()]],
                    // ---
                    "teachers-discussion-1": entry["Q".ord()],
                    "teachers-discussion-2": entry["S".ord()],
                    "student-assignment-1": [[entry["U".ord()], entry["V".ord()]], [entry["W".ord()], entry["X".ord()]]],
                    "student-assignment-2": [[entry["Z".ord()], entry["AA".ord()]], [entry["AB".ord()], entry["AC".ord()]]],
                    "student-assignment-3": [[entry["AE".ord()], entry["AF".ord()]], [entry["AG".ord()], entry["AH".ord()]]],
                    "student-assignment-4": [[entry["AJ".ord()], entry["AK".ord()]], [entry["AL".ord()], entry["AM".ord()]]],
                    "student-talk": [entry["AO".ord()], entry["AP".ord()]],
                    "living-part-1": entry["AS".ord()],
                    "living-part-2": entry["AU".ord()],
                    "congregation-study": [[entry["AW".ord()], entry["AX".ord()]]],
                    "final-prayer": entry["AZ".ord()],
                    // ---
                    "multimedia": [entry["BA".ord()], entry["BB".ord()]],
                    "hall": entry["BF".ord()],
                    "attendants": [entry["BG".ord()], entry["BH".ord()]],
                    "parking": entry["BI".ord()],
                    "stage": entry["BE".ord()],
                    "microphones": [[entry["BC".ord()], entry["BD".ord()]]],
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

    var weekendMeetingsData = JSON.parse(weekendMeetingsRequest.responseText);

    for (var i = 2; i < weekendMeetingsData.values.length; i++) {
        var entry = weekendMeetingsData.values[i];
        var day = entry["B".ord()];
        var splittedDay = day.split("/");
        var date = new Date("20" + splittedDay[2],splittedDay[1] - 1,splittedDay[0]);
        if (date >= today && entry["E".ord()] != '') {
            if (formattedData[date] === undefined) {
                formattedData[date] = [];
            }
            if (isNaN(entry["D".ord()])) {
                formattedData[date] = {
                    "special-event": entry["D".ord()],
                    "link": entry["Z".ord()],
                };
                continue;
            }
            formattedData[date] = {
                "type": "weekend",
                "link": entry["Z".ord()],
                "labels": {
                    "public-talk": entry["H".ord()],
                    "watchtower": entry["K".ord()],
                },
                "assignments": {
                    "chairman": entry["E".ord()],
                    "public-talk": entry["F".ord()] + " (" + entry["I".ord()] + ")",
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

    // console.log(formattedData);
    var elements = new Map();
    fillInRow(formattedData, "midweek", elements);
    fillInRow(formattedData, "weekend", elements);
    const orderedElements = sort(elements);
    console.log(orderedElements);
    var lastMonth = 0;
    var header = $(".header");

    for (const [day,element] of orderedElements) {
        var date = new Date(day);
        if (date.getMonth() != lastMonth) {
            var month = header.clone();
            fill(month, ".month", date.toLocaleString('es', {
                month: 'long'
            }).replace("septiembre", "setiembre").toUpperCase() + " " + date.getFullYear());
            month.show();
            $("#table").append(month);
            lastMonth = date.getMonth()
        }

        $("#table").append(element);
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
    }
}

function onFilterClickedListener(filterData) {
    if (filterData.filterActive) {
        onFriendClickedListener("", filterData);
        filterData.popupVisible = false;
    } else {
        toggleFilterPopup(filterData);
        filterData.popupVisible = !filterData.popupVisible;
    }
}

function initFilters(filterData) {
    const assignmentsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/Asignaciones?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    const assignmentsRequest = new XMLHttpRequest();

    assignmentsRequest.open('GET', assignmentsUrl);
    assignmentsRequest.onload = function() {
        const assignmentsData = JSON.parse(assignmentsRequest.responseText);
        const ul = $("<ul>").appendTo($("<div>")
            .addClass("friends")
            .prependTo(".popup"));

        for (const row in assignmentsData.values) {
            if (row == 0) continue;

            const assignee = assignmentsData.values[row][0];
            ul.append($("<li>")
                .append(
                    $("<a>").attr("href", "#")
                        .css("display", "block")
                        .text(assignee)
                        .on("click", function() {
                            onFriendClickedListener(assignee, filterData);
                        }
                    )
                )
            );
        }
    }
    assignmentsRequest.send();
}

function meetings() {
    var meetingsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/vida%20y%20ministerio?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    var meetingsV2Url = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/vida%20y%20ministerio%202024?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    var weekendMeetingsUrl = 'https://sheets.googleapis.com/v4/spreadsheets/1XBm2Ywv2CEr7yHTjfbIHT_vNvHtD0pTX0B8BXmuaGF0/values/Fin%20de%20semana?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    var filterData = {
        popupVisible: false,
        filterActive: false
    };

    var meetingsRequest = new XMLHttpRequest();
    meetingsRequest.open('GET', meetingsUrl);
    meetingsRequest.onload = function() {
        var meetingsV2Request = new XMLHttpRequest();
        meetingsV2Request.open('GET', meetingsV2Url);
        meetingsV2Request.onload = function() {
            var weekendMeetingsRequest = new XMLHttpRequest();
            weekendMeetingsRequest.open('GET', weekendMeetingsUrl);
            weekendMeetingsRequest.onload = function() {
                processData(meetingsRequest, meetingsV2Request, weekendMeetingsRequest);
                $(".assignee-filter").on("click", function() {
                    onFilterClickedListener(filterData);
                });
            }
            weekendMeetingsRequest.send();
        }
        meetingsV2Request.send();
    }
    meetingsRequest.send();

    initFilters(filterData);
}
