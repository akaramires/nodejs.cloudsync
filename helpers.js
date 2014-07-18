module.exports = function () {
    return {
        completeObj: function (to, from, fieldNames) {
            if (typeof fieldNames === 'string') {
                fieldNames = fieldNames.replace(/\s{2,}/g, ' ').split(' ');
            }

            for (var i in fieldNames) {
                if (typeof to[fieldNames[i]] === 'object') {
                    to[fieldNames[i]].value = from[fieldNames[i]];
                }
            }

            return to;
        },
        cloneObj   : function (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();

            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }

            return copy;
        },
        collectObj : function (src, fields) {
            var objResult = {};

            if (typeof fields === 'string') {
                fields = fields.replace(/\s{2,}/g, ' ').split(' ');
            }

            for (var i in fields) {
                if (typeof objResult[fields[i]] === 'undefined') {
                    objResult[fields[i]] = src[fields[i]];
                }
            }
            return objResult;
        }
    };
};
