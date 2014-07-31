var config = require('../config'),
    googleapis = require('googleapis'),
    AccountModel = require('../models/account');

var request = require('request'),
    fs = require('fs'),
    path = require('path'),
    http = require('http');

var config_google = config.cloud[global.env].google,
    OAuth2 = googleapis.auth.OAuth2,
    client = config_google.CLIENT_ID,
    secret = config_google.CLIENT_SECRET,
    redirect = config_google.REDIRECT_URL;

var oauth2Client = new OAuth2(client, secret, redirect),
    drive = googleapis.drive('v2'),
    drive_auth_url = oauth2Client.generateAuthUrl({
        access_type: config_google.ACCESS_TYPE,
        scope      : config_google.SCOPE
    });

exports.routes = {
    auth    : function (req, res) {
        res.redirect(drive_auth_url);
    },
    refresh : function (req, res) {
        if (req.user.google.refresh_token === undefined) {
            res.redirect(drive_auth_url);
        } else {
            oauth2Client.setCredentials(req.user.google);
            oauth2Client.refreshAccessToken(function (err, tokens) {
                res.send(tokens);
//                AccountModel.update({ _id: req.user._id }, { $set: {google: tokens} }, function (error, docs) {
//                    if (error !== null) {
//                        req.flash('error', error.message);
//                    }
//                    res.redirect('/cloud-sync/google-dropbox');
//                });
            });
        }
    },
    get     : function (req, res) {
        if (!req.user.google || req.user.google.access_token === undefined) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                status: false,
                msg   : 'not authenticated'
            }));
        } else {
            if (req.body.parent === undefined) {
                req.body.parent = {id: 'root'};
            }

            oauth2Client.setCredentials({
                access_token: req.user.google.access_token
            });

            var initialParams = {
                q   : '"' + req.body.parent.id + '" in parents and trashed = false',
                auth: oauth2Client
            };

            var retrievePageOfFiles = function (params, result) {
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        initialParams[key] = params[key];
                    }
                }

                drive.files.list(initialParams, function (err, response) {
                    if (!!err || response === null) {
                        console.log('error', err);

                        res.render('cloud/refresh', {
                            url: '/cloud-sync/google/refresh'
                        }, function (err, html) {
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({
                                status: false,
                                msg   : 'refresh',
                                html  : html
                            }));
                        });
                    } else {
                        result = result.concat(response.items);
                        var nextPageToken = response.nextPageToken;
                        if (nextPageToken) {
                            retrievePageOfFiles({ pageToken: nextPageToken }, result);
                        } else {
                            result.sort(function (a, b) {
                                if (a.title < b.title)
                                    return -1;
                                if (a.title > b.title)
                                    return 1;
                                return 0;
                            });

                            res.render('cloud/row-google', {
                                list: result
                            }, function (err, html) {
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({
                                    status: true,
                                    html  : html
                                }));
                            });
                        }
                    }
                });
            };

            retrievePageOfFiles(initialParams, []);
        }
    },


    // http://runnable.com/UTlPMF-f2W1TAAAk/create-a-new-doc-with-google-drive-api
    // http://debuggable.com/posts/streaming-file-uploads-with-node-js:4ac094b2-b6c8-4a7f-bd07-28accbdd56cb
    // http://www.componentix.com/blog/9/file-uploads-using-nodejs-now-for-real
    upload  : function (req, res) {
        if (req.body.transfers === undefined) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                status: false
            }));
        } else {
            var config_dropbox = config.cloud[global.env].dropbox,
                dbox = require("dbox"),
                dboxApp = dbox.app({
                    'app_key'   : config_dropbox.CLIENT_ID,
                    'app_secret': config_dropbox.CLIENT_SECRET,
                    'root'      : config_dropbox.ROOT
                });

            var clientDB = dboxApp.client(req.user.dropbox),
                transfers = req.body.transfers,
                destinationID = req.body.destinationID;

            oauth2Client.setCredentials({
                access_token: req.user.google.access_token
            });

            console.log(transfers);
            for (var i in transfers) {
                if (typeof transfers[i] !== 'function') {
                    console.log('start upload: ', transfers[i].title);

                    var total = 0;
                    var media = clientDB.stream(transfers[i].path);
                    media.addListener('data', function (part) {
                        total += part.length;
                        console.log((total/1024/1024).toFixed(2) + ' mb');
                    });

                    drive.files.insert({
                        media   : media,
                        resource: {
                            title   : transfers[i].title,
                            mimeType: transfers[i].mime_type,
                            parents : [
                                { id: destinationID }
                            ]
                        },
                        auth    : oauth2Client
                    }, function (err, insertRes) {
                        console.log(1);
                        res.writeHead(200, {"Content-Type": "application/json"});
                        if (!!err) {
                            res.end(JSON.stringify({
                                status: false
                            }));
                        } else {
                            res.end(JSON.stringify({
                                status: true,
                                msg   : 'Inserted file ID: ' + insertRes.id
                            }));
                        }
                    });

                    res.end(JSON.stringify({
                        status: true,
                        msg   : 'Inserted file ID: '
                    }));
                }
            }
        }
    },
    callback: function (req, res) {
        var code = req.query.code;
        oauth2Client.getToken(code, function (err, tokens) {
            AccountModel.update({ _id: req.user._id }, { $set: {google: tokens} }, function (error, docs) {
                req.user.google = tokens;

                if (error !== null) {
                    req.flash('error', error.message);
                } else {
                    req.flash('success', 'Google Drive connected successfully!');
                }
                res.redirect('/cloud-sync');
            });
        });
    }
};
