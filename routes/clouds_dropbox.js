var config = require('../config'),
    config_dropbox = config.cloud[global.env].dropbox,
    dbox = require("dbox"),
    dboxApp = dbox.app({
        'app_key'   : config_dropbox.CLIENT_ID,
        'app_secret': config_dropbox.CLIENT_SECRET,
        'root'      : config_dropbox.ROOT
    });

var AccountModel = require('../models/account');

exports.routes = function (app) {
    return {
        auth: function (req, res) {
            if (req.user.dropbox === undefined || req.user.dropbox.oauth_token === undefined) {
                req.session.dboxStore = {};
                req.session.dboxStore.dboxApp = dboxApp;

                dboxApp.requesttoken(function (status, request_token) {
                    req.session.dboxStore.request_token = request_token;

                    res.redirect(config_dropbox.AUTH_URL + '?oauth_token=' + request_token.oauth_token +
                        '&oauth_callback=' + config_dropbox.REDIRECT_URL);
                    res.end();
                });
            } else {
                res.redirect('/cloud-sync');
            }
        },

        get: function (req, res) {
            if (!req.user.dropbox || req.user.dropbox.oauth_token === undefined) {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    status: false,
                    msg   : 'not authenticated'
                }));
            } else {
                var path = '/';
                if (req.body.parent !== undefined) {
                    if (req.body.parent.id === 'root' || req.body.parent.path === 'root') {

                    } else {
                        path = req.body.parent.path;
                    }
                }
                var client = dboxApp.client(req.user.dropbox);

                if (client != null) {
                    client.metadata(path, {}, function (status, result) {
                        for (var i in result.contents) {
                            if (result.contents[i].path != undefined) {
                                var title = result.contents[i].path.split('/');
                                result.contents[i].title = title[title.length - 1];
//
//                            client.get(result.contents[i].path, function (status, reply, metadata) {
//                                res.send(reply);
//                            })
                            }
                        }
                        res.render('cloud/row-dropbox', {
                            list: result.contents
                        }, function (err, html) {
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({
                                status: true,
                                html  : html
                            }));
                        });
                    });
                } else {
                    req.flash('error', 'Client is not defined!');
                    res.redirect('/cloud-sync');
                }
            }
        },

        upload: function (req, res) {
            if (req.body.transfers === undefined) {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    status: false
                }));
            } else {

                var googleapis = require('googleapis'),
                    config_google = config.cloud[global.env].google,
                    OAuth2 = googleapis.auth.OAuth2,
                    clientDrive = config_google.CLIENT_ID,
                    secret = config_google.CLIENT_SECRET,
                    redirect = config_google.REDIRECT_URL;

                var oauth2Client = new OAuth2(clientDrive, secret, redirect),
                    drive = googleapis.drive('v2'),
                    drive_auth_url = oauth2Client.generateAuthUrl({
                        access_type: config_google.ACCESS_TYPE,
                        scope      : config_google.SCOPE
                    });

                var transfers = req.body.transfers,
                    destinationID = req.body.destinationID;

                oauth2Client.setCredentials({
                    access_token: req.user.google.access_token
                });

                var client = dboxApp.client(req.user.dropbox),
                    fs = require('fs');

                for (var i in transfers) {
                    if (typeof transfers[i] !== 'function') {
//                        drive.files.get({
//                            fileId: transfers[i].id,
//                            auth  : oauth2Client
//                        }, function (err, response) {
//                            if (!!err || response === null) {
//                                console.log('error', err);
//                            } else {
//                                client.put('/test', fs.createReadStream(transfers[i].downloadUrl), function (status, reply) {
//                                    console.log(reply)
//                                })
//                            }
//                        });
                    }
                }
            }
        },

        callback: function (req, res) {
            var request_token = req.session.dboxStore.request_token;

            dboxApp.accesstoken(request_token, function (status, access_token) {
                AccountModel.update({ _id: req.user._id }, { $set: {dropbox: access_token} }, function (error, docs) {
                    if (error !== null) {
                        req.flash('error', error.message);
                    } else {
                        req.flash('success', 'Dropbox connected successfully!');
                    }
                    res.redirect('/cloud-sync');
                });
            });
        }
    };
};

