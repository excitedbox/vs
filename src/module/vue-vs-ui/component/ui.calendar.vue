<template>
    <div @click.stop="" class="ui-calendar">
        <div class="header">
            <svg @click="prevMonth" width="16" height="16" viewBox="0 0 13 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.6562 1.4668L1.42185 11.7012L11.6562 21.9356" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="title">{{ monthNames[currentMonth] }} {{ currentYear }}</div>
            <svg @click="nextMonth" width="16" height="16" viewBox="0 0 14 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.77344 1.4668L12.0078 11.7012L1.77344 21.9356" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="body">
            <div class="day-names">
                <div v-for="x in dayNames">{{ x }}</div>
            </div>
            <div class="day-list">
                <div @click="selectDate(x.date)"
                     v-for="x in dateList" class="day"
                     :class="[
                        x.isActive ?'' :'inactive',
                        startDate && endDate && (x.date.getTime() >= startDate.getTime() && x.date.getTime() <= endDate.getTime()) ?'selected' :''
                        ]">
                    <div class="item">{{ x.day }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {Fragment} from 'vue-fragment';

    @Component({
        components: {
            Fragment
        }
    })
    export default class UI_Calendar extends Vue {
        @Prop(String) readonly title: string;

        public value: Date = new Date();
        public dayNames: string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        public monthNames: string[] = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        public currentMonth: number = new Date().getMonth() + 1;
        public currentYear: number = new Date().getFullYear();
        public dateList: {day: number; isActive: boolean; date: Date}[] = [];
        public dateSelectStrobe: number = 0;
        public startDate: Date = null;
        public endDate: Date = null;

        mounted() {
            this.nextMonth();
            this.prevMonth();
        }

        selectDate(date) {
            if (this.dateSelectStrobe === 0) this.startDate = date;
            if (this.dateSelectStrobe === 1) {
                this.endDate = date;
                this.$emit('selectRange', { start: this.startDate, end: this.endDate });
            }
            this.dateSelectStrobe++;
            if (this.dateSelectStrobe > 1) this.dateSelectStrobe = 0;
        }

        prevMonth() {
            this.currentMonth -= 1;
            if (this.currentMonth < 1) {
                this.currentMonth = 12;
                this.currentYear--;
            }
            this.dateList.length = 0;
            this.dateList.push(...this.generateCalendarDateList(this.currentMonth, this.currentYear));
            if (this.dateList.length > 7 * 6) this.dateList.length = 7 * 6;
        }

        nextMonth() {
            this.currentMonth += 1;
            if (this.currentMonth > 12) {
                this.currentMonth = 1;
                this.currentYear++;
            }
            this.dateList.length = 0;
            this.dateList.push(...this.generateCalendarDateList(this.currentMonth, this.currentYear));
            if (this.dateList.length > 7 * 6) this.dateList.length = 7 * 6;
        }

        dayNameByDate(day: number, month: number, year: number) {
            //day = parseInt(day, 10);
            //let mon = parseInt(month, 10);
            let a = (14 - month) / 12;
            let y = year - a;
            let m = month + 12 * a - 2;
            let d = (7000 + (day + y + (y / 4) - (y / 100) + (y / 400) + (31 * m) / 12)) % 7;
            if (d === 0) return 6;
            return d - 1;
        }

        generateCalendarDateList(month?, year?, onlyOneMonth:boolean = false): { day: number; isActive: boolean; date: Date }[] {
            let list = [];
            let cnt = 0;
            let monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let newMonth = month;
            let newYear = year;

            if (onlyOneMonth) {
                for (let i = 0; i < monthDays[month]; i++) {
                    cnt += 1;
                    list.push(cnt);
                }
                return list;
            }

            let lastDaysOfPreviousMonth;
            let offsetDay = this.dayNameByDate(1, month, year);
            if (month === 1) {
                newMonth = 12;
                newYear = year - 1;
                lastDaysOfPreviousMonth = this.generateCalendarDateList(12, year - 1, true);
            } else {
                newMonth = month - 1;
                newYear = year;
                lastDaysOfPreviousMonth = this.generateCalendarDateList(month - 1, year, true);
            }

            lastDaysOfPreviousMonth.splice(0, lastDaysOfPreviousMonth.length - offsetDay);

            for (let i = 0; i < offsetDay; i++) {
                list.push({
                    day: lastDaysOfPreviousMonth[i],
                    isActive: false,
                    date: new Date(`${newYear}-${('00' + newMonth).slice(-2)}-${('00' + lastDaysOfPreviousMonth[i]).slice(-2)}`),
                });
            }

            for (let i = 0; i < monthDays[month]; i++) {
                cnt += 1;
                list.push({
                    day: cnt,
                    isActive: true,
                    date: new Date(`${year}-${('00' + month).slice(-2)}-${('00' + cnt).slice(-2)}`)
                });
            }

            let remainder = 48 - list.length;

            let daysOfNextMonth;
            if (month === 12) {
                daysOfNextMonth = this.generateCalendarDateList(1, year + 1, true);
                newMonth = 1;
                newYear = year + 1;
            } else {
                daysOfNextMonth = this.generateCalendarDateList(month + 1, year, true);
                newMonth = month + 1;
                newYear = year;
            }
            daysOfNextMonth = daysOfNextMonth.slice(0, remainder);

            for (let i = 0; i < remainder; i++) {
                list.push({
                    day: daysOfNextMonth[i],
                    isActive: false,
                    date: new Date(`${newYear}-${('00' + newMonth).slice(-2)}-${('00' + daysOfNextMonth[i]).slice(-2)}`)
                });
            }

            return list;
        }
    }
</script>

<style scoped lang="scss">

</style>
