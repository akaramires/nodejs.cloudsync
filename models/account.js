var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username    : {
        type  : String,
        unique: true
    },
    password    : String,
    email       : {
        type  : String,
        unique: true
    },
    first_name  : String,
    last_name   : String,
    photo       : String,
    google      : Object,
    dropbox     : Object,
    account_type: {
        type: String,
        enum: [
            'free',
            'silver',
            'gold'
        ]
    },
    created_at  : { type: Date },
    updated_at  : { type: Date }
});

Account.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
