/* list util for interacting with idb
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
    moveEvent: async (event, date, pos = null) => {
        //move an assigned event to a different date (pos optional)
        //pos: the index the event will be placed
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder'], 'readwrite')
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let data = {
            ...event,
            date: date
        }
        if (data.dateFrom) {
            data.dateFrom = date + data.dateFrom.substr(10)
        }
        if (data.dateTo) {
            data.dateTo = date + data.dateTo.substr(10)
        }

        if (pos == null) {
            data.order = maxOrder
        }
        else {
            let events = await ts.objectStore('events').index('dateIndex').getAll(event.date)
            events.sort((a, b) => {
                return a.order - b.order
            })
            data.order = pos < events.length ? events[pos].order : maxOrder
            for (let i=pos;i<events.length;i++) {
                await ts.objectStore('events').put({
                    ...events[i],
                    order: events[i].order + 1
                });
            }
        }

        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('events').put(data)
        return ts.done
    },
    assignEvent: async (event, date, pos = null) => {
        //assign an unassigned event to a date (pos optional)
        //pos: the index the event will be placed
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder'], 'readwrite')
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }

        let data = {
            ...event,
            dateFrom: date,
            fullDay: true,
            date: date
        };

        if (pos == null) {
            data.order = maxOrder
        }
        else {
            let events = await ts.objectStore('events').index('dateIndex').getAll(event.date)
            events.sort((a, b) => {
                return a.order - b.order
            })
            data.order = pos < events.length ? events[pos].order : maxOrder
            for (let i=pos;i<events.length;i++) {
                await ts.objectStore('events').put({
                    ...events[i],
                    order: events[i].order + 1
                });
            }
        }
        
        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('events').put(data)
        return ts.done
    },
    deleteEvent: async (event) => {
        const db = await idb.data
        if (event.category != null) {
            let ct = await db.get('categories', event.category)
            ct.total -= 1
            await db.put('categories', ct)
        }
        return db.delete('events', event.id)
    },
    changeEventDone: async (event, val) => {
        const db = await idb.data
        let newEvent = {
            ...event,
            done: val
        }
        return db.put('events', newEvent)
    },
    editEvent: async (oldEvent, newEvent) => {
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder'], 'readwrite')
        newEvent.date = newEvent.dateFrom ? newEvent.dateFrom.substr(0, 10) : 'unassigned'
        if (oldEvent.date == newEvent.date) {
            ts.objectStore('events').put(newEvent)
        }
        else { //perform move
            let maxOrder = await ts.objectStore('maxOrder').get(newEvent.date)
            if (maxOrder === undefined) {
                maxOrder = 0
            }
            newEvent.order = maxOrder
            ts.objectStore('maxOrder').put(maxOrder+1, newEvent.date)
            ts.objectStore('events').put(newEvent)
        }
        
        if (oldEvent.category != newEvent.category) { // perform category action
            if (oldEvent.category != null) {
                let oldCategory = await ts.objectStore('categories').get(oldEvent.category)
                if (oldCategory != undefined) {
                    oldCategory.total -= 1
                    ts.objectStore('categories').put(oldCategory)
                }
            }
            if (newEvent.category != null) {
                let newCategory = await ts.objectStore('categories').get(newEvent.category)
                if (newCategory != undefined) {
                    newCategory.total += 1
                    ts.objectStore('categories').put(newCategory)
                } // if newCategory is undefined... then it is user mismanipulation
            }
        }

        return ts.done
    },
    addEvent: async (event) => {
        const db = await idb.data
        const ts = db.transaction(['events', 'maxOrder', 'categories'], 'readwrite')
        let date = event.dateFrom ? event.dateFrom.substr(0, 10) : 'unassigned'
        let maxOrder = await ts.objectStore('maxOrder').get(date)
        if (maxOrder === undefined) {
            maxOrder = 0
        }
        let res = {
            ...event,
            date,
            order: maxOrder
        }
        if (event.category != null) {
            let ct = await ts.objectStore('categories').get(event.category)
            if (ct == undefined) {
                res.category = null
            }
            else {
                ct.total += 1
                ts.objectStore('categories').put(ct)
            }
        }
        ts.objectStore('maxOrder').put(maxOrder+1, date)
        ts.objectStore('events').add(res)
        return ts.done
    },
    getAllEvents: async () => {
        const db = await idb.data
        const allEvents = await db.getAll('events')
        return allEvents
    }
}
export default listUtil