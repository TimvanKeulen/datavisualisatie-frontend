class databaseConnector {
    constructor() {
        var mongojs = require('mongojs');
        var db = mongojs('hogeschool');

        this.trafficDocs = null;
        this.weatherDailyDocs = null;
        this.weatherMonthlyDocs = null;
        this.populationDocs = null;

        var that = this;

        db['traffic'].find(function(err, docs) {
            that.trafficDocs = docs;
        });

        db['weather-day'].find(function(err, docs) {
            that.weatherDailyDocs = docs;
        });

        db['weather-month'].find(function(err, docs) {
            that.weatherMonthlyDocs = docs;
        });

        db['population'].find(function(err, docs) {
            that.populationDocs = docs;
        });
    }
}