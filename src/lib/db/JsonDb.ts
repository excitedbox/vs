import * as Fs from 'fs';
import * as Util from "util";

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);

class JsonTableComparator {
    static compare(a: any, b: any, operator: string = '==='): boolean {
        switch (operator) {
            case '==':
                return a == b;
            case '===':
                return a === b;
            case '>':
                return a > b;
            case '<':
                return a < b;
            case '>=':
                return a >= b;
            case '<=':
                return a <= b;
        }
        return false;
    }
}

/**
 * JsonTable is just an array of records with methods
 */
class JsonTable {
    private readonly _collection: Array<any>;
    private readonly _db: JsonDb;
    private readonly _tableInfo: any;
    private readonly _indexTable: Map<string, Map<any, Array<any>>> = new Map<string, Map<any, Array<any>>>();
    private readonly _hasIndex: boolean = false;

    constructor(db: JsonDb, tableInfo: any, data: Array<any>) {
        this._db = db;
        this._tableInfo = tableInfo;
        this._collection = data;

        // Init index tables
        if (tableInfo.index) {
            for (let i = 0; i < tableInfo.index.length; i++)
                this._indexTable.set(tableInfo.index[i], new Map<any, Array<any>>());
            this._hasIndex = true;
            this.calculateIndex();
        }
    }

    /**
     * Find records in table
     * @param query
     * @param limit
     * @param isCopyOfData
     */
    find(query: any = {}, limit: number = 0, isCopyOfData: boolean = true) {
        // If or query, for example [{ id: 1 }, { id: 2 }] means find id = 1 or id = 2
        if (Array.isArray(query)) {
            let orResult = [];
            for (let i = 0; i < query.length; i++) {
                orResult.push(...this.find(query[i], limit));
            }
            return Array.from(new Set(orResult));
        }

        let result: Array<any> = [];
        let maxAmount = limit ? limit : Number.MAX_SAFE_INTEGER;
        let fieldAmount = Object.keys(query).length;

        // All records
        if (fieldAmount === 0) {
            if (isCopyOfData) return this._collection.map(x => Object.assign({}, x));
            return this._collection;
        }

        let counter = new Float32Array(this._collection.length);
        let skipRecord = new Float32Array(this._collection.length);
        let collection = this._collection;
        if (this._hasIndex) {
            collection = this.getIndexedCollection(query) || this._collection;
            // console.log('index collection', collection.length);
        }

        // Get key
        for (let key in query) {
            if (!query.hasOwnProperty(key)) continue;

            // Detect operators
            let operator = '===';
            let collectionKey = key;
            if (key.includes('>=')) {
                operator = '>=';
                collectionKey = key.replace('>=', '').trim();
            } else
            if (key.includes('<=')) {
                operator = '<=';
                collectionKey = key.replace('<=', '').trim();
            } else
            if (key.includes('>')) {
                operator = '>';
                collectionKey = key.replace('>', '').trim();
            } else
            if (key.includes('<')) {
                operator = '<';
                collectionKey = key.replace('<', '').trim();
            }

            // Go through all records from collection
            for (let i = 0; i < collection.length; i++) {
                if (skipRecord[i] === 1) continue;

                // Date test, check if date (without time) is matching
                if (query[key] instanceof Date && collection[i][collectionKey] instanceof Date) {
                    let d = collection[i][collectionKey];

                    if (operator !== '===') {
                        if (JsonTableComparator.compare(d.getTime(), query[key].getTime(), operator)) {
                            counter[i]++;
                        }
                    } else {
                        if ((d.getDay() === query[key].getDay()
                            && d.getMonth() === query[key].getMonth()
                            && d.getFullYear() === query[key].getFullYear())) {
                            counter[i]++;
                        }
                    }

                    continue;
                }

                // Regexp test
                if (query[key] instanceof RegExp) {
                    if (query[key].test(collection[i][collectionKey])) counter[i]++;
                    continue;
                }

                // Other matching
                if (JsonTableComparator.compare(query[key], collection[i][collectionKey], operator)) {
                    counter[i]++;
                    continue;
                }

                skipRecord[i] = 1;
            }
        }

        for (let i = 0; i < collection.length; i++) {
            if (counter[i] === fieldAmount) {
                if (isCopyOfData) result.push(Object.assign({}, collection[i]));
                else result.push(collection[i]);
                if (maxAmount-- <= 0) break;
            }
        }

        return result;
    }

