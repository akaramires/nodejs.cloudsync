var url = require('url'),
    config = require('../config'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    form_tpls = require('../forms')(forms, fields, validators, widgets),
    mail = require('../mail').MGMail;

var SubscribeModel = require('../models/subscriber');

module.exports = function (app, auth) {
    app.get('/', function (req, res) {
        if (req.user) {
            res.redirect('/cloud-sync');
        }

        res.render('index', {
            title     : require('../config').site.title,
            user      : req.user,
            show_title: false
        });
    });

    app.post('/', function (req, res) {
        if (req.body.Subscribe != undefined) {
            var subscribe = new SubscribeModel({
                email: req.body.Subscribe.email
            });

            subscribe.save(function (err, thor) {
                if (err) {
                    req.flash('error', 'You’re already subscribed!');
                } else {
                    req.flash('success', 'Thank you for subscribing to the CloudSync! newsletter!');
                }
                res.redirect('/#newsletter');
            });
        } else {
            res.redirect('/');
        }
    });

    app.all('/contact-us', function (req, res) {
        form_tpls.CONTACT_US.handle(req, {
            success: function (form) {
                mail.sendRaw("info@cloudsync.com", config.options.contactEmails.join(', '), form.data.subject, form.data.message, function (err) {
                    if (err) {
                        var msg = 'Oh snap! Change a few things up and try submitting again.';
                        req.flash('error', msg);
                        console.log(err);
                    } else {
                        var msg = 'Your message was sent successfully!';
                        req.flash('success', msg);
                    }
                    res.redirect('/contact-us');
                });
            },
            other  : function (form) {
                res.render('pages/contact-us', {
                    title: 'Contact Us',
                    form : form.toHTML(form_tpls.TWB)
                })
            }
        });
    });

    app.get('/settings', auth, function (req, res) {
        res.render('settings', {
            title  : 'Settings',
            user   : req.user,
            links  : {
                google : !(req.user.google == undefined || req.user.google.access_token === undefined),
                dropbox: !(req.user.dropbox == undefined || req.user.dropbox.oauth_token === undefined)
            },
            authUrl: {
                google : '/cloud-sync/google/auth',
                dropbox: '/cloud-sync/dropbox/auth'
            }
        });
    });

    app.get('/404', function (req, mongres, next) {
        next();
    });

    app.use(function (req, res, next) {
        res.status(404);
        res.render('404', {
            title: "404",
            user : req.user,
            url  : req.url
        });
    });
};