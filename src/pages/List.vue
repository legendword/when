<template>
    <q-page class="q-px-md q-pb-lg">
        <q-list>
            <div v-if="unassigned.length > 0">
                <list-header color="brown-8">
                    Unassigned
                </list-header>
                
                <list-event v-for="item in unassigned" :key="item.index" :item="item" />
            </div>

            <div v-if="pastDue.length > 0">
                <list-header color="negative">
                    Past Due
                </list-header>
                
                <list-event v-for="item in pastDue" :key="item.index" :item="item" />
            </div>

            <div v-for="day in closeDays" :key="day.date">
                <list-header :color="day.displayDate == 'Today' ? 'orange-8' : 'light-green-8'">
                    {{ day.displayDate }}

                    <template v-slot:side>
                        {{ day.date.substr(8, 2) }}
                    </template>
                </list-header>

                <list-event v-for="item in day.events" :key="item.index" :item="item" />

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

            <div v-for="day in days" :key="day.date">
                <list-header color="light-green-8">
                    {{ humanDate(day.date) }}
                </list-header>

                <list-event v-for="item in day.events" :key="item.index" :item="item" />
            </div>
        </q-list>
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="openDrawer" />
        </q-page-sticky>
    </q-page>
</template>

<script>
import ListEvent from '../components/ListEvent.vue'
import ListHeader from '../components/ListHeader.vue'
import listUtil from 'src/util/list'
import moment from 'moment'
import { datecmp, formatDate, humanDate, todayStr, tomorrowStr } from 'src/util/date'
//import { mapState } from 'vuex'
export default {
    name: 'List',
    components: {
        ListEvent,
        ListHeader
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
            humanDate
        }
    },
    methods: {
        openDrawer() {
            this.$store.commit('layout/drawerState', true)
        },
        sortList() { //sort list content into unassigned, pastDue, and days
            console.log(this.today, this.tomorrow)
            this.unassigned = []
            this.pastDue = []
            this.closeDays = []
            this.days = []
            let index = 0
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
                i.index = index++
                if (i.date == 'null') {
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
            //todo or not to do: sort this.days by date
            console.log(this.unassigned, this.pastDue, this.closeDays, this.days)
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
        }
    },
    computed: {
        newEvent() {
            return this.$store.state.data.newEvent
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