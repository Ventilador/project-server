import { Queue } from './../../utils/queue';

export function constructorFn(options) {
    let currentProcesses = 0;
    const max = options.MAX_PARALLEL;
    const myQueue = new Queue();
    return {
        full: max && function full() {
            return currentProcesses >= max;
        },
        queue: function (method, fileName, done) {
            myQueue.put([method, [fileName, done]]);
        },
        start: function () {
            currentProcesses++;
        },
        done: function () {
            currentProcesses--;
            if (myQueue.size) {
                const obj = myQueue.pull();
                this[obj[0]].apply(this, obj[1]);
            }
        }
    };
}
