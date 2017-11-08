(function (context: any) {
    let id = 0;
    context.nextId = function () { return ++id; };
    context.valueFn = function (val) { return val; };
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});

const fs = require('fs');


