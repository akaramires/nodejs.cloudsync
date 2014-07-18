var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Employee = new Schema({
    name      : String,
    title     : String,
    created_at: Date
});

module.exports = mongoose.model('Employee', Employee);