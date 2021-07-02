<template>
    <q-page class="q-px-md q-pb-lg">
        <q-list>
            <div v-if="unassigned.length > 0">
                <list-header color="brown-8">
                    Unassigned
                </list-header>
                
                <list-event v-for="item in unassigned" :key="item.id" :item="item" :is-dragging="drag.event && drag.event.id == item.id" @edit="editEvent(item)" @remove="removeEvent(item)" @assign="assignEvent(item, $event)" @reorder="reOrderEvent(item, $event)" @dragstart.native="dragStart(item, 'unassigned', null)" @dragover.native="dragOver($event)" @drop.native="drop($event)" @dragenter.native="dragEnter(item, 'unassigned', null)" @dragleave.native="dragLeave()" />
            </div>

            <div v-if="pastDue.length > 0">
                <list-header color="negative">
                    Past Due
                </list-header>
                
                <list-event v-for="item in pastDue" :key="item.id" :item="item" @edit="editEvent(item)" @remove="removeEvent(item)" @assign="assignEvent(item, $event)" no-reorder show-date />
            </div>

            <div v-for="(day, dayInd) in closeDays" :key="day.date">
                <list-header :color="day.displayDate == 'Today' ? 'orange-8' : 'light-green-8'" @dragover.native="dragOver($event)" @dragenter.native="dragEnter(0, 'closeDays', dayInd)" @drop.native="drop($event)">
                    {{ day.displayDate }}

                    <template v-slot:side>
                        {{ day.date.substr(8, 2) }}
                    </template>
                </list-header>

                <list-event v-for="item in day.events" :key="item.id" :item="item" is-assigned :is-today="day.displayDate == 'Today'" @edit="editEvent(item)" @remove="removeEvent(item)" @move="moveEvent(item, $event)" @reorder="reOrderEvent(item, $event)" :is-dragging="drag.event && drag.event.id == item.id" @dragstart.native="dragStart(item, 'closeDays', dayInd)" @dragover.native="dragOver($event)" @drop.native="drop($event)" @dragenter.native="dragEnter(item, 'closeDays', dayInd)" @dragleave.native="dragLeave()" />

                <q-item v-if="day.events.length == 0">
                    <q-item-section side>
                        <div class="checkbox-placeholder">

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="text-subtitle2 text-grey-8">No events.</div>
                    </q-item-section>
                </q-item>
            </div>

            <div v-for="(day, dayInd) in days" :key="day.date">
                <list-header color="light-green-8" @dragover.native="dragOver($event)" @dragenter.native="dragEnter(0, 'closeDays', dayInd)" @drop.native="drop($event)">
                    {{ humanDate(day.date) }}
                </list-header>

                <list-event v-for="item in day.events" :key="item.id" :item="item" isAssigned @edit="editEvent(item)" @remove="removeEvent(item)" @move="moveEvent(item, $event)" @reorder="reOrderEvent(item, $event)" :is-dragging="drag.event && drag.event.id == item.id" @dragstart.native="dragStart(item, 'days', dayInd)" @dragover.native="dragOver($event)" @drop.native="drop($event)" @dragenter.native="dragEnter(item, 'days', dayInd)" @dragleave.native="dragLeave()" />
            </div>
        </q-list>
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="openDrawer" />
        </q-page-sticky>
        <q-dialog v-model="editEventDialog">
            <q-card style="width: 700px; max-width: 80vw;">
                <edit-event :event="editEventObj" :show="editEventDialog" @close="editEventDialog = false" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import EditEvent from '../components/EditEvent.vue'
