<template>
    <q-page class="calendar-page">
        <div class="calendar-week">
            <div v-for="i in 7" :key="i" class="calendar-header text-subtitle2 grid-child">
                {{ CalendarHelper.dayNameRef[i-1] }}
            </div>
        </div>
        <div class="calendar-main">
            <div v-for="(row, ind) in monthLayout" :key="ind" class="calendar-row">
                <div v-for="day in row" :key="day.fullDate" class="calendar-day grid-child">
                    <div class="calendar-date text-center text-subtitle2 text-grey-7">
                        <div v-if="day.fullDate == helper.today" class="today">{{ day.date }}</div>
                        <div v-else>{{ (day.date == 1 ? CalendarHelper.monthNameRef[day.month] + ' ' : '' ) + day.date }}</div>
                    </div>
                    <template v-if="days[day.fullDate] != null">
                        <div :class="'calendar-event text-subtitle2' + (activeEvent == event.id ? ' shadow-5' : '')" v-for="event in days[day.fullDate]" :key="event.id" :title="event.title + (!event.fullDay ? (' ' + event.timeFrom) : '')" :style="categoryHelper.calendarItemStyle(event)">
                            <div :class="'event-title ellipsis' + (event.isTodo ? ' todo' : '') + ((event.isTodo && event.done) ? ' strikethrough' : '')">{{ event.title }}</div>
                            <div v-if="!event.fullDay" class="event-time text-grey-7">{{ event.timeFrom }}</div>

                            <q-popup-proxy @before-show="activeEvent = event.id" @before-hide="activeEvent = null">
                                <q-card style="min-width: 400px;">
                                    <q-bar class="q-pl-md" :style="categoryHelper.itemBackgroundStyle(event)">
                                        <div class="text-body2 text-weight-medium">{{ event.isTodo ? 'Todo' : 'Event' }}</div>
                                        <q-space />
                                        <q-btn @click="confirmRemoveEvent(event)" dense flat icon="delete" />
                                        <q-btn @click="editEvent(event)" dense flat icon="edit" v-close-popup />
                                        <q-btn dense flat icon="close" v-close-popup />
                                    </q-bar>
                                    <q-card-section>
                                        <div class="text-h6 calendar-popup-title">
                                            <div>{{ event.title }}</div>
                                            <div>
                                                <q-chip v-if="event.category != null" :style="categoryHelper.itemBackgroundStyle(event)">{{ categoryHelper.categoryName[event.category] }}</q-chip>
                                            </div>
                                        </div>
                                        <template v-if="event.dateTo && event.dateTo != event.dateFrom"> <!-- multi-day events -->
                                            <div class="text-body2">
                                                <span style="display: inline-block; width: 42px;">From </span>
                                                <span>{{ humanWeekDate(event.dateFrom) }}</span>
                                                <span v-if="!event.fullDay" class="text-grey-7"> {{ event.timeFrom }}</span>
                                            </div>
                                            <div class="text-body2">
                                                <span style="display: inline-block; width: 42px;">To </span>
                                                <span>{{ humanWeekDate(event.dateTo) }}</span>
                                                <span v-if="!event.fullDay" class="text-grey-7"> {{ event.timeTo }}</span>
                                            </div>
                                        </template>
                                        <div class="text-body2" v-else>
                                            <span>{{ humanWeekDate(event.dateFrom) }}</span>
                                            <span v-if="!event.fullDay" class="text-grey-7"> {{ event.timeFrom }}</span>
                                            <span v-if="!event.fullDay && event.dateTo" class="text-grey-7"> - {{ event.timeTo }}</span>
                                        </div>
                                        <div class="q-mt-md event-notes" v-if="event.notes.length > 0">{{ event.notes }}</div>
                                    </q-card-section>
                                    <q-separator />
                                    <q-card-actions align="right" v-if="event.type == 'todo'">
                                        <q-btn v-if="event.done" flat label="Mark Uncomplete" no-caps class="text-grey-7 text-subtitle2" @click="markAsDone(event, false)" />
                                        <q-btn v-else flat label="Mark Completed" no-caps class="text-grey-7 text-subtitle2" @click="markAsDone(event, true)"  />
                                    </q-card-actions>
                                </q-card>
                            </q-popup-proxy>

                            <q-menu touch-position context-menu>
                                <q-list dense style="min-width: 100px">
                                    <q-item clickable v-close-popup @click="moveEvent(event, -1)">
                                        <q-item-section>Move to Previous Day</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="moveEvent(event, 1)">
                                        <q-item-section>Move to Next Day</q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click="reOrderEvent(event, -1)">
                                        <q-item-section>Move Up</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="reOrderEvent(event, 1)">
                                        <q-item-section>Move Down</q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click="editEvent(event)">
                                        <q-item-section class="text-primary">Edit Event</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="removeEvent(event)">
                                        <q-item-section class="text-negative">Delete Event</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <q-dialog v-model="editEventDialog">
            <q-card style="width: 1000px; max-width: 90vw;">
                <edit-event :event="editEventObj" :show="editEventDialog" @close="editEventDialog = false" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import listUtil from '../util/list'
