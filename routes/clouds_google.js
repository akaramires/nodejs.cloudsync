var config = require('../config'),
    googleapis = require('googleapis'),
    AccountModel = require('../models/account');

var request = require('request'),
    fs = require('fs'),
    http = require('http');

var config_google = config.cloud.google,
    OAuth2Client = googleapis.OAuth2Client,
    client = config_google.CLIENT_ID,
    secret = config_google.CLIENT_SECRET,
    redirect = config_google.REDIRECT_URL,
    oauth2Client = new OAuth2Client(client, secret, redirect),
    drive_auth_url = oauth2Client.generateAuthUrl({
        access_type: config_google.ACCESS_TYPE,
        scope      : config_google.SCOPE
    });

exports.routes = {
    auth   : function (req, res) {
        res.redirect(drive_auth_url);
    },
    refresh: function (req, res) {
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
    get    : function (req, res) {
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

            googleapis.discover('drive', 'v2')
                .execute(function (err, client) {
                    if (!!err) {
                        console.log('failure', err);
                        return;
                    }

                    if (!oauth2Client.credentials) {
                        oauth2Client.credentials = req.user.google
                    }

                    var $_page = 0;
                    var retrievePageOfFiles = function (request, result) {
                        request.execute(function (err, resp) {
                            if (!!err || resp === null) {
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
                                result = result.concat(resp.items);
                                var nextPageToken = resp.nextPageToken;
                                if (nextPageToken) {
                                    $_page++;
                                    request = client.drive.files.list({
                                        'pageToken': nextPageToken,
                                        'q'        : "'" + req.body.parent.id + "' in parents and trashed = false"
                                    }).withAuthClient(oauth2Client);

                                    retrievePageOfFiles(request, result);
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

                    var initialRequest = client.drive.files.list({
                        'q': "'" + req.body.parent.id + "' in parents and trashed = false"
                    }).withAuthClient(oauth2Client);
                    retrievePageOfFiles(initialRequest, []);
                });
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
            var config_dropbox = config.cloud.dropbox,
                dbox = require("dbox"),
                dboxApp = dbox.app({
                    'app_key'   : config_dropbox.CLIENT_ID,
                    'app_secret': config_dropbox.CLIENT_SECRET,
                    'root'      : config_dropbox.ROOT
                });

            var client = dboxApp.client(req.user.dropbox),
                transfers = req.body.transfers,
                destinationID = req.body.destinationID;

            for (var i in transfers) {
                client.get(transfers[i].path, function (status, reply, metadata) {
                    request.post({
                        'url'      : 'https://www.googleapis.com/upload/drive/v2/files',
                        'qs'       : {
                            'uploadType': 'multipart'
                        },
                        'headers'  : {
                            'Authorization': 'Bearer ' + req.user.google.access_token
                        },
                        'multipart': [
                            {
                                'Content-Type': 'application/json; charset=UTF-8',
                                'body'        : JSON.stringify({
                                    'title'  : transfers[i].title,
                                    'parents': [
                                        {
                                            'id': destinationID
                                        }
                                    ]
                                })
                            },
                            {
                                'Content-Type': transfers[i].mime_type,
                                'body'        : reply
                            }
                        ]
                    }, function (err, httpResponse, body) {
                        var responseObj = {};
                        if (httpResponse.statusCode == 200) {
                            if (err) {
                                responseObj.status = false;
                                responseObj.message = err.message;
                            } else {
                                responseObj.status = true;
                            }
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(responseObj));
                        } else {
                            responseObj.status = false;
                            responseObj.message = JSON.parse(body).error.message;
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(responseObj));
                        }
                    });
                });
            }
        }
    },
    callback: function (req, res) {
        var code = req.query.code;
        oauth2Client.getToken(code, function (err, tokens) {
            AccountModel.update({ _id: req.user._id }, { $set: {google: tokens} }, function (error, docs) {
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
