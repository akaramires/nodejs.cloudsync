module.exports = function (app) {
    var auth = function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
        } else {
            next();
        }
    };

    require('./base')(app, auth);
    require('./users')(app, auth);
    require('./clouds')(app, auth);
};
