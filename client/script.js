class Point {
    #x = 0;
    #y = 0;
    #size = 0;
    #id = 0;
    #null_cord = [600, 300];
    #name;


    static count = 0;

    constructor(x, y, size, name) {
        this.x = 1350 + x * 34;
        this.y = -360 - y * 28;
        this.size = ((size / 4) + 2) * 2;
        this.id = Point.count;
        this.name = name;
        Point.count += 1;

    }

    getCoord() {
        return [this.x, this.y];
    }
    getId() {
        return this.id;
    }


    drawPoint() {
        this.x = this.x;
        this.y = this.y;
        $('#svgmap').append($(`<svg id="svgcircle" class="svg_circle"><circle сlass='circle' id=circle r="${this.size}" fill="#275168" cx="${this.x}" cy="${this.y}"></svg>`));
        $('#svgcircle').attr("id", "svgcircle" + this.id);
        $('#circle').attr("id", "circle" + this.id);

    }
}


class Edge {
    #vertex_from = new Point;
    #vertex_to = new Point;
    #id = 0;

    static count = 0;

    constructor(vertex_from, vertex_to) {
        this.vertex_from = vertex_from;
        this.vertex_to = vertex_to;
        this.id = Edge.count;
        Edge.count += 1;
    }

    drawEdge() {
        $('#svgmap').append($(`<svg id="svgline" class="svg_line"><line class="line" id="line"x1="${this.vertex_from.x}" y1="${this.vertex_from.y}" x2="${this.vertex_to.x}" y2="${this.vertex_to.y}" style="stroke:#275168;stroke-width:1.3" /></svg>`));
        $('#svgline').attr("id", "svgline" + this.vertex_from.id + '_' + this.vertex_to.id);
        $('#line').attr("id", "line" + this.vertex_from.id + '_' + this.vertex_to.id);
    }
}

class Map {

    #points = new Array();
    #edges = new Array();

    constructor(cities, edges) {
        this.cities = cities;
        this.edges = edges;
    }
    drawMap() {
        for (let i = 0; i < this.cities.length; i++) {
            let point = new Point(this.cities[i].coordinates[0], this.cities[i].coordinates[1], this.cities[i].priority, this.cities[i].name);
            this.#points.push(point);

        }



        for (let i = 0; i < this.edges.length; i++) {
            let edge = new Edge(this.#points[this.edges[i][0]], this.#points[this.edges[i][1]]);
            edge.drawEdge();
        }

        for (let i = 0; i < this.cities.length; i++) {
            this.#points[i].drawPoint();
        }

    }
}

$.ajaxSetup({
    type: "POST",
    data: {},
    dataType: 'json',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    contentType: 'application/json; charset=utf-8'
});


function sendJSON(user_data, user_url, req_type) {
    let xhr = new XMLHttpRequest();
    let url = "http://127.0.0.1:5000" + user_url;
    xhr.open(req_type, url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(req_type + ' request was received');
        }
    };
    xhr.send(JSON.stringify(user_data));
    return JSON.parse(xhr.responseText);
}

function graphBuild(data) {
    $('.city_selection_container').hide();
    $('.list_of_cities_container').hide();
    $('#build_button1').hide();
    $('#map_text').text(`ВАШ МАРШРУТ: ОТ Г.${$('input#city_selection_input1').val().toUpperCase()} ДО Г.${$('input#city_selection_input2').val().toUpperCase()} (РАССТОЯНИЕ ${data[data.length - 1]} КМ)`);
    for (let i = 0; i < data.length - 1; i++) {
        $('#list_of_cities_passed').append(`<p id="passed_city${i}">${i + 1 + ". " + name_of_cities[data[i]].toUpperCase()}</p>`);
        $('#circle' + data[i]).attr('fill', 'red');
        $('#line' + data[i] + '_' + data[i + 1]).css({ 'stroke': 'red' });
        $('#line' + data[i + 1] + '_' + data[i]).css({ 'stroke': 'red' });
        console.log('#line' + data[i] + ' ' + data[i + 1]);

    }
    $('.build_button_content').append(`<button onclick="location.reload(); return false;" class="build_button" id="build_button1">ПОСТРОИТЬ НОВЫЙ МАРШРУТ</button>`);


}

