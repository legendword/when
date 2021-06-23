/* list util for interacting with idb
 * supports adding
 */
import { idb } from '../boot/idb'
const listUtil = {
    moveEvent: async (event, date) => {
        //move an assigned event to a different date
        const db = await idb.data
        const ts = db.transaction(['assigned', 'maxOrder'], 'readwrite')
        ts.objectStore('assigned').delete(event.id)
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let data = {...event}
        delete data.order
        data.date = date
        data.order = maxOrder
        if (data.dateFrom) {
            data.dateFrom = date + data.dateFrom.substr(10)
        }
        if (data.dateTo) {
            data.dateTo = date + data.dateTo.substr(10)
        }
        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('assigned').add(data)
        return ts.done
    },
    assignEvent: async (event, date) => {
        //assign an unassigned event to a date
        const db = await idb.data
        const ts = db.transaction(['unassigned', 'assigned', 'maxOrder'], 'readwrite')
        ts.objectStore('unassigned').delete(event.id)
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let data = {...event}
        delete data.id
        delete data.order
        data.dateFrom = date
        data.fullDay = true
        data.date = date
        data.order = maxOrder
        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('assigned').add(data)
        return ts.done
    },
    deleteEvent: async (event) => {
        const db = await idb.data
        if (!event.date) {
            return db.delete('unassigned', event.id)
        }
        else {
            return db.delete('assigned', event.id)
        }
    },
    addEvent: async (event) => {
        const db = await idb.data
        let date = event.dateFrom ? event.dateFrom.substr(0, 10) : 'unassigned'
        let maxOrder = await db.get('maxOrder', date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let res = {
            ...event,
            date,
            order: maxOrder
        }
        await db.put('maxOrder', maxOrder+1, date)
        return db.add(date == 'unassigned' ? 'unassigned' : 'assigned', res)
    },
    getAllEvents: async () => {
        const db = await idb.data
        const allEvents = {
            unassigned: await db.getAll('unassigned'),
            assigned: await db.getAll('assigned')
        }
        return allEvents
    }
}
export default listUtil