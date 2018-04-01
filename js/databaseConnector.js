class databaseConnector {
    constructor() {
        var mongojs = require('mongojs');
        var db = mongojs('hogeschool');

        this.trafficDocs = null;
        this.trafficDocsScaled = null;
        
        this.weatherDailyDocs = null;
        this.weatherDailyDocsScaled = null;

        this.weatherMonthlyDocs = null;
        this.weatherMonthlyDocsScaled = null;

        this.populationDocs = null;
        this.populationDocsScaled = null;

        var that = this;

        db['traffic'].find(function(err, docs) {
            that.trafficDocs = docs;
            that.trafficDocsScaled = docs;
        });

        db['weather-day'].find(function(err, docs) {
            that.weatherDailyDocs = docs;
            that.weatherDailyDocsScaled = docs;
        });

        db['weather-month'].find(function(err, docs) {
            that.weatherMonthlyDocs = docs;
            that.weatherMonthlyDocsScaled = docs;
        });

        db['population'].find(function(err, docs) {
            that.populationDocs = docs;
            that.populationDocsScaled = docs;
        });
    }
}