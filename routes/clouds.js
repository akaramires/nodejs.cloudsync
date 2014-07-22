require('../prototype');

var baseRoutes = require('./clouds_base').routes,
    googleRoutes = require('./clouds_google').routes,
    dropboxRoutes = require('./clouds_dropbox').routes;

module.exports = function (app, auth) {
    app.get('/cloud-sync', auth, baseRoutes.cloudSync);
    app.get('/cloud-sync/google-dropbox', auth, baseRoutes.googleDropbox);

    app.get('/cloud-sync/google/auth', auth, googleRoutes.auth);
    app.get('/cloud-sync/google/refresh', auth, googleRoutes.refresh);
    app.get('/cloud-sync/google/callback', auth, googleRoutes.callback);
    app.post('/cloud-sync/google/upload', auth, googleRoutes.upload);
    app.post('/cloud-sync/google/get', auth, googleRoutes.get);

    app.get('/cloud-sync/dropbox/auth', auth, dropboxRoutes.auth);
    app.get('/cloud-sync/dropbox/callback', auth, dropboxRoutes.callback);
    app.post('/cloud-sync/dropbox/get', auth, dropboxRoutes.get);
};