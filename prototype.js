var ArrayPrototypes = function () {
};

ArrayPrototypes.prototype.sort = function (array, property) {
    array.sort(function (a, b) {
        if (a[property] < b[property])
            return -1;
        if (a[property] > b[property])
            return 1;
        return 0;
    });
    return array;
};

ArrayPrototypes.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

module.exports = new ArrayPrototypes();