import "./NumberExtender"
import "./StringExtender"
import DateHelper from "../helper/DateHelper";

declare global {
    interface Date {
        /**
         * Get start of week from current date
         * @param offset
         */
        startOfWeek(offset?: number): Date;

        /**
         * Get start of month from current date
         * @param offset
         */
        startOfMonth(offset?: number): Date;

        /**
         * Get list of dates from start of week
         */
        getWeekRange(): Array<Date>;

        /**
         * Get list of dates from start of month
         */
        getMonthRange(): Array<Date>;

        /**
         * Add hours to current date
         * @param h
         */
        addHours(h?: number): Date;

        /**
         * Get day name of current date - example, sunday, monday etc
         */
        dayName(): string;

        /**
         * Start of current date - example 2019-09-01 12:34:32 -> 2019-09-01 00:00:00
         */
        start(): Date;

        /**
         * End of current date - example 2019-09-01 12:34:32 -> 2019-09-01 23:59:59
         */
        end(): Date;

        /**
         * Offset current date with days
         * @param offsetDay
         */
        offset(offsetDay?: number): Date;

        /**
         * Offset current date with days
         */
        secondsFromStartOfDay(): number;

        /**
         * Get current date without time
         * @param isDMY
         */
        date(isDMY?: boolean): string;

        /**
         * Get current time without date
         * @param isShort
         */
        time(isShort?: boolean): string;

        /**
         * Convert current date object to ymd string
         */
        toYMD(): string;

        /**
         * Get number of week starts from current year
         */
        getWeek(): number;

        /**
         * Convert date object to string
         */
        format(): string;

        /**
         * Convert date to human readable variant. Starts from current date, example: 5 sec before and etc.
         */
        humanDate(): string;

        /**
         * Convert date to readable variant
         */
        readableDate(): string;

        /**
         * Get current time with time zone offset
         */
        //getTimeWithTimezoneOffset(): number;
    }
}

Date.prototype.startOfWeek = function (offset: number = 0) {
    let day = this.getDay();
    let diff = this.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(this.setDate(diff + ~~offset));
};

Date.prototype.startOfMonth = function (offset: number = 0) {
    let d = new Date(this);
    d.setDate(1 + offset);
    return d;
};

Date.prototype.getWeekRange = function () {
    let out = [];
    for (let i = 0; i < 7; i++) out.push(this.startOfWeek(i));
    return out;
};

Date.prototype.getMonthRange = function () {
    let out = [];
    for (let i = 0; i < 32; i++) {
        let d = new Date(this);
        d.setDate(1 + i);
        if (d.getMonth() !== this.getMonth()) break;
        out.push(d);
    }

    return out;
};

Date.prototype.addHours = function (h: number = 0) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};

Date.prototype.dayName = function () {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][this.getDay()];
};

Date.prototype.start = function () {
    let d = new Date(this);
    d.setHours(0, 0, 0, 0);
    return d;
};

Date.prototype.end = function () {
    let d = new Date(this);
    d.setHours(23, 59, 59, 999);
    return d;
};

Date.prototype.offset = function (offsetDay: number = 0) {
    let date = new Date(this);
    date.setDate(date.getDate() + ~~offsetDay);
    return date;
};

Date.prototype.secondsFromStartOfDay = function () {
    return (this.getTime() - this.start().getTime()) / 1000 | 0;
    // return withTimeZoneOffset ? (x - new Date().getTimezoneOffset() * 60) : x;
};

Date.prototype.date = function (isDMY: boolean = false) {
    if (isDMY) return ('0' + this.getDate()).slice(-2) + '.' + ('0' + (this.getMonth() + 1)).slice(-2) + '.' + this.getFullYear();
    return this.getFullYear() + '-' + ('0' + (this.getMonth() + 1)).slice(-2) + '-' + ('0' + this.getDate()).slice(-2);
};

Date.prototype.time = function (isShort: boolean = false) {
    if (isShort) return ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2);
    return ('0' + this.getHours()).slice(-2) + ':' + ('0' + this.getMinutes()).slice(-2) + ':' + ('0' + this.getSeconds()).slice(-2);
};

Date.prototype.toYMD = function () {
    let date = this;
    if (!date) return '0000-00-00';
    if (date === '0000-00-00') return '0000-00-00';
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

Date.prototype.getWeek = function () {
    let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    let dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
};

Date.prototype.format = function () {
    return this.date() + ' ' + this.time();
};

Date.prototype.humanDate = function () {
    let delta = Math.round((new Date().getTime() - this.getTime()) / 1000);
    if (delta < 0) {
        return 'через ' + delta.intToHMS().humanTime();
    }
    if (delta < 86400) {
        return delta.intToHMS().humanTime() + ' назад';
    }

    if (this.date() === DateHelper.today(-2)) return 'Позавчера в ' + this.time(true);
    if (this.date() === DateHelper.today(-1)) return 'Вчера в ' + this.time(true);
    if (this.date() === DateHelper.today(0)) return 'Сегодня в ' + this.time(true);
    if (this.date() === DateHelper.today(1)) return 'Завтра в ' + this.time(true);
    if (this.date() === DateHelper.today(2)) return 'Послезавтра в ' + this.time(true);

    return this.format();
};

Date.prototype.readableDate = function () {
    let month = ['Январь', 'Февраль', 'Апрель', 'Март', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    let day = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return day[this.getDay() - 1] + ' ' + ('0' + this.getDate()).slice(-2) + ' ' + month[this.getMonth()] + ' ' + this.getFullYear();
};

/*Date.prototype.getTimeWithTimezoneOffset = function () {
    return this.getTime() - (this.getTimezoneOffset() * 60000);
};*/

export default class DateExtender {
}