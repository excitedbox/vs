export default class EventEmitter {
    private _eventList: {[key: string]: {event: string; fn: Function}[]} = {};

    on(event: string, fn: Function): void {
        if (!this._eventList[event]) {
            this._eventList[event] = [];
        }

        this._eventList[event].push({
            event,
            fn
        });
    }

    off(event: string, fn: Function): void {
        if (!this._eventList[event]) {
            this._eventList[event] = [];
        }

        const findIndex = this._eventList[event]
            .findIndex((x: {event: string; fn: Function}) => x.event === event && x.fn === fn);

        if (findIndex !== -1) {
            this._eventList[event].splice(findIndex, 1);
        }
    }

    emit(event: string, ...data: unknown[]): void {
        if (!this._eventList[event]) {
            this._eventList[event] = [];
        }

        for (let i = 0; i < this._eventList[event].length; i++) {
            this._eventList[event][i].fn(...data);
        }
    }
}