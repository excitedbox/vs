export default class TypeScriptImport {
    public fileName: string;
    public importItem: string[];
    public isDefault: boolean;

    constructor(fileName, importItem, isDefault: boolean = false) {
        this.fileName = fileName;
        this.importItem = importItem;
        this.isDefault = isDefault;
    }
}