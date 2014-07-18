var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Subscriber = new Schema({
    email: {
        type  : String,
        unique: true
    },
    date : Date
});

module.exports = mongoose.model('Subscriber', Subscriber);
