import moment from "moment"
export const calendarTime = function(time) {
    return moment(time, 'YYYY-MM-DD HH:mm').calendar({
        sameElse: 'YYYY-MM-DD'
    })
}
export const datecmp = function(a, b) {
    //compares xxxx-xx-xx
    let x = a.split("-").map(v => parseInt(v)), y = b.split("-").map(v => parseInt(v))
    let xlen = x.length, ylen = y.length, mxlen = Math.max(xlen, ylen)
    if (x[0] == y[0]) {
        if (mxlen <= 1 || x[1] == y[1]) {
            if (mxlen <= 2 || x[2] == y[2]) return 0
            else return x[2] > y[2] ? 1 : -1
        }
        else return x[1] > y[1] ? 1 : -1
    }
    else return x[0] > y[0] ? 1 : -1
}
export const daysFromNow = function(date) {
    //return difference in days between xxxx-xx-xx and now, using momentjs
    return moment(date, 'YYYY-MM-DD').diff(moment(), 'days')
}
export const nowStr = function(offsetValue = null, offsetUnit = null) {
    if (offsetValue != null) return moment().add(offsetValue, offsetUnit).format('HH:mm')
    return moment().format('HH:mm')
}
export const todayStr = function() {
    //return today's xxxx-xx-xx string
    return moment().format('YYYY-MM-DD')
}
export const tomorrowStr = function() {
    //return today's xxxx-xx-xx string
    return moment().add(1, 'd').format('YYYY-MM-DD')
}
export const readableMonth = function(month) {
    return moment(month, 'YYYY-MM').format('MMM YYYY')
}
export const thisMonth = function() {
    return moment().format('YYYY-MM')
}
export const offsetMonth = function(month, offset) {
    return moment(month, 'YYYY-MM').add(offset, 'month').format('YYYY-MM')
}
export const formatDate = function(date) {
    //formats date into xxxx-xx-xx
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
export const dayOfWeek = function(date) {
    if (date == null) return moment().format('dddd')
    return moment(date).format('dddd')
}
export const humanWeekDate = function(date, showYear = false) {
    return moment(date).format(showYear ? 'dddd, MMMM D, YYYY' : 'dddd, MMMM D');
}
export const humanDate = function(date) {
    //turns xxxx-xx-xx into a more human readable format (Month Day, Year)
    /*
    const months = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[parseInt(date.substr(5, 2))] + ' ' + parseInt(date.substr(8, 2)) + ', ' + date.substr(0, 4)
    */
   //using momentjs https://momentjs.com/docs/#/displaying/format/
   if (date == null) return moment().format('MMM D, YYYY')
   return moment(date, 'YYYY-MM-DD').format('MMM D, YYYY')
}
export const offsetDate = function(date, offset) {
    //offset 'date' str by 'offset' days
    return moment(date, 'YYYY-MM-DD').add(offset, 'd').format('YYYY-MM-DD')
}
export const dateAgo = function(date) {
    return moment(date).fromNow()
}