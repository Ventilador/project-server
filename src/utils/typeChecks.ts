export function isFunction(thing: any) {
    return typeof thing === 'function';
}


export function isString(thing: any) {
    return typeof thing === 'string';
}

export function isDefined(thing: any) {
    return typeof thing !== 'undefined';
}

export function isUndefined(thing: any) {
    return typeof thing === 'undefined';
}

export function isNumber(thing: any) {
    return typeof thing === 'number';
}

export function isBoolean(thing: any) {
    return typeof thing === 'boolean';
}

export function isObject(thing: any) {
    return typeof thing === 'object';
}

export const isArray = Array.isArray;

export const hasOwnProperty = Object.prototype.hasOwnProperty;

export function isBlankObject(thing: any) {
    return Object.getPrototypeOf(thing) === null;
}

export function isArrayLike(obj) {

    // `null`, `undefined` and `window` are not array-like
    if (obj == null) { return false; }

    // arrays and strings objects are array like
    // * jqLite is either the jQuery or jqLite constructor function
    // * we have to check the existence of jqLite first as this method is called
    //   via the forEach method when constructing the jqLite object in the first place
    if (isArray(obj) || isString(obj)) { return true; }

    // Support: iOS 8.2 (not reproducible in simulator)
    // "length" in obj used to prevent JIT error (gh-11508)
    let length = 'length' in Object(obj) && obj.length;

    // NodeList objects (with `item` method) and
    // other objects with suitable length characteristics are array-like
    return isNumber(length) &&
        (length >= 0 && ((length - 1) in obj || obj instanceof Array));

}

const TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/;
export function isTypedArray(value) {
    return value && isNumber(value.length) && TYPED_ARRAY_REGEXP.test(toString.call(value));
}

export function isArrayBuffer(obj) {
    return toString.call(obj) === '[object ArrayBuffer]';
}