$(function () {
    $("#build_button1").on("click", function () {
        if ($('input#city_selection_input1').val().length && $('input#city_selection_input2').val().length) {
            if (name_of_cities.indexOf($('input#city_selection_input1').val()) != -1 && name_of_cities.indexOf($('input#city_selection_input2').val()) != -1 && $('input#city_selection_input1').val() != $('input#city_selection_input2').val()) {
                $('input#city_selection_input1').attr('style', 'background-color: #D9D9D9');
                $('input#city_selection_input2').attr('style', 'background-color: #D9D9D9');

                let checked_city = [];
                for (var i = 0; i < name_of_cities.length; i++) {
                    if ($("#checkbox" + i).prop('checked') && name_of_cities[i] != $('input#city_selection_input1').val() && name_of_cities[i] != $('input#city_selection_input2').val()) {
                        checked_city.push(i);
                    }
                }

                let checked_city_avoid = [];
                for (var i = 0; i < name_of_cities.length; i++) {
                    if ($("#checkbox_avoid" + i).prop('checked') && name_of_cities[i] != $('input#city_selection_input1').val() && name_of_cities[i] != $('input#city_selection_input2').val()) {
                        checked_city_avoid.push(i);
                    }
                }

                console.log(checked_city, checked_city_avoid);

                for (var i = 0; i < checked_city_avoid.length; i++) {

                    if (checked_city.includes(checked_city_avoid[i])) {
                        alert('В списке избегаемых городов был найден город, уже имеющийся в списке обятательных городов!');
                        return -1;
                    }
                }



                let req = {
                    "list_mandatory": checked_city,
                    "list_avoided": checked_city_avoid,
                    "A": name_of_cities.indexOf($('input#city_selection_input1').val()),
                    "B": name_of_cities.indexOf($('input#city_selection_input2').val())
                };

                let response = sendJSON(req, "/api/v1/itinerary/", "POST");
                graphBuild(response);


            }
            else {
                if (name_of_cities.indexOf($('input#city_selection_input1').val()) == -1) {
                    $('input#city_selection_input1').attr('style', 'background-color: #BD5E5E');
                }
                if (name_of_cities.indexOf($('input#city_selection_input2').val()) == -1) {
                    $('input#city_selection_input2').attr('style', 'background-color: #BD5E5E');
                }
                if ($('input#city_selection_input1').val() == $('input#city_selection_input2').val()) {
                    $('input#city_selection_input1').attr('style', 'background-color: #BD5E5E');
                    $('input#city_selection_input2').attr('style', 'background-color: #BD5E5E');
                }
                alert('Введите корректные названия городов!');
            }

        } else {
            if (!$('input#city_selection_input1').val().length) {
                $('input#city_selection_input1').attr('style', 'background-color: #BD5E5E');
            }
            if (!$('input#city_selection_input2').val().length) {
                $('input#city_selection_input2').attr('style', 'background-color: #BD5E5E');
            }
            alert('Введите Пункт А и Пункт В!');
        }
    });
});

$(function () {
    $("#city_selection_input1").on("click", function () {
        $('input#city_selection_input1').attr('style', 'background-color: #D9D9D9');
    });
    $("#city_selection_input2").on("click", function () {
        $('input#city_selection_input2').attr('style', 'background-color: #D9D9D9');
    });
});

$(function () {

    $('input#city_selection_input1').autocomplete({
        source: name_of_cities,
        scroll: false
    });

    $('input#city_selection_input2').autocomplete({
        source: name_of_cities,
        scroll: false
    });

});

let name_of_cities = [];

function main() {
    let response = sendJSON('', '/api/v1/', 'GET');
    console.log(response)
    let cities = response['vertices']
    let edges = response['list'];

    for (var i = 0; i < cities.length; i++) {
        name_of_cities.push(cities[i].name);
        $('#list_of_cities_content1').append($(`<label class="checkbox_container"id="checkbox_container${i}">${cities[i].name}<input id="checkbox${i}"class="checkbox"type="checkbox"><span class="checkmark"></span></label>`));
    }
    for (var i = 0; i < cities.length; i++) {
        name_of_cities.push(cities[i].name);
        $('#list_of_cities_content2').append($(`<label class="checkbox_container"id="checkbox_container_avoid${i}">${cities[i].name}<input id="checkbox_avoid${i}"class="checkbox"type="checkbox"><span class="checkmark"></span></label>`))

    }

    let map = new Map(cities, edges);
    map.drawMap();


    $(document).ready(function () {
        $("circle").each(function (index, element) {
            $(this).hover(
                function () {
                    $('#svgmap').append(`<svg id="tip1_rect"><rect width="${(cities[index]['name'].length/1.2+1.1)*11}" height="15" x="${1305 + cities[index]['coordinates'][0] * 34}" y="${-385 - cities[index]['coordinates'][1] * 28}"/></svg>`);
                    $('#svgmap').append(`<svg id="tip1"><text x="${1310 + cities[index]['coordinates'][0] * 34}" y="${-373 - cities[index]['coordinates'][1] * 28}">${name_of_cities[index]}</text></svg>`);
                    console.log(name_of_cities[index]);
                }, function () {
                    $('#tip1').remove();
                    $('#tip1_rect').remove();
                });
        });

    });
}

main()


