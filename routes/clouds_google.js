var googleapis = require('googleapis'),
    dbox = require("dbox"),
    config = require('../config');

var config_google = config.cloud[global.env].google,
    OAuth2 = googleapis.auth.OAuth2,
    client = config_google.CLIENT_ID,
    oauth2Client = new OAuth2(client, config_google.CLIENT_SECRET, config_google.REDIRECT_URL),
    drive = googleapis.drive('v2'),
    drive_auth_url = oauth2Client.generateAuthUrl({
        access_type: config_google.ACCESS_TYPE,
        scope      : config_google.SCOPE
    });

var config_dropbox = config.cloud[global.env].dropbox,
    dboxApp = dbox.app({
        app_key   : config_dropbox.CLIENT_ID,
        app_secret: config_dropbox.CLIENT_SECRET,
        root      : config_dropbox.ROOT
    });

var AccountModel = require('../models/account'),
    Prototypes = require('../prototype');

exports.routes = function (app) {
    return {
        auth: function (req, res) {
            res.redirect(drive_auth_url);
        },
//        refresh: function (req, res) {
//            if (req.user.google.refresh_token === undefined) {
//                res.redirect(drive_auth_url);
//            } else {
//                oauth2Client.setCredentials(req.user.google);
//                oauth2Client.refreshAccessToken(function (err, tokens) {
//                    res.send(tokens);
////                AccountModel.update({ _id: req.user._id }, { $set: {google: tokens} }, function (error, docs) {
////                    if (error !== null) {
////                        req.flash('error', error.message);
////                    }
////                    res.redirect('/cloud-sync/google-dropbox');
////                });
//                });
//            }
//        },
        get : function (req, res) {
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
                    q   : '"' + req.body.parent.id + '" in parents and ' +
                        '(mimeType = "application/vnd.google-apps.folder" or not mimeType contains "google-apps") and ' +
                        '(mimeType != "' + config.settings.officeMimeTypes.join('" and mimeType != "') + '") and ' +
                        'trashed = false',
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
                                var folders = [];
                                var files = [];

                                for (var i in result) {
                                    if (result[i].mimeType == 'application/vnd.google-apps.folder') {
                                        folders.push(result[i]);
                                    } else {
                                        files.push(result[i]);
                                    }
                                }

                                folders = Prototypes.sort(folders, 'title');
                                files = Prototypes.sort(files, 'title');

                                var merged = folders.concat(files);

                                res.render('cloud/row-google', {
                                    list: merged
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


        upload  : function (req, res) {
            if (req.body.transfers === undefined) {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({
                    status: false
                }));
            } else {
                var clientDB = dboxApp.client(req.user.dropbox),
                    transfers = req.body.transfers,
                    destinationID = req.body.destinationID;

                oauth2Client.setCredentials({
                    access_token: req.user.google.access_token
                });

                for (var i in transfers) {
                    if (typeof transfers[i] !== 'function') {
                        var totalProgress = 0;
                        var totalSize = 0;
                        var partSize = 0;
                        var media = clientDB.stream(transfers[i].path);

                        media.on('data', function (chunk) {
                            partSize += chunk.length;
                            totalSize += chunk.length;
                            totalProgress = (totalSize / 1024 / 1024).toFixed(1) + ' mb';

                            if ((partSize / 1024 / 1024) > 1) {
                                app.get('socket').emit('fileUpload', {
                                    type    : "dropbox",
                                    path    : transfers[i].path,
                                    title   : transfers[i].title,
                                    progress: totalProgress,
                                    percent : ((100 * totalSize) / parseInt(transfers[i].bytes)).toFixed(2)
                                });
                                partSize = 0;

                                console.log(totalProgress);
                            }
                        });

                        media.on('end', function () {
                            app.get('socket').emit('fileUpload', {
                                status  : 'success',
                                msg     : transfers[i].title + ' file upload is finished!',
                                type    : 'dropbox',
                                path    : transfers[i].path,
                                title   : transfers[i].title,
                                progress: 'end',
                                percent : 100
                            });
                        })

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
                            res.writeHead(200, {"Content-Type": "application/json"});

                            if (!!err) {
                                res.end(JSON.stringify({
                                    type: 'error',
                                    msg : err.message
                                }));
                            } else {
                                res.end(JSON.stringify({
                                    type: 'success',
                                    msg : 'Inserted file ID: ' + insertRes.id
                                }));
                            }
                        });

                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({
                            type: 'success',
                            msg : 'Uploading the "' + transfers[i].title + '" started'
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
};
