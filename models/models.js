var mongoose = require("mongoose");

var stocksSchema = new mongoose.Schema({
    name: String,
    stocks: [String]
});

mongoose.model('Symbols', stocksSchema);
