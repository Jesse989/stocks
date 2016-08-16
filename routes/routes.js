var express = require("express");
var router = express.Router();
var request = require("request");
var mongoose = require("mongoose");
var Symbols = mongoose.model('Symbols');


router.route('/')
    .get(function(req, res) {
        Symbols.find(function(err, results){
            if(err) return err;
            res.send(results[0].stocks);
        });
    })
    .post(function(req, res){
        Symbols.findOne(function(err, results){
            if(err) return err;
            results.stocks = req.body.stocks;
            results.save(function(err, data) {
                if(err) return err;
                res.status(200).send(data);
            })
        });
    });
    
router.route('/:id')
    .get(function(req, res) {
        get_stock(req.params.id, function(error, response, body){
            if(body.substr(0,1) === '<'){
                res.status(404).send('data not found');
            } else {
                var parsed = JSON.parse(body);
                var finishedArray = [];
                for(var i in parsed.Dates){
                    var milliseconds = [];
                    milliseconds[i] = new Date(parsed.Dates[i]).getTime();
                    finishedArray.push([milliseconds[i], parsed.Elements[0].DataSeries.close.values[i]]);
                }
                res.status(200).send(finishedArray);
            }
        });
    });

var get_stock = function(stock_symbol, callback) {
    //url for request
    var url = 'http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=';
    
    
    var parameters = { 
        "Normalized":false,
        "NumberOfDays":365,
        "DataPeriod":"Day",
        "Elements":[{
            "Symbol":stock_symbol,
            "Type":"price",
            "Params":["c"]}
    ]};
            
    //send request
    var apiURL = url + JSON.stringify(parameters);
    
    request(apiURL, function(error, response, body) {
        if(error) return error;
        if(body.charAt(0) !== 'R'){
            callback(error, response, body);
        }
    });
};
 
module.exports = router;