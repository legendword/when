import { openDB } from 'idb'
//import Vue from 'vue'

// more info on params: https://quasar.dev/quasar-cli/boot-files

export const idb = {
  data: openDB('data', 1, {
    upgrade: (db, oldVersion, newVersion, transaction) => {
      if (oldVersion <= 0) {
        const assigned = db.createObjectStore('assigned', { keyPath: 'id', autoIncrement: true })
        assigned.createIndex('dateIndex', 'date')
        db.createObjectStore('unassigned', { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('maxOrder')
      }
    }
  })
}