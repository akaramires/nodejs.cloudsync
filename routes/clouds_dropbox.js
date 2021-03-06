var request = require('request');

var Prototypes = require('../prototype');

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
                        var folders = [];
                        var files = [];

                        for (var i in result.contents) {
                            if (result.contents[i].path != undefined) {
                                var title = result.contents[i].path.split('/');
                                result.contents[i].title = title[title.length - 1];

                                if (result.contents[i].is_dir == true) {
                                    folders.push(result.contents[i]);
                                } else {
                                    files.push(result.contents[i]);
                                }
                            }
                        }

                        folders = Prototypes.sort(folders, 'title');
                        files = Prototypes.sort(files, 'title');
                        var merged = folders.concat(files);

                        res.render('cloud/row-dropbox', {
                            list: merged
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
                        var downloadUrl, fileTitle;

                        downloadUrl = transfers[i].downloadUrl;
                        fileTitle = transfers[i].title;

                        var upload_id = null,
                            offset = 0,
                            options = {
                                'url'    : downloadUrl,
                                'headers': {
                                    'Authorization': 'Bearer ' + req.user.google.access_token
                                }
                            };

                        var requestGet = request.get(options);

                        if (config.settings.officeMimeTypes.indexOf(transfers[i].mimeType) >= 0) {
                            res.writeHead(200, { "Content-Type": "application/json"});
                            res.end(JSON.stringify({
                                type: 'error',
                                msg : 'Unfortunately this file format is not supported'
                            }));
                        } else {
                            var partOffset = 0;
                            var totalOffset = 0;

                            requestGet
                                .on('data', function (chunk) {
                                    console.log('on data');
                                    var params = {};

                                    if (offset > 0) {
                                        params.offset = offset;
                                    }

                                    if (upload_id !== null) {
                                        params.upload_id = upload_id;
                                    }

                                    partOffset += chunk.length;
                                    totalOffset += chunk.length;

                                    requestGet.pause();
                                    client.chunk(chunk, params, function (status, reply) {
                                        if (upload_id === null) {
                                            upload_id = reply.upload_id;
                                        }

                                        offset = reply.offset;
                                        console.log(upload_id, (offset / 1024 / 1024).toFixed(2) + ' mb');
                                        requestGet.resume();

                                        if ((partOffset / 1024 / 1024) > 1) {
                                            app.get('socket').emit('fileUpload', {
                                                type   : "google",
                                                id     : transfers[i].id,
                                                title  : fileTitle,
                                                percent: ((100 * totalOffset) / parseInt(transfers[i].fileSize)).toFixed(2)
                                            });
                                            partOffset = 0;
                                        }
                                    });
                                })
                                .on('end', function () {
                                    client.commit_chunks(fileTitle, {
                                        upload_id: upload_id,
                                        overwrite: false
                                    }, function (status, reply) {
                                        console.log('File was uploaded', status, reply);
                                    });

                                    app.get('socket').emit('fileUpload', {
                                        status  : 'success',
                                        msg     : fileTitle + ' file upload is finished!',
                                        type    : 'google',
                                        id      : transfers[i].id,
                                        title   : fileTitle,
                                        progress: 'end',
                                        percent : 100
                                    });
                                })
                                .on("error", function (err) {
                                    console.log('error', error);
                                });

                            res.writeHead(200, { "Content-Type": "application/json"});
                            res.end(JSON.stringify({
                                type: 'success',
                                msg : 'Uploading the "' + fileTitle + '" started'
                            }));
                        }
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
}
;

