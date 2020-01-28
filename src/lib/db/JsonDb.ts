import * as Fs from 'fs';
import * as Util from "util";

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);

/**
 * JsonTable is just an array of records with methods
 */
class JsonTable {
    private readonly _collection: Array<any>;
    private readonly _db: JsonDb;
    private readonly _tableInfo: any;

    constructor(db: JsonDb, tableInfo: string, data: Array<any>) {
        this._db = db;
        this._tableInfo = tableInfo;
        this._collection = data;
    }

    /**
     * Find records in table
     * @param query
     * @param limit
     */
    find(query: any = {}, limit: number = 0) {
        let result: Array<any> = [];
        let maxAmount = limit ? limit : Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < this._collection.length; i++) {
            let allMatch = true;
            for (let key in query) {
                if (!query.hasOwnProperty(key)) continue;

                if (this._collection[i][key] !== query[key]) {
                    allMatch = false;
                    break;
                }
            }
            if (allMatch) {
                result.push(this._collection[i]);
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
        return this;
    }

    /**
     * Remove data from the table
     * @param query
     */
    remove(query: any = {}) {
        let results = this.find(query);
        for (let i = 0; i < results.length; i++)
            this._collection.splice(this._collection.indexOf(results[i]), 1);
        return this;
    }

    /**
     * Write the DB to file
     */
    async write() {
        await this._db.write();
    }
}

/**
 * DB from JSON files
 */
export default class JsonDb {
    private static _dbList: Map<string, JsonDb> = new Map<string, JsonDb>();
    private readonly _json: any = null;
    private readonly _path: string = '';

    constructor(path: string, data: any) {
        this._path = path;
        this._json = data;
    }

    /**
     * Get DB from file
     * @param file
     * @param defaultTable
     */
    static async db(file: string, defaultTable: any = {}) {
        let jsonDb: JsonDb, table: any;

        try {
            table = JSON.parse(await ReadFile(file, 'utf-8'));
            jsonDb = new JsonDb(file, table);
        } catch (e) {
            table = defaultTable;
            jsonDb = new JsonDb(file, table);
        }

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

        return new JsonTable(this, this._json.$sys[table], this._json[table]);
    }

    /**
     * Write the DB to file
     */
    async write() {
        await WriteFile(this._path, JSON.stringify(this._json, null, 4));
    }
}