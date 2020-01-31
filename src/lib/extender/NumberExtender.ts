declare global {
    interface Number {
        /**
         * Convert unix timestamp to date object
         */
        toDate(): Date;

        /**
         * Convert seconds to HH:MM
         */
        intToHM(): string;

        /**
         * Convert seconds to HH:MM:SS
         */
        intToHMS(): string;

        /**
         * Convert seconds to HH:MM:SS.SSS
         */
        intToHMSM(): string;

        /**
         * Convert bytes to kb, mb and etc
         */
        humanByteSize(): string;

        /**
         * Convert meters to km
         */
        humanMeterSize(): string;

        /**
         * Convert big numbers to short
         */
        humanReadableSize(precision: number, minimum: number): string;

        /**
         * Get percent value from current number, ie 12 (50%) -> 6
         */
        percentage(value: number, type: string): number;

        /**
         * Check if value located between two numbers
         */
        between(min: number, max: number): boolean;
    }
}

Number.prototype.toDate = function () {
    let date = new Date();
    date.setTime(this);
    return date;
};

Number.prototype.intToHM = function () {
    let sec_num = Math.abs(this);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    return hours + ':' + minutes;
};

Number.prototype.intToHMS = function () {
    let sec_num = Math.abs(this);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
    let sec: any = sec_num % 60;

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (sec < 10) sec = "0" + sec;

    return hours + ':' + minutes + ':' + sec;
};

Number.prototype.intToHMSM = function () {
    let sec_num = Math.abs(this);
    let hours: any = ~~(sec_num / 1000 / 3600) % 24;
    let minutes: any = ~~(sec_num / 1000 / 60) % 60;
    let sec: any = ~~(sec_num / 1000) % 60;
    let ms = sec_num % 1000;

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (sec < 10) sec = "0" + sec;

    return hours + ':' + minutes + ':' + sec + '.' + ('000' + ms).slice(-3);
};

Number.prototype.humanByteSize = function () {
    let bytes = this;
    let thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';

    let units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
};

Number.prototype.humanMeterSize = function () {
    if (this < 0) return '-';
    if (this < 1000) return Math.round(this) + ' м';
    else return (this / 1000).toFixed(2) + ' км';
};

Number.prototype.humanReadableSize = function (precision: number, minimum: number) {
    if (!precision) precision = 1;
    if (!minimum) minimum = 10000;
    if (this >= 1000000) return (this / 1000000).toFixed(precision).replace(/\.0+$/, '') + 'm';
    if (this >= minimum) return (this / 1000).toFixed(precision).replace(/\.0+$/, '') + 'k';
    else return this.toFixed(precision);
};

Number.prototype.percentage = function (value: number, type: string = 'add') {
    if (type === 'sub') return this - (this * (value / 100));
    return this * (value / 100);
};

Number.prototype.between = function (min: number, max: number) {
    return (this >= min && this <= max);
};

// #ifdef nodejs
export default class NumberExtender {
}
// #endif