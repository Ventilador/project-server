import { isString, isArray, isArrayBuffer, isTypedArray, isBlankObject, isObject, hasOwnProperty, isFunction, isDefined } from './typeChecks';
import { forEach } from './forEach';
export function lowercase(string) {
    return isString(string) ? string.toLowerCase() : string;
};
export function uppercase(string) {
    return isString(string) ? string.toUpperCase() : string;
};

export function copy(source, destination?) {
    let stackSource = [];
    let stackDest = [];

    if (destination) {
        if (isTypedArray(destination) || isArrayBuffer(destination)) {
            throw "Can't copy! TypedArray destination cannot be mutated.";
        }
        if (source === destination) {
            throw "Can't copy! Source and destination are identical.";
        }

        // Empty the destination object
        if (isArray(destination)) {
            destination.length = 0;
        } else {
            forEach(destination, function (value, key) {
                if (key !== '$$hashKey') {
                    delete destination[key];
                }
            });
        }

        stackSource.push(source);
        stackDest.push(destination);
        return copyRecurse(source, destination);
    }

    return copyElement(source);

    function copyRecurse(source, destination) {
        let h = destination.$$hashKey;
        let key;
        if (isArray(source)) {
            for (let i = 0, ii = source.length; i < ii; i++) {
                destination.push(copyElement(source[i]));
            }
        } else if (isBlankObject(source)) {
            // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
            for (key in source) {
                destination[key] = copyElement(source[key]);
            }
        } else if (source && typeof source.hasOwnProperty === 'function') {
            // Slow path, which must rely on hasOwnProperty
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    destination[key] = copyElement(source[key]);
                }
            }
        } else {
            // Slowest path --- hasOwnProperty can't be called as a method
            for (key in source) {
                if (hasOwnProperty.call(source, key)) {
                    destination[key] = copyElement(source[key]);
                }
            }
        }
        setHashKey(destination, h);
        return destination;
    }

    function copyElement(source) {
        // Simple values
        if (!isObject(source)) {
            return source;
        }

        // Already copied values
        let index = stackSource.indexOf(source);
        if (index !== -1) {
            return stackDest[index];
        }

        let needsRecurse = false;
        let destination = copyType(source);

        if (destination === undefined) {
            destination = isArray(source) ? [] : Object.create(Object.getPrototypeOf(source));
            needsRecurse = true;
        }

        stackSource.push(source);
        stackDest.push(destination);

        return needsRecurse
            ? copyRecurse(source, destination)
            : destination;
    }

    function copyType(source) {
        switch (toString.call(source)) {
            case '[object Int8Array]':
            case '[object Int16Array]':
            case '[object Int32Array]':
            case '[object Float32Array]':
            case '[object Float64Array]':
            case '[object Uint8Array]':
            case '[object Uint8ClampedArray]':
            case '[object Uint16Array]':
            case '[object Uint32Array]':
                return new source.constructor(copyElement(source.buffer));

            case '[object ArrayBuffer]':
                // Support: IE10
                if (!source.slice) {
                    let copied = new ArrayBuffer(source.byteLength);
                    new Uint8Array(copied).set(new Uint8Array(source));
                    return copied;
                }
                return source.slice(0);

            case '[object Boolean]':
            case '[object Number]':
            case '[object String]':
            case '[object Date]':
                return new source.constructor(source.valueOf());

            case '[object RegExp]':
                let re = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                re.lastIndex = source.lastIndex;
                return re;

            case '[object Blob]':
                return new source.constructor([source], { type: source.type });
        }

        if (isFunction(source.cloneNode)) {
            return source.cloneNode(true);
        }
    }
}

export const csp: any = function () {
    if (!isDefined(csp.rules)) {


        let ngCspElement = (window.document.querySelector('[ng-csp]') ||
            window.document.querySelector('[data-ng-csp]'));

        if (ngCspElement) {
            let ngCspAttribute = ngCspElement.getAttribute('ng-csp') ||
                ngCspElement.getAttribute('data-ng-csp');
            csp.rules = {
                noUnsafeEval: !ngCspAttribute || (ngCspAttribute.indexOf('no-unsafe-eval') !== -1),
                noInlineStyle: !ngCspAttribute || (ngCspAttribute.indexOf('no-inline-style') !== -1)
            };
        } else {
            csp.rules = {
                noUnsafeEval: noUnsafeEval(),
                noInlineStyle: false
            };
        }
    }

    return csp.rules;

    function noUnsafeEval() {
        try {
            /* jshint -W031, -W054 */
            new Function('');
            /* jshint +W031, +W054 */
            return false;
        } catch (e) {
            return true;
        }
    }
};

function setHashKey(obj, h) {
    if (h) {
        obj.$$hashKey = h;
    } else {
        delete obj.$$hashKey;
    }
}

export function noop() { }
