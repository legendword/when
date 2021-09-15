/* deadlines util for interacting with idb
 */
import moment from 'moment'
import { idb } from '../boot/idb'
const deadlinesUtil = {
    remove: async (ddlId) => {
        const db = await idb.data
        return db.delete('deadlines', ddlId)
    },
    update: async (ddl) => {
        const db = await idb.data
        return db.put('deadlines', ddl)
    },
    add: async (ddl) => {
        const db = await idb.data
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