    /**
     * Find one record in table
     * @param query
     */
    findOne(query: any = {}) {
        let data = this.find(query, 1);
        return data[0] || null;
    }

    /**
     * Push some data to the table
     * @param data
     */
    push(data: any) {
        data.id = this._tableInfo.lastId++;
        this._collection.push(data);
        this.calculateIndex();
        return this;
    }

    pushOrUpdate(setData: any, query: any = {}) {
        // If there is at least one record
        if (this.findOne(query)) {
            this.update(setData, query);
        } else this.push(setData);
        return this;
    }

    /**
     * Remove data from the table
     * @param query
     */
    remove(query: any = {}) {
        let results = this.find(query, 0, false);
        for (let i = 0; i < results.length; i++)
            this._collection.splice(this._collection.indexOf(results[i]), 1);
        return this;
    }

    /**
     * Update by condition
     * @param setData
     * @param query
     */
    update(setData: any, query: any = {}) {
        let found = this.find(query, 0, false);
        let indexArray = found.map(x => this._collection.indexOf(x));
        indexArray.forEach(x => {
            if (x < 0) return;
            this._collection[x] = Object.assign(this._collection[x], setData);
        });
        this.calculateIndex();
        return this;
    }

    private calculateIndex() {
        if (!this._hasIndex) return null;

        this._indexTable.forEach((map: Map<any, any[]>, field:string) => {
            map.clear();
            for (let i = 0; i < this._collection.length; i++) {
                if (!map.has(this._collection[i][field]))
                    map.set(this._collection[i][field], []);
                map.get(this._collection[i][field]).push(this._collection[i]);
            }
        });
    }

    private getIndexedCollection(query: any) {
        if (!this._hasIndex) return null;

        let fields = Object.keys(query);
        let indexFields = this._tableInfo.index.intersection(fields).sort().join('_');
        if (!indexFields) return null;
        return this._indexTable.get(indexFields)?.get(query[indexFields]);
    }

    /**
     * Write the DB to file
     */
    async write() {
        await this._db.write();
    }

    get size() {
        return this._collection.length;
    }
}

/**
 * DB from JSON files
 */
export default class JsonDb {
    private static _dbList: Map<string, JsonDb> = new Map<string, JsonDb>();
    private readonly _json: any = null;
    private readonly _path: string = '';
    private readonly _tableCache: Map<string, JsonTable> = new Map<string, JsonTable>();

    constructor(path: string, data: any) {
        this._path = path;
        this._json = data;
    }

    /**
     * Get DB from file
     * @param file
     * @param defaultTable
     */
    static async db(file: string = null, defaultTable: any = {}): Promise<JsonDb> {
        let jsonDb: JsonDb, table: any;

        if (file === null) {
            table = defaultTable;
        } else {
            try {
                table = JSON.parse(await ReadFile(file, 'utf-8'), (k, v) => {
                    if (typeof v === "string" && v.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/))
                        return new Date(v);
                    return v;
                });
            } catch (e) {
                table = defaultTable;
            }
        }

        jsonDb = new JsonDb(file, table);

        // Init system table
        if (!table.$sys) table.$sys = {};
        for (let key in table) {
            if (key === '$sys') continue;
            if (!table.hasOwnProperty(key)) continue;
            if (!table.$sys[key]) table.$sys[key] = {lastId: 1};
        }

        if (JsonDb._dbList.has(file)) return JsonDb._dbList.get(file);
        JsonDb._dbList.set(file, jsonDb);
        return jsonDb;
    }

    /**
     * Get table from DB
     * @param table
     */
    get(table: string): JsonTable {
        if (!this._json[table] || !Array.isArray(this._json[table]))
            throw new Error(`Table "${table}" not found in "${this._path}" db!`);

        if (this._tableCache[table]) return this._tableCache[table];
        this._tableCache[table] = new JsonTable(this, this._json.$sys[table], this._json[table]);
        return this._tableCache[table];
    }

    /**
     * Write the DB to file
     */
    async write() {
        if (!this._path) return;
        await WriteFile(this._path, JSON.stringify(this._json, null, 4));
    }
}