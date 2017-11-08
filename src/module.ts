import { logger } from './utils/logger';
import { parse } from './utils/parse';
let moduleCache = Object.create(null);
export function moduleMaker(name: string, requires?: string[]) {
    if (!requires) {
        const val = parse(name)(moduleCache);
        if (val) {
            return val;
        }
        throw logger.format('Module get', 'Module {0} not found', name);
    }
    if (name.indexOf('.') !== -1) {
        logger.warn('Module declaration', 'Module with name {0} containes a dot, have in mind this does not imply object or namespace merging for now', name);
    }
    let queue = [];
    return parse(name).assign(moduleCache, {
        conditional: supportRegister('bool', queue),
        transform: supportRegister('pipe', queue),
        through: supportRegister('through', queue),
        requires: requires,
        name: name
    });
}


function supportRegister(type, queue) {
    return function (name, fn) {
        queue.push([type, name, fn]);
        return this;
    };
}
