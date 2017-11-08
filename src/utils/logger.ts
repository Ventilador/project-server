export const logger = {
    log: support(console.log),
    error: support(console.error),
    warn: support(console.warn),
    debug: support(console.debug),
    info: support(console.info),
    format: support(toString)
};

export interface ILoggerFunction {
    (from: string, text: string, ...args: string[]): void;
}

function toString(from, text) {
    if (arguments.length === 2) {
        return from + ': ' + text;
    }
    let index = arguments.length - 1;
    const args = new Array(index);
    while (index--) {
        args[index] = arguments[index + 1];
    }
    return from + ': ' + format.apply(null, args);
}

function support(method: Function): ILoggerFunction {
    return function (from: string, text: string) {
        return method(toString.apply(null, arguments));
    };
}

const regExps = [/\{0\}/gm];
function format(s_) {
    let s = s_;
    if (arguments.length - 1 > regExps.length) {
        ensureRegExp(regExps.length, arguments.length - 1);
    }
    for (let i = 0, j = 1; j < arguments.length; i++ , j++) {
        s = s.replace(regExps[i], arguments[j]);
    }
    return s;
}

function ensureRegExp(from, to) {
    regExps.length = to;
    for (let i = from; i < to; i++) {
        regExps[i] = generateRegExp(i);
    }
}

function generateRegExp(number: string) {
    return new RegExp("\\{" + (arguments.length === 3 ? arguments[1] : number) + "\\}", "gm");
}
