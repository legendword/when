<template>
    <q-page>
        <q-list>
            <div v-if="unassigned.length > 0">
                <q-item>
                    <q-item-section side>
                        <div class="checkbox-placeholder">

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="text-h4 q-mt-lg q-mb-sm text-brown-8">Unassigned</div>
                    </q-item-section>
                </q-item>
                
                <q-item clickable draggable v-for="item in unassigned" :key="item.index">
                    <q-item-section side top>
                        <q-checkbox v-model="checked[item.index]" v-if="item.isTodo" />
                        <div class="checkbox-placeholder" v-else>

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="list-title">{{ item.title }}</div>
                        <div class="list-notes">{{ item.notes }}</div>
                    </q-item-section>
                </q-item>
            </div>

            <div v-if="pastDue.length > 0">
                <q-item>
                    <q-item-section side>
                        <div class="checkbox-placeholder">

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="text-h4 q-mt-lg q-mb-sm text-negative">Past Due</div>
                    </q-item-section>
                </q-item>
                
                <q-item clickable draggable v-for="item in pastDue" :key="item.index">
                    <q-item-section side top>
                        <q-checkbox v-model="checked[item.index]" v-if="item.isTodo" />
                        <div class="checkbox-placeholder" v-else>

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="list-title">{{ item.title }}</div>
                        <div class="list-notes">{{ item.notes }}</div>
                    </q-item-section>
                </q-item>
            </div>

            <div v-for="day in closeDays" :key="day.date">
                <q-item>
                    <q-item-section side>
                        <div class="checkbox-placeholder">

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="text-h4 q-mt-lg q-mb-sm text-orange-8" v-if="day.displayDate == 'Today'">Today</div>
                        <div class="text-h4 q-mt-lg q-mb-sm text-light-green-8" v-else>{{ day.displayDate }}</div>
                    </q-item-section>
                </q-item>

                <q-item clickable draggable v-for="item in day.events" :key="item.index">
                    <q-item-section side top>
                        <q-checkbox v-model="checked[item.index]" v-if="item.isTodo" />
                        <div class="checkbox-placeholder" v-else>

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="list-title">{{ item.title }}</div>
                        <div class="list-notes">{{ item.notes }}</div>
                    </q-item-section>
                </q-item>

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
                <q-item>
                    <q-item-section side>
                        <div class="checkbox-placeholder">

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="text-h4 q-mt-lg q-mb-sm text-light-green-8">{{ humanDate(day.date) }}</div>
                    </q-item-section>
                </q-item>

                <q-item clickable draggable v-for="item in day.events" :key="item.index">
                    <q-item-section side top>
                        <q-checkbox v-model="checked[item.index]" v-if="item.isTodo" />
                        <div class="checkbox-placeholder" v-else>

                        </div>
                    </q-item-section>
                    <q-item-section>
                        <div class="list-title">{{ item.title }}</div>
                        <div class="list-notes">{{ item.notes }}</div>
                    </q-item-section>
                </q-item>
            </div>
        </q-list>
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="openDrawer" />
        </q-page-sticky>
    </q-page>
</template>

<script>
import listUtil from 'src/util/list'
import moment from 'moment'
import { datecmp, formatDate, humanDate, todayStr, tomorrowStr } from 'src/util/date'
//import { mapState } from 'vuex'
export default {
    name: 'List',
    data() {
        return {
            check: false,
            checked: [],
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
                this.checked = this.list.map(v => false)
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