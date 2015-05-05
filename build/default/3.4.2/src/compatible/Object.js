
//兼容
if (!Object.keys) {

    Object.keys = function (obj) {

        if (obj == null) { // null 或 undefined
            throw new Error('Cannot convert undefined or null to object');
        }

        var a = [];

        if (!obj) {
            return a;
        }

        for (var key in obj) {
            a.push(key);
        }

        return a;
    };
}