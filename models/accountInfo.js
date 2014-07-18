var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Account = require('./account');

var AccountInfo = new Schema({
    address: String,
    photo  : String,
    account: {
        type: ObjectId,
        ref : 'Account'
    }
});

module.exports = mongoose.model('AccountInfo', AccountInfo);