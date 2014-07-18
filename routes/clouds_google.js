var config = require('../config'),
    googleapis = require('googleapis'),
    AccountModel = require('../models/account');

var async = require('async'),
    request = require('request'),
    fs = require('fs');

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
        oauth2Client.setCredentials(req.user.google);
        oauth2Client.refreshAccessToken(function (err, tokens) {
            res.send(tokens);
//            AccountModel.update({ _id: req.user._id }, { $set: {google: tokens} }, function (error, docs) {
//                if (error !== null) {
//                    req.flash('error', error.message);
//                }
//                res.redirect('/cloud-sync/google-dropbox');
//            });
        });
    },
    get    : function (req, res) {
        if (!req.user.google || req.user.google.access_token === undefined) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({
                status: false,
                msg   : 'not authenticated'
            }));
        } else {
            const PNG_FILE = 'eae6f5070a8cc2b7c37d4ecd0a2d8fe0.jpg';

            var fstatus = fs.linkSync('http://beta.hstor.org/getpro/habr/post_images/eae/6f5/070/eae6f5070a8cc2b7c37d4ecd0a2d8fe0.jpg');
            fs.open(PNG_FILE, 'r', function (status, fileDescripter) {
                if (status) {
                    callback(status.message);
                    return;
                }

                var buffer = new Buffer(fstatus.size);
                fs.read(fileDescripter, buffer, 0, fstatus.size, 0, function (err, num) {
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
                                    'title'  : PNG_FILE,
                                    'parents': [
                                        {
                                            'id': '0B482Ywq2Rr2hOEVjQlRuSEs0Nkk'
                                        }
                                    ]
                                })
                            },
                            {
                                'Content-Type': 'image/png',
                                'body'        : buffer
                            }
                        ]
                    }, function () {
//                        console.log(arguments);
                    });

                });
            });
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
                            if (resp !== null) {
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
                            } else {
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({
                                    status: false,
                                    msg   : 'refresh'
                                }));
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

    upload: function () {
//        const PNG_FILE = __dirname + '/../public/img/done.png';
        const PNG_FILE = 'http://beta.hstor.org/getpro/habr/post_images/eae/6f5/070/eae6f5070a8cc2b7c37d4ecd0a2d8fe0.jpg';

        var fstatus = fs.statSync(PNG_FILE);
        fs.open(PNG_FILE, 'r', function (status, fileDescripter) {
            if (status) {
                callback(status.message);
                return;
            }

            var buffer = new Buffer(fstatus.size);
            fs.read(fileDescripter, buffer, 0, fstatus.size, 0, function (err, num) {
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
                                'title'  : PNG_FILE,
                                'parents': [
                                    {
                                        'id': '0B482Ywq2Rr2hOEVjQlRuSEs0Nkk'
                                    }
                                ]
                            })
                        },
                        {
                            'Content-Type': 'image/png',
                            'body'        : buffer
                        }
                    ]
                }, function () {
                    console.log(arguments);
                });

            });
        });
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
