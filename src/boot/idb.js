import { openDB } from 'idb'
//import Vue from 'vue'

// more info on params: https://quasar.dev/quasar-cli/boot-files

export const idb = {
  data: openDB('data', 1, {
    upgrade: (db, oldVersion, newVersion, transaction) => {
      if (oldVersion <= 0) {
        const events = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true })
        events.createIndex('dateIndex', 'date')
        db.createObjectStore('maxOrder')
      }
    }
  })
}