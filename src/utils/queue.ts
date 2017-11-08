export class Queue {
    public size: number;
    private _first: $$INode;
    private _last: $$INode;
    constructor() {
        this._first = this._last = null;
    }
    put(val) {
        if (!this._first && !this._last) {
            this._first = this._last = {
                next: null,
                prev: null,
                val: val
            };
        } else if (this._first === this._last) {
            this._first.next = this._last;
            this._last = {
                prev: this._first,
                next: null,
                val: val
            };
        } else {
            this._last.next = {
                prev: this._last,
                next: null,
                val: val
            };
            this._last = this._last.next;
        }
        this.size++;
    }
    pull() {
        if (!this.size) {
            return;
        }
        const toReturn = this._last;
        this._last = this._last.prev;
        if (!--this.size) {
            this._last = this._first = null;
        } else if (this._last === this._first) {
            this._first.prev = this._first.next = this._last.next = this._last.prev = null;
        }
        return toReturn.val;
    }
}

interface $$INode {
    next: $$INode;
    prev: $$INode;
    val: any;
}
