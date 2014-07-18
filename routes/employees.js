var Employee = require('../models/employee');

module.exports = function (app, auth) {

    app.get('/employees', auth, function (req, res) {
        Employee.find({}, function (err, docs) {
            res.render('employees/index', {
                title    : 'Employees',
                employees: docs,
                user     : req.user
            });
        });
    });

    app.get('/employees/new', function (req, res) {
        res.render('employees/new', {
            title: 'New Employee',
            user : req.user
        });
    });

    app.post('/employees/new', function (req, res) {
        Employee.create({
            created_at: new Date(),
            title     : req.param('title'),
            name      : req.param('name'),
            user      : req.user
        }, function (error, docs) {
            res.redirect('/employees')
        });
    });

    app.get('/employees/edit/:_id', function (req, res) {
        Employee.findById(req.param('_id'), function (error, employee) {
            res.render('employees/edit', {
                title   : 'Edit Employee',
                employee: employee,
                user    : req.user
            });
        });
    });

    app.post('/employees/edit/:_id', function (req, res) {
        Employee.update({ _id: req.param('_id')}, {
            $set: {
                title: req.param('title'),
                name : req.param('name'),
                user : req.user
            }
        }, function (error, docs) {
            res.redirect('/employees')
        });
    });

    app.get('/employees/delete/:_id', function (req, res) {
        Employee.remove({ _id: req.param('_id')}, function (error, docs) {
            res.redirect('/employees')
        });
    });
};