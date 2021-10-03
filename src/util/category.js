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
    }
}
export default categoryUtil;