/**
 * Created by ramires on 6/2/14.
 */

// https://github.com/caolan/forms

module.exports = function (forms, fields, validators, widgets) {
    var helper = require('./helpers')(),
        tag = require('./node_modules/forms/lib/tag');

    var FIELDS = {
        username  : fields.string({
            required       : true,
            widget         : widgets.text({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        password  : fields.password({
            label          : 'Password',
            required       : validators.required('You definitely want a password'),
            errorAfterField: true,
            widget         : widgets.password({ classes: [] }),
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        confirm   : fields.password({
            label          : 'Confirm',
            required       : validators.required('don\'t you know your own password?'),
            validators     : [validators.matchField('password')],
            errorAfterField: true,
            widget         : widgets.password({ classes: [] }),
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        email     : fields.email({
            label          : 'Email',
            required       : true,
            widget         : widgets.email({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        first_name: fields.string({
            label          : 'First name',
            required       : true,
            widget         : widgets.text({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        last_name : fields.string({
            label          : 'Last name',
            required       : true,
            widget         : widgets.text({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        photo     : fields.file({
            accept         : "image/png, image/jpeg, image/gif",
            label          : 'Photo',
            widget         : widgets.file({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            }
        })
    };
    var CONTACT_US_FIELDS = {
        email  : fields.email({
            label          : 'Email',
            required       : true,
            widget         : widgets.email({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        subject: fields.string({
            required       : true,
            widget         : widgets.text({ classes: [] }),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        }),
        message: fields.string({
            required       : true,
            widget         : widgets.textarea({ classes: [], rows: 4}),
            errorAfterField: true,
            cssClasses     : {
                label: ['col-sm-3 control-label']
            },
            value          : ''
        })
    };

    return {
        TWB         : function (name, object) {
            object.widget.classes = object.widget.classes || [];
            object.widget.classes.push('form-control');

            var label = object.labelHTML(name),
                html = '',
                widget = ''

            var error = object.error ? '<div class="col-sm-8 col-sm-offset-4 text-danger text-right">' + object.error.charAt(0).toUpperCase() + object.error.slice(1) + '</div>' : '',
                error_class = object.error ? 'has-error has-feedback' : '',
                error_icon = object.error ? '<span class="fa fa-times form-control-feedback"></span>' : '';

            if (object.widget.type === 'file') {
                var widgetHTML = function (name, f) {
                    if (!f) {
                        f = {};
                    }
                    return tag('input', [
                        {
                            type   : 'file',
                            name   : name,
                            id     : f.id === false ? false : (f.id || true),
                            accept : f.accept === false ? false : (f.accept || true),
                            classes: object.classes(),
                            value  : f.value
                        }
                    ]);
                };
                widget = widgetHTML(name, object);
                var wrap = '<div class="input-group image-preview" data-original-title="" title="">' +
                    '<input type="text" disabled="disabled" class="form-control image-preview-filename">' +
                    '<span class="input-group-btn">' +
                    '<button type="button" style="display:none;" class="btn btn-default image-preview-clear">' +
                    '<span class="fa fa-times"></span>' +
                    '</button>' +
                    '<div class="btn btn-default image-preview-input">' +
                    '<span class="fa fa-folder-open"></span>' +
                    '<span class="image-preview-input-title"></span>' +
                    widget +
                    '</div>' +
                    '</span>' +
                    '</div>';
                html = '<div class="form-group ' + error_class + '">' + label + '<div class="col-sm-8 col-sm-offset-1">' + wrap + '</div>' + error + '</div>';
            } else {
                widget = object.widget.toHTML(name, object);
                html = '<div class="form-group ' + error_class + '">' + label + '<div class="col-sm-8 col-sm-offset-1">' + widget + error_icon + '</div>' + error + '</div>';
            }

            return html;
        },
        LOGIN       : forms.create(helper.collectObj(FIELDS, 'username password')),
        REGISTRATION: forms.create(helper.collectObj(FIELDS, 'username password confirm email first_name last_name')),
        ACCOUNT_INFO: forms.create(helper.collectObj(FIELDS, 'first_name last_name email photo')),
        CONTACT_US  : forms.create(CONTACT_US_FIELDS)
    }
};


