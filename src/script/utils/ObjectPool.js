export default class ObjectPool {
    constructor(limit, constructor) {
        this._limit = limit;
        this._constructor = constructor;
        this._arrayObjects = new Array(this._limit);
        this._size = 0;
    }

    /**
     * Getters
     */
    get size() {
        return this._size;
    }

    /**
     * Publilc
     */
    obtain(options) {
        let oTemp;
        if (this._size > 0) {
            this._size--;
            oTemp = this._arrayObjects[this._size];
            this._arrayObjects[this._size] = null;
            return oTemp;
        }

        return new this._constructor(options);
    }

    recycle(objectRecyclable) {
        if (!(objectRecyclable instanceof this._constructor)) {
            throw new TypeError('Trying to recycle the wrong object for pool.');
        }

        if (this._size < this._limit) {
            if (typeof objectRecyclable.recycle === 'function') objectRecyclable.recycle();
            this._arrayObjects[this._size] = objectRecyclable;
            this._size++;
        } else {
            // The pool is full, object will be deferred to GC for cleanup.
        }
    }
}
