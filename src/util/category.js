import { idb } from '../boot/idb'
const categoryUtil = {
    add: async (name, color) => {
        const db = await idb.data;
        let val = {
            name,
            color,
            total: 0
        };
        return db.add('categories', val);
    },
    getAll: async () => {
        const db = await idb.data
        const allCategories = await db.getAll('categories')
        return allCategories
    },
    delete: async (name) => {
        const db = await idb.data
        const category = await db.get('categories', name)
        if (category == undefined) {
            return Promise.resolve(false)
        }
        if (category.total != 0) { // remove category from all events under this category
            let ts = db.transaction(['events', 'deadlines'], 'readwrite')
            let cursor = await ts.objectStore('events').openCursor()
            while (cursor) {
                if (cursor.value.category == name) {
                    cursor.update({
                        ...cursor.value,
                        category: null
                    })
                }
                cursor = await cursor.continue()
            }
            cursor = await ts.objectStore('deadlines').openCursor()
            while (cursor) {
                if (cursor.value.category == name) {
                    cursor.update({
                        ...cursor.value,
                        category: null
                    })
                }
                cursor = await cursor.continue()
            }
        }
        return db.delete('categories', name)
    }
}
export default categoryUtil;