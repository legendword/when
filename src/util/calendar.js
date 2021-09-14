import moment from 'moment'
class CalendarHelper {

    static dayNameRef = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    static monthNameRef = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    constructor() {
        this.cur = moment();
    }

    monthLayout() {
        let firstDayOfMonth = moment().date(1);
        let thisMonth = firstDayOfMonth.month();
        let startingWeekOfDay = firstDayOfMonth.day();
        let d = moment(firstDayOfMonth).subtract(startingWeekOfDay, 'day');
        let res = [], row = [];
        while (d.month() != thisMonth + 1) {
            row.push({
                fullDate: d.format('YYYY-MM-DD'),
                month: d.month(),
                date: d.date(),
                day: d.day()
            });
            if (row.length == 7) {
                res.push(row);
                row = [];
            }
            d.add(1, 'day');
        }
        for (let i=row.length;i<7;i++) {
            row.push({
                fullDate: d.format('YYYY-MM-DD'),
                month: d.month(),
                date: d.date(),
                day: d.day()
            });
            d.add(1, 'day');
        }
        res.push(row);
        return res;
    }
}
export default CalendarHelper