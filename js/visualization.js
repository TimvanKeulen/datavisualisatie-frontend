var dateformat = require('dateformat');
var mongojs = require('mongojs');
var db = mongojs('hogeschool');

var startDate1 = new Date(2017, 0, 1);
var startDate2 = new Date(1995, 1, 1);
var endDate1 = new Date(2018, 0, 1);

var myChart = null;
var ctx = null;

var myChart2 = null;
var ctx2 = null;

var myChart3 = null;
var ctx3 = null;

var currentContext = 0;
var options = null;
var options2 = null;
var options3 = null;

var generic_opt = {
    scales: {
        xAxes: [{
            type: 'time',
            ticks: {
                autoSkip: true
            },
            time: {
                unit: 'day'
            }
        }]
    }
};

document.getElementById("context-1").addEventListener("click", function () {
    switchVisualisation(0);
});

document.getElementById("context-2").addEventListener("click", function () {
    switchVisualisation(1);
});

var weatherDayDocuments;
var weatherMonthlyDocs;
var trafficDocs;
var populationDocs;

var day;
var month;
var traffic;
var population;

queryWeatherDay();
queryWeatherMonth();
queryTraffic();
queryPopulation();

function queryWeatherDay(filter, min, max) {
    if (filter) {
        db['weather-day'].find({
            "averageTemperature": {
                "$gte": min,
                "$lte": max
            },
            "dateTime": {
                "$gte": startDate1

            }
        }, function (err, docs) {
            weatherDayDocuments = docs;
        });
    } else {
        db['weather-day'].find({
            "dateTime": {
                "$gte": startDate1
            }
        }).toArray(
            function (err, docs) {
                weatherDayDocuments = docs;
            });
    }
}

function queryWeatherMonth(filter, min, max) {
    if (filter) {
        db['weather-month'].find({
            "averageTemperature": {
                "$gte": parseFloat(min),
                "$lte": parseFloat(max)
            },
            "dateTime": {
                "$gte": startDate2

            }
        }, function (err, docs) {
            weatherMonthlyDocs = docs;
        });
    } else {
        db['weather-month'].find({
                "dateTime": {
                    "$gte": startDate2
                }
            },
            function (err, docs) {
                weatherMonthlyDocs = docs;
            });
    }
}

function queryTraffic(filter, min, max) {
    db['traffic'].find({
            "dateTime": {
                "$gte": startDate1,
                "$lte": endDate1

            }
        },
        function (err, docs) {
            trafficDocs = docs;
        });
}

function queryPopulation(filter, d_min, d_max, b_min, b_max) {
    if (filter) {
        db['population'].find({
            "totalDeaths": {
                "$gte": d_min,
                "$lte": d_max
            },
            "bornAlive": {
                "$gte": b_min,
                "$lte": b_max
            },
            "dateTime": {
                "$gte": startDate2

            }
        }, function (err, docs) {
            populationDocs = docs;
        });
    } else {
        db['population'].find({
            "dateTime": {
                "$gte": startDate2

            }
        }).toArray(
            function (err, docs) {
                populationDocs = docs;
            });
    }
}

function getPropertyArrayFromCollection(objectName, collection) {
    var values = [];
    var length = collection.length;
    for (i = 0; i < length; i++) {
        values.push(collection[i][objectName]);
    }
    return (values);
}

document.getElementById("find-button").addEventListener("click", function (event) {
    findNewDocuments(event);
});

function findNewDocuments(event) {
    event.preventDefault();
    var minTemp = document.querySelector("#tempMin").value;
    var maxTemp = document.querySelector("#tempMax").value;

    var startDate = new Date(document.querySelector("#startingDateSelector").value).getTime();
    var endDate = new Date(document.querySelector("#endingDateSelector").value).getTime();

    if (currentContext == 0) {
        new_day = filterDate(weatherDayDocuments, startDate, endDate);
        new_day = filterValue(new_day, "averageTemperature", minTemp, maxTemp);
        buildOptionsWeatherDay(new_day);

        new_traffic = filterTraffic(new_day, trafficDocs);
        builOptionsTraffic(new_traffic);

        myChart.destroy();
        myChart = new Chart(ctx, options);

        myChart2.destroy();
        myChart2 = new Chart(ctx2, options2);
    } else {
        new_month = filterDate(weatherMonthlyDocs, startDate, endDate);
        new_month = filterValue(new_month, "averageTemperature", minTemp, maxTemp);
        new_population = filterPopulation(new_month, populationDocs);

        console.log(new_month);
        console.log(new_population);
        buildOptionsGraph3(new_month,new_population);

        myChart3.destroy();
        myChart3 = new Chart(ctx3, options3);
    }
}

