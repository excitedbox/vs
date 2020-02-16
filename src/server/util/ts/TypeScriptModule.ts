import TypeScriptImport from "./TypeScriptImport";
import TypeScriptExport from "./TypeScriptExport";

export default class TypeScriptModule {
    public id: string;
    public fileName: string;
    public importList: Array<TypeScriptImport> = [];
    public exportList: Array<TypeScriptExport> = [];
    public code: string;
    public isGlobal: boolean;

    constructor(id: string, fileName, importList, exportList, code, isGlobal: boolean) {
        this.id = id;
        this.fileName = fileName;
        this.importList = importList;
        this.exportList = exportList;
        this.code = code;
        this.isGlobal = isGlobal;
    }
}