/* list util for interacting with idb
 * supports adding
 */
import { idb } from '../boot/idb'
const listUtil = {
    addEvent: async (event) => {
        let date = event.dateFrom || "null"
        let res = {
            ...event,
            date
        }
        const db = await idb.data
        await db.add('list', res)
    },
    getAllEvents: async () => {
        const db = await idb.data
        const allEvents = await db.getAll('list')
        return allEvents
    }
}
export default listUtil