function filterDate(col, minDate, maxDate) {
    var collection = col.slice();
    for (i = 0; i < collection.length; i++) {
        date = new Date(collection[i]['dateTime']).getTime();

        if (date > maxDate || date < minDate) {
            collection.splice(i, 1);
            i--;
        }
    }
    return collection;
}

function filterValue(col, property, minValue, maxValue) {
    var collection = col.slice();
    for (i = 0; i < collection.length; i++) {
        value = collection[i][property];
        if (value > maxValue || value < minValue) {
            collection.splice(i, 1);
            i--;
        }
    }
    return collection;
}

function filterTraffic(weatherCollection, col) {
    var collection = col.slice();
    var dates = getPropertyArrayFromCollection('dateTime', weatherCollection);
    var dateTimes = [];
    for (i = 0; i < dates.length; i++) {
        var date = new Date(dates[i]).setHours(0, 0, 0, 0);
        dateTimes[i] = date;
    }
    for (i = 0; i < collection.length; i++) {
        var date2 = new Date(collection[i]['dateTime']).setHours(0, 0, 0, 0);
        if (dateTimes.includes(date2)) {
            continue;
        } else {
            collection.splice(i, 1);
            i--;
        }
    }
    return collection;
}

function filterPopulation(weatherCollection, col) {
    var collection = col.slice();
    var dates = getPropertyArrayFromCollection('dateTime', weatherCollection);
    var dateTimes = [];
    for (i = 0; i < dates.length; i++) {
        var date_in2 = new Date(dates[i]).setHours(0, 0, 0, 0);
        var date = new Date(date_in2).setDate(1);
        dateTimes[i] = date;
    }
    for (i = 0; i < collection.length; i++) {
        var date_in = new Date(collection[i]['dateTime']).setHours(0, 0, 0, 0);
        var date2 = new Date(date_in).setDate(1);
        if (dateTimes.includes(date2)) {
            continue;
        } else {
            collection.splice(i, 1);
            i--;
        }
    }
    return collection;
}

function builOptionsTraffic(traffic) {
    options = {
        type: 'bar',
        data: {
            labels: getPropertyArrayFromCollection("dateTime", traffic),
            datasets: [{
                    label: "Average jam length",
                    data: getPropertyArrayFromCollection("averageLength", traffic),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: "Total jam length",
                    data: getPropertyArrayFromCollection("totalLength", traffic),
                    backgroundColor: '#e74c3c'
                },
                {
                    label: "Average weight",
                    data: getPropertyArrayFromCollection("averageZwaarte", traffic),
                    backgroundColor: '#f1c40f'
                },
                {
                    label: "Average duration",
                    data: getPropertyArrayFromCollection("averageDuration", traffic),
                    backgroundColor: '#8e44ad'
                }
            ]
        },
        options: generic_opt
    };
}

