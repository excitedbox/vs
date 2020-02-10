export default class SensitiveChange {
    public property: string;
    public value: any;
    public previousValue: any;

    constructor(property: string = '', value: any = null, previousValue: any = null) {
        this.property = property;
        this.value = value;
        this.previousValue = previousValue;
    }
}