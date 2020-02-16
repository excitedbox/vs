export default class TypeScriptImport {
    public fileName: string;
    public importItem: string[];
    public isDefault: boolean;
    public isDeferred: boolean;

    constructor(fileName, importItem, isDefault: boolean = false, isDeferred: boolean = false) {
        this.fileName = fileName;
        this.importItem = importItem;
        this.isDefault = isDefault;
        this.isDeferred = isDeferred;
    }
}