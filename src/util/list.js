/* list util for interacting with idb
 * supports adding
 */
import { idb } from '../boot/idb'
const listUtil = {
    reOrderEvent: async (event, offset) => {
        //reorder event by offset
        if (offset == 0) {
            return Promise.resolve()
        }
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder'], 'readwrite')
        let events = await ts.objectStore('events').index('dateIndex').getAll(event.date)
        events.sort((a, b) => {
            return a.order - b.order
        })
        let dir = offset > 0 ? 1 : -1;
        let eventPos = events.findIndex(v => v.id == event.id);
        let destPos = eventPos + offset;
        if (destPos < 0 || destPos >= events.length) {
            return Promise.reject('offset out of bounds');
        }
        let finalOrder = events[destPos].order;
        for (let i=destPos;i!=eventPos;i-=dir) {
            await ts.objectStore('events').put({
                ...events[i],
                order: events[i].order - dir
            });
        }
        ts.objectStore('events').put({
            ...events[eventPos],
            order: finalOrder
        });
        return ts.done;
    },
    moveEvent: async (event, date) => {
        //move an assigned event to a different date
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder'], 'readwrite')
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let data = {...event}
        data.date = date
        data.order = maxOrder
        if (data.dateFrom) {
            data.dateFrom = date + data.dateFrom.substr(10)
        }
        if (data.dateTo) {
            data.dateTo = date + data.dateTo.substr(10)
        }
        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('events').put(data)
        return ts.done
    },
    assignEvent: async (event, date) => {
        //assign an unassigned event to a date
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder'], 'readwrite')
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let data = {...event}
        data.dateFrom = date
        data.fullDay = true
        data.date = date
        data.order = maxOrder
        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('events').put(data)
        return ts.done
    },
    deleteEvent: async (event) => {
        const db = await idb.data
        return db.delete('events', event.id)
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
        return db.add('events', res)
    },
    getAllEvents: async () => {
        const db = await idb.data
        const allEvents = await db.getAll('events')
        return allEvents
    }
}
export default listUtil