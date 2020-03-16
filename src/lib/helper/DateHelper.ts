export default class DateHelper {
    static today(offsetDay: number = 0) {
        let today = new Date();
        today.setDate(today.getDate() + ~~offsetDay);
        let dd: any = today.getDate();
        let mm: any = today.getMonth() + 1;
        let yyyy = today.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        return [yyyy, mm, dd].join('-');
    }
}