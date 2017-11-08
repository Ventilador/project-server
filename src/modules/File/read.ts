import * as fs from 'fs';

export function readProvider(this: FileModule.File) {
    if (this.full) {
        const that = this;
        return function (fileName: string, done: Function) {
            if (that.full()) {
                that.queue('read', fileName, done);
                return;
            }
            that.start();
            fs.readFile(fileName, function (err: any, data: Buffer) {
                that.done();
                done(err, data);
            });
        };
    }

    return function (fileName: string, done: Function) {
        fs.readFile(fileName, done);
    };
}
