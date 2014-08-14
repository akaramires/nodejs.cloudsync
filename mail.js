var Mailgun = require('mailgun').Mailgun,
    config = require('./config');

var MGMail = function () {
};

MGMail.prototype.sendRaw = function (from, to, subject, text, cb) {
    var mgun = new Mailgun(config.mailgun.API_KEY);
    mgun.sendRaw(from,
        config.options.contactEmails,
            'From: ' + from +
            '\nTo: ' + to +
            '\nContent-Type: text/html; charset=utf-8' +
            '\nSubject: ' + subject +
            '\n\n' + text,
            cb || function () {
        });
};

exports.MGMail = new MGMail();