import CalendarHelper from '../util/CalendarHelper'
import { humanWeekDate, offsetDate, thisMonth } from 'src/util/date'
import EditEvent from '../components/EditEvent.vue'
import moment from 'moment'
import CategoryHelper from '../util/CategoryHelper'
import categoryUtil from 'src/util/category'
export default {
    name: 'Calendar',
    components: {
        EditEvent
    },
    data() {
        return {
            list: [],
            unassigned: [],
            days: {},
            monthLayout: [],
            helper: null,
            CalendarHelper: CalendarHelper,
            humanWeekDate,
            editEventDialog: false,
            editEventObj: {},
            activeEvent: null,
            categoryHelper: null,
            categories: null
        }
    },
    methods: {
        markAsDone(evt, isDone) {
            listUtil.changeEventDone(evt, isDone).then(() => {
                evt.done = isDone
            })
        },
        editEvent(evt) {
            // console.log({...evt})
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
            listUtil.moveEvent(evt, dayOffset).then(() => {
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
        confirmRemoveEvent(evt) {
            this.$q.dialog({
                title: 'Confirm Delete',
                message: 'Would you like to delete this event?',
                cancel: true,
                persistent: true,
                ok: {
                    color: 'negative',
                    label: 'Delete',
                    flat: true
                }
            }).onOk(() => {
                this.removeEvent(evt)
            })
        },
        sortList() { //sort list content into days
            this.unassigned = [];
            this.days = {};
            let categoryStats = {};
            for (let i of this.categories) {
                categoryStats[i.id] = 0;
            }
            let multiDayEvents = [];
            for (let i of this.list) {
                i.type = i.isTodo ? 'todo' : 'event'
                if (i.date == 'unassigned') {
                    this.unassigned.push(i)
                }
                else {
                    let dateStr = i.date;
                    if (this.days[dateStr]) {
                        this.days[dateStr].push(i);
                    }
                    else {
                        this.days[dateStr] = [i];
                    }
                    if (i.dateTo && i.dateTo != dateStr) {
                        multiDayEvents.push(i);
                    }
                }
                if (i.category != null) categoryStats[i.category]++;
            }
            // sort arrays by order
            this.unassigned.sort((a, b) => {
                return a.order - b.order
            })
            for (let i in this.days) {
                this.days[i].sort((a, b) => {
                    return a.order - b.order
                })
            }
            // multi-day events parsing
            for (let i of multiDayEvents) {
                let jt = i.dateFrom;
                let j = moment(jt, 'YYYY-MM-DD');
                while (jt != i.dateTo) {
                    j.add(1, 'day');
                    jt = j.format('YYYY-MM-DD');
                    if (this.days[jt]) {
                        this.days[jt].unshift(i);
                    }
                    else {
                        this.days[jt] = [i];
                    }
                }
            }
            this.$store.commit('data/categoryStats', categoryStats);
            //console.log(this.unassigned, this.days)
        },
        loadList() {
            // this.categoryHelper = new CategoryHelper(this.$store.state.data.categories);
            categoryUtil.getAll().then(categories => {
                this.categories = categories
                this.categoryHelper.setCategories(categories);

                listUtil.getAllEvents().then(res => {
                    this.list = res
                    this.sortList()
                }).catch(err => {
                    console.error('getAllEvents error: ', err)
                })
            }).catch(err => {
                console.error('error: ', err)
            })
        }
    },
    created() {
        this.helper = new CalendarHelper()
        this.monthLayout = this.helper.monthLayout()
        this.categoryHelper = new CategoryHelper()
        this.$store.commit('data/changeMonth', thisMonth())
        this.loadList()
    },
    watch: {
        dataIteration() {
            this.loadList()
        },
        pageVisible(val) {
            if (val) {
                this.monthLayout = this.helper.monthLayout()
                this.sortList()
            }
        },
        currentMonth(val) {
            if (val != '') {
                this.helper.changeMonth(val)
                this.monthLayout = this.helper.monthLayout()
                // this.sortList()
            }
        }
    },
    computed: {
        dataIteration() {
            return this.$store.state.data.iteration
        },
        pageVisible() {
            return this.$store.state.layout.pageVisible
        },
        currentMonth() {
            return this.$store.state.data.currentMonth
        }
    },
}
</script>

<style lang="scss" scoped>
.calendar-page {
    height: calc( 100vh - 60px );
    display: block;
    position: relative;

    .grid-child {
        border-right: $border 1px solid;

        &:last-child {
            border-right: none;
        }
    }
}

.calendar-week {
    display: flex;
    flex-direction: row;

    .calendar-header {
        flex: 1;
        text-align: center;
        height: 36px;
        line-height: 36px;
    }
}

.calendar-main {
    width: 100%;
    height: calc( 100% - 36px );
    display: flex;
    flex-direction: column;

    .calendar-row {
        flex: 1;
        display: flex;
        flex-direction: row;

        .calendar-day {
            flex: 1;
            border-top: $border 1px solid;
        }
    }
}

.calendar-date {
    display: flex;
    flex-direction: row;
    justify-content: center;

    height: 22px;
    line-height: 22px;
    margin: 4px 0;

    .today {
        width: 24px;
        height: 24px;
        line-height: 24px;
        border-radius: 24px;
        margin: 0 0;
        background-color: $primary;
        color: #ffffff;
    }
}

.calendar-popup-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.calendar-event {
    text-align: left;
    height: 22px;
    line-height: 22px;
    margin-left: 2%;
    margin-right: 2%;
    border-radius: 5px;
    padding-left: 5%;
    padding-right: 5%;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    &:hover {
        background-color: #f2f2f2;
    }

    .event-title.todo:not(.strikethrough) {
        font-weight: 500;
    }
    .event-title.todo.strikethrough {
        font-weight: normal;
    }

    /* .event-time {
        margin-left: 3%;
    } */
}

@media (max-width: 768px) {
    .calendar-event {
        margin: 0;
        padding-left: 2px;
    }
    .event-time {
        display: none;
    }
}

.event-notes {
    white-space: pre-wrap;
}
</style>