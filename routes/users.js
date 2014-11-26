var passport = require('passport'),
    crypto = require('crypto'),
    fs = require('fs'),
    mail = require('../mail').MGMail,
    http = require('http'),
    url = require('url');

var Account = require('../models/account');

var helper = require('../helpers')();

var forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    form_tpls = require('../forms')(forms, fields, validators, widgets);

module.exports = function (app, auth) {

    app.all('/register', function (req, res) {
        form_tpls.REGISTRATION.handle(req, {
            success: function (form) {
                Account.register(new Account({
                    username    : form.data.username,
                    email       : form.data.email,
                    first_name  : form.data.first_name,
                    last_name   : form.data.last_name,
                    account_type: 'free'
                }), form.data.password, function (err, account) {
                    if (err && err.code !== 11000) {
                        switch (err.code) {
                            case 11000:
                                req.flash('error', 'User already exists');
                                break;
                            default:
                                req.flash('error', err.message);
                                break;
                        }
                        return res.redirect('/register');
                    }

                    passport.authenticate('local')(req, res, function () {
                        mail.sendRaw("info@cloudsync.com", form.data.email, "Your registration with CloudSync!", "Thank you for registering with CloudSync!<br><br>See you on cloudsync.com<br><br><br>Your CloudSync! Team");

                        return res.redirect('/cloud-sync');
                    });
                });
            },
            other  : function (form) {
                res.render('user/register', {
                    title: 'Create Free Account',
                    form : form.toHTML(form_tpls.TWB)
                })
            }
        });
    });

    app.all('/login', function (req, res, next) {
        form_tpls.LOGIN.handle(req, {
            success: function (form) {
                passport.authenticate('local', function (err, user, info) {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        req.flash('error', 'Incorrect username or password!');
                        return res.redirect('/login');
                    }
                    req.logIn(user, function (err) {
                        if (err) {
                            return next(err);
                        }
                        return res.redirect('/cloud-sync');
                    });
                })(req, res, next);
            },
            other  : function (form) {
                res.render('user/login', {
                    title: 'Login',
                    user : req.user,
                    form : form.toHTML(form_tpls.TWB)
                })
            }
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', auth, function (req, res) {
        res.render('user/profile', {
            title: 'Profile',
            user : req.user
        });
    });

    app.all('/profile/edit', auth, function (req, res) {
        form_tpls.ACCOUNT_INFO.handle(req, {
            success: function (form) {
                delete form.data.photo;

                var dataToUpdate = form.data;
                if (req.files.photo.name.length > 0) {
                    var photo = req.files.photo;
                    var array = photo.name.split('.');
                    var public_url = '/uploads/' + crypto.randomBytes(30).toString('hex') + '.' + array[array.length - 1];
                    var file_path = './public' + public_url;

                    fs.rename(photo.path, file_path, function () {
                        if (fs.existsSync('./public' + req.user.photo)) {
                            fs.unlinkSync('./public' + req.user.photo);
                        }

                        dataToUpdate.photo = public_url;
                        Account.update({ _id: req.user._id }, { $set: dataToUpdate }, function (error, docs) {
                            if (error !== null) {
                                req.flash('error', error.message);
                            } else {
                                req.flash('success', 'Your profile has been successfully updated!');
                            }
                            res.redirect('/profile/edit')
                        });
                    });
                } else {
                    Account.update({ _id: req.user._id }, { $set: dataToUpdate }, function (error, docs) {
                        if (error !== null) {
                            req.flash('error', error.message);
                        } else {
                            req.flash('success', 'Your profile has been successfully updated!');
                        }
                        res.redirect('/profile/edit')
                    });
                }
            },
            other  : function (form) {
                var newForm = helper.cloneObj(form);
                newForm.fields = helper.completeObj(newForm.fields, req.user, 'first_name last_name email');

                res.render('user/edit', {
                    title: 'Edit profile',
                    user : req.user,
                    twb  : form_tpls.TWB,
                    form : newForm.toHTML(form_tpls.TWB)
                });
            }
        });
    });
};