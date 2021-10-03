/* deadlines util for interacting with idb
 */
import moment from 'moment'
import { idb } from '../boot/idb'
const deadlinesUtil = {
    remove: async (ddl) => {
        const db = await idb.data
        if (ddl.category != null) {
            let ct = await db.get('categories', ddl.category)
            if (ct != undefined) {
                ct.total -= 1
                await db.put('categories', ct)
            }
        }
        return db.delete('deadlines', ddl.id)
    },
    update: async (ddl) => {
        const db = await idb.data
        // #todo: also update categories, maintaining its total count
        return db.put('deadlines', ddl)
    },
    add: async (ddl) => {
        const db = await idb.data
        if (ddl.category != null) {
            let ct = await db.get('categories', ddl.category)
            if (ct == undefined) {
                ddl.category = null
            }
            else {
                ct.total += 1
                db.put('categories', ct)
            }
        }
        return db.add('deadlines', ddl)
    },
    getAll: async () => {
        const db = await idb.data
        const allEvents = await db.getAllFromIndex('deadlines', 'dateIndex')
        return allEvents
    },
    getAllActive: async () => {
        const db = await idb.data
        const allEvents = await db.getAllFromIndex('deadlines', 'dateIndex', IDBKeyRange.lowerBound(moment().add(1, 'minute').format('YYYY-MM-DD HH:mm')))
        return allEvents
    },
    getAllInactive: async () => {
        const db = await idb.data
        const allEvents = await db.getAllFromIndex('deadlines', 'dateIndex', IDBKeyRange.upperBound(moment().format('YYYY-MM-DD HH:mm')))
        return allEvents
    }
}
export default deadlinesUtil