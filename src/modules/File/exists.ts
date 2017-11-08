import * as fs from 'fs';

export function existsProvider() {
    return fs.exists;
}
