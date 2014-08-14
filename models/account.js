var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username  : {
        type  : String,
        unique: true
    },
    password  : String,
    email     : {
        type  : String,
        unique: true
    },
    first_name: String,
    last_name : String,
    photo     : String,
    google    : Object,
    dropbox   : Object,
    status    : String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