function buildOptionsWeatherDay(day) {
    options2 = {
        type: 'bar',
        data: {
            labels: getPropertyArrayFromCollection("dateTime", day),
            datasets: [{
                    label: "Avg. temperature",
                    data: getPropertyArrayFromCollection("averageTemperature", day),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: "Lowest temperature",
                    data: getPropertyArrayFromCollection("lowestTemperature", day),
                    backgroundColor: '#3498db'
                },
                {
                    label: "Highest temperature",
                    data: getPropertyArrayFromCollection("highestTemperature", day),
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: generic_opt
    };
}

function buildOptionsGraph3(month, population) {
    options3 = {
        type: 'bar',
        data: {
            labels: getPropertyArrayFromCollection("dateTime", population),
            datasets: [{
                    label: "Born alive",
                    data: getPropertyArrayFromCollection("bornAlive", population),
                    backgroundColor: '#2ecc71',
                    yAxisID: 'y-axis-1',
                },
                {

                    label: "Deaths",
                    data: getPropertyArrayFromCollection("totalDeaths", population),
                    backgroundColor: '#e74c3c',
                    yAxisID: 'y-axis-1',
                },
                {
                    type: 'line',
                    label: "Average Tempature",
                    data: getPropertyArrayFromCollection("averageTemperature", month),
                    backgroundColor: '#f1c40f',
                    yAxisID: 'y-axis-2',
                    fill: false
                },
            ]
        },
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title: {
                display: true,
                text: 'Chart.js Line Chart - Multi Axis'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        autoSkip: true
                    },
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',

                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    };
}


function switchVisualisation(visualisation) {
    if (visualisation == 0) {
        currentContext = 0;
        enableVisualisation("visualisation-1");
        disableVisualisation("visualisation-2");     
    } else if (visualisation == 1) {
        currentContext = 1;
        enableVisualisation("visualisation-2");
        disableVisualisation("visualisation-1");
    }
}

function enableVisualisation(visName) {
    document.getElementById(visName).style.display = "block";
}

function disableVisualisation(visName) {
    document.getElementById(visName).style.display = "none";
}

setTimeout(function () {
    day = weatherDayDocuments;
    month = weatherMonthlyDocs;
    traffic = trafficDocs;
    population = populationDocs;

    if (currentContext == 0) {
        document.querySelector("#startingDateSelector").value = dateformat(startDate1, "yyyy-mm-dd");
        document.querySelector("#endingDateSelector").value = dateformat(endDate1, "yyyy-mm-dd");
    } else {
        document.querySelector("#startingDateSelector").value = dateformat(startDate2, "yyyy-mm-dd");
        document.querySelector("#endingDateSelector").value = dateformat(endDate1, "yyyy-mm-dd");
    }

    options = {
        type: 'bar',
        data: {
            labels: getPropertyArrayFromCollection("dateTime", traffic),
            datasets: [{
                    label: "Average jam length",
                    data: getPropertyArrayFromCollection("averageLength", traffic),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: "Total jam length",
                    data: getPropertyArrayFromCollection("totalLength", traffic),
                    backgroundColor: '#e74c3c'
                },
                {
                    label: "Average weight",
                    data: getPropertyArrayFromCollection("averageZwaarte", traffic),
                    backgroundColor: '#f1c40f'
                },
                {
                    label: "Average duration",
                    data: getPropertyArrayFromCollection("averageDuration", traffic),
                    backgroundColor: '#8e44ad'
                }
            ]
        },
        options: generic_opt
    };

    options2 = {
        type: 'bar',
        data: {
            labels: getPropertyArrayFromCollection("dateTime", day),
            datasets: [{
                    label: "Avg. temperature",
                    data: getPropertyArrayFromCollection("averageTemperature", day),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: "Lowest temperature",
                    data: getPropertyArrayFromCollection("lowestTemperature", day),
                    backgroundColor: '#3498db'
                },
                {
                    label: "Highest temperature",
                    data: getPropertyArrayFromCollection("highestTemperature", day),
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: generic_opt
    };

    options3 = {
        type: 'bar',
        data: {
            labels: getPropertyArrayFromCollection("dateTime", population),
            datasets: [{
                    label: "Born alive",
                    data: getPropertyArrayFromCollection("bornAlive", population),
                    backgroundColor: '#2ecc71',
                    yAxisID: 'y-axis-1',
                },
                {

                    label: "Deaths",
                    data: getPropertyArrayFromCollection("totalDeaths", population),
                    backgroundColor: '#e74c3c',
                    yAxisID: 'y-axis-1',
                },
                {
                    type: 'line',
                    label: "Average Tempature",
                    data: getPropertyArrayFromCollection("averageTemperature", month),
                    backgroundColor: '#f1c40f',
                    yAxisID: 'y-axis-2',
                    fill: false
                },
            ]
        },
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title: {
                display: true,
                text: 'Chart.js Line Chart - Multi Axis'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    ticks: {
                        autoSkip: true
                    },
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',

                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    };



    ctx = document.getElementById("myChart").getContext('2d');
    ctx2 = document.getElementById("myChart2").getContext('2d');
    ctx3 = document.getElementById("myChart3").getContext('2d');

    myChart = new Chart(ctx, options);
    myChart2 = new Chart(ctx2, options2);
    myChart3 = new Chart(ctx3, options3);
}, 2000);