import ListEvent from '../components/ListEvent.vue'
import ListHeader from '../components/ListHeader.vue'
import listUtil from '../util/list'
import { arrayMove, arrayTransfer } from '../util/array'
import moment from 'moment'
import { datecmp, offsetDate, humanDate, todayStr, tomorrowStr } from 'src/util/date'
//import { mapState } from 'vuex'
export default {
    name: 'List',
    components: {
        ListEvent,
        ListHeader,
        EditEvent
    },
    data() {
        return {
            list: [],
            unassigned: [],
            pastDue: [],
            closeDays: [],
            days: [],
            today: todayStr(),
            tomorrow: tomorrowStr(),
            humanDate,
            editEventDialog: false,
            editEventObj: {},
            drag: {
                event: null,
                originalSection: null,
                originalSubsection: null,
                originalIndex: null,
                currentSection: null,
                currentSubsection: null,
                currentIndex: null,
                hover: null
            }
        }
    },
    methods: {
        drop(e) {
            e.preventDefault()
            let { currentSection, originalSection, currentSubsection, originalSubsection, currentIndex, originalIndex } = this.drag
            console.log('drop', currentSection, originalSection, currentSubsection, originalSubsection, currentIndex, originalIndex)
            if (currentSection == 'pastDue') {
                this.drag.event = null
                this.sortList()
                return
            }
            if (currentSection == originalSection && currentSubsection == originalSubsection) {
                if (currentIndex == originalIndex) {
                    this.drag.event = null
                    return //nothing to do here
                }
                console.log('drop: reOrderEvent')
                listUtil.reOrderEvent(this.drag.event, currentIndex - originalIndex).then(() => {
                    this.loadList()
                }).catch(err => {
                    console.error(err)
                })
            }
            else {
                if (currentSection == 'unassigned') {
                    //currently does not support unassigning events
                    //may be added in a future release
                    this.drag.event = null
                    return
                }
                let targetDate = currentSubsection == null ? currentSection : this[currentSection][currentSubsection].date
                if (this.drag.event.date == 'unassigned') {
                    console.log('drop: assignEvent', targetDate)
                    listUtil.assignEvent(this.drag.event, targetDate, currentIndex).then(() => {
                        this.loadList()
                    }).catch(err => {
                        console.error(err)
                    })
                }
                else {
                    console.log('drop: moveEvent', targetDate)
                    listUtil.moveEvent(this.drag.event, targetDate, currentIndex).then(() => {
                        this.loadList()
                    }).catch(err => {
                        console.error(err)
                    })
                }
            }
            this.drag.event = null
        },
        dragEnter(evt, section, subsection) {
            console.log('dragEnter', evt === 0 ? evt : evt.title, section, subsection)
            if (!this.drag.event) return
            if (evt === 0) {
                this.drag.hover = null
                let cursec = this.drag.currentSection
                let cursub = this.drag.currentSubsection
                if (cursec == section && cursub == subsection) {
                    let arr = subsection==null?this[section]:this[section][subsection].events
                    arrayMove(arr, this.drag.currentIndex, 0)
                }
                else {
                    let oldArr = cursub==null?this[cursec]:this[cursec][cursub].events
                    let newArr = subsection==null?this[section]:this[section][subsection].events
                    //console.log('dragEnter!', oldArr, newArr, this.drag.currentIndex)
                    
                    arrayTransfer(oldArr, newArr, this.drag.currentIndex, 0)
                    //console.log(oldArr, newArr)
                    this.drag.currentSection = section
                    this.drag.currentSubsection = subsection
                }
                this.drag.currentIndex = 0
            }
            else if (evt.id == this.drag.event.id) return
            else if (this.drag.hover != evt.id) {
                this.drag.hover = evt.id
                let cursec = this.drag.currentSection
                let cursub = this.drag.currentSubsection
                if (cursec == section) {
                    let arr = subsection==null?this[section]:this[section][subsection].events
                    let newIndex = arr.findIndex(v => v.id == evt.id)
                    arrayMove(arr, this.drag.currentIndex, newIndex)
                    this.drag.currentIndex = newIndex
                }
                else {
                    let oldArr = cursub==null?this[cursec]:this[cursec][cursub].events
                    let newArr = subsection==null?this[section]:this[section][subsection].events
                    let newIndex = newArr.findIndex(v => v.id == evt.id)
                    arrayTransfer(oldArr, newArr, this.drag.currentIndex, newIndex)
                    this.drag.currentSection = section
                    this.drag.currentSubsection = subsection
                    this.drag.currentIndex = newIndex
                }
            }
        },
        dragLeave() {
            this.drag.hover = null
        },
        dragOver(e) {
            e.preventDefault()
        },
        dragEnd() {
            console.log('dragEnd')
        },
        dragStart(evt, section, subsection) {
            console.log('dragStart', evt.title)
            this.drag.event = evt
            this.drag.currentSection = section
            this.drag.currentSubsection = subsection
            let arr = subsection==null?this[section]:this[section][subsection].events
            let ind = arr.findIndex(v => v.id == evt.id)
            this.drag.currentIndex = ind
            this.drag.originalSection = section
            this.drag.originalSubsection = subsection
            this.drag.originalIndex = ind
        },
        editEvent(evt) {
            this.editEventObj = evt
            this.editEventDialog = true
        },
        reOrderEvent(evt, offset) {
            listUtil.reOrderEvent(evt, offset).then(() => {
                this.loadList()
            }).catch(err => {
                console.error(err)
            })
        },
        moveEvent(evt, dayOffset) {
            let dest = offsetDate(evt.date, dayOffset)
            console.log(evt, dayOffset, dest)
            listUtil.moveEvent(evt, dest).then(() => {
                this.loadList()
            }).catch(err => {
                console.error(err)
            })
        },
        assignEvent(evt, day) {
            console.log(evt, day)
            let dt = day == 'today' ? this.today : this.tomorrow
            listUtil.assignEvent(evt, dt).then(() => {
                this.loadList()
            }).catch(err => {
                console.error(err)
            })
        },
        removeEvent(evt) {
            listUtil.deleteEvent(evt).then(() => {
                this.loadList()
            }).catch(err => {
                console.error(err)
            })
        },
        openDrawer() {
            this.$store.commit('layout/drawerState', true)
        },
        sortList() { //sort list content into unassigned, pastDue, and days
            this.unassigned = []
            this.pastDue = []
            this.closeDays = []
            this.days = []
            let d = moment()
            const dateNames = ['Today', 'Tomorrow']
            for (let i=0;i<7;i++) {
                this.closeDays.push({
                    date: d.format('YYYY-MM-DD'),
                    displayDate: i<2 ? dateNames[i] : d.format('dddd'),
                    events: []
                })
                d = d.add(1, 'd')
            }
            for (let i of this.list) {
                if (i.date == 'unassigned') {
                    this.unassigned.push(i)
                }
                else if (datecmp(i.date, this.today) < 0) {
                    if (!i.isTodo) continue //none-todo events are never pastDue
                    this.pastDue.push(i)
                }
                else {
                    let dateStr = i.date.substr(0, 10)
                    let closeInd = this.closeDays.findIndex(v => v.date == dateStr)
                    if (closeInd == -1) {
                        let ind = this.days.findIndex(v => v.date == dateStr)
                        if (ind == -1) {
                            this.days.push({
                                date: dateStr,
                                events: [i]
                            })
                        }
                        else {
                            this.days[ind].events.push(i)
                        }
                    }
                    else {
                        this.closeDays[closeInd].events.push(i)
                    }
                }
            }
            this.unassigned.sort((a, b) => {
                return a.order - b.order
            })
            for (let i in this.closeDays) {
                this.closeDays[i].events.sort((a, b) => {
                    return a.order - b.order
                })
            }
            for (let i in this.days) {
                this.days[i].events.sort((a, b) => {
                    return a.order - b.order
                })
            }

            //console.log(this.unassigned, this.pastDue, this.closeDays, this.days)
        },
        loadList() {
            listUtil.getAllEvents().then(res => {
                this.list = res
                console.log('getAllEvents success')
                this.sortList()
            }).catch(err => {
                console.error('getAllEvents error: ', err)
            })
        }
    },
    watch: {
        newEvent(val) {
            if (val) {
                this.loadList()
                this.$store.commit('data/newEvent', false)
            }
        },
        pageVisible(val) {
            if (val) {
                //either this.loadList() or this.sortList()
                console.log('list re-render')
                this.today = todayStr()
                this.tomorrow = tomorrowStr()
                this.sortList()
            }
        }
    },
    computed: {
        newEvent() {
            return this.$store.state.data.newEvent
        },
        pageVisible() {
            return this.$store.state.layout.pageVisible
        }
    },
    created() {
        this.loadList()
    }
}
</script>

<style scoped lang="scss">
.checkbox-placeholder {
    width: 40px; /* smaller than 40px to allow text to be a bit to the left */
    height: 40px;
}
.list-title {
    font-size: 1rem;
}
.list-notes {
    font-size: 0.9rem;
    color: #616161;
}
</style>