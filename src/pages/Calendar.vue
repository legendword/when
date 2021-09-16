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
                        <div class="calendar-event text-subtitle2" v-for="event in days[day.fullDate]" :key="event.id" :title="event.title + (event.dateFrom.length > 10 ? (' ' + event.dateFrom.substr(11)) : '')">
                            <div :class="'event-icon ' + (event.isTodo ? 'todo' : 'event')"></div>
                            <div :class="'event-title ellipsis' + ((event.isTodo && event.done) ? ' strikethrough' : '')">{{event.title}}</div>
                            <div v-if="event.dateFrom.length > 10" class="event-time text-grey-7">{{event.dateFrom.substr(11)}}</div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script>
import listUtil from '../util/list'
import CalendarHelper from '../util/calendar'
export default {
    name: 'Calendar',
    data() {
        return {
            list: [],
            unassigned: [],
            days: {},
            monthLayout: [],
            helper: null,
            CalendarHelper: CalendarHelper
        }
    },
    methods: {
        sortList() { //sort list content into unassigned, pastDue, and days
            this.unassigned = []
            this.days = {};
            for (let i of this.list) {
                if (i.date == 'unassigned') {
                    this.unassigned.push(i)
                }
                else {
                    let dateStr = i.date.substr(0, 10);
                    if (this.days[dateStr]) {
                        this.days[dateStr].push(i);
                    }
                    else {
                        this.days[dateStr] = [i];
                    }
                }
            }
            this.unassigned.sort((a, b) => {
                return a.order - b.order
            })
            for (let i in this.days) {
                this.days[i].sort((a, b) => {
                    return a.order - b.order
                })
            }

            //console.log(this.unassigned, this.pastDue, this.closeDays, this.days)
        },
        loadList() {
            listUtil.getAllEvents().then(res => {
                this.list = res
                this.sortList()
            }).catch(err => {
                console.error('getAllEvents error: ', err)
            })
        }
    },
    created() {
        this.$store.commit('layout/pageTitle', 'Calendar')
        this.helper = new CalendarHelper()
        this.monthLayout = this.helper.monthLayout()
        this.loadList()
    }
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

.calendar-event {
    text-align: left;
    height: 22px;
    line-height: 22px;
    margin-left: 2%;
    margin-right: 2%;
    border-radius: 5px;
    padding-left: 5%;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    &:hover {
        background-color: #f2f2f2;
    }

    .event-icon {
        border-radius: 9px;
        height: 9px;
        width: 9px;
        margin-right: 3%;
        background-color: $primary;

        &.todo {
            background-color: $secondary;
        }
        &.event {
            background-color: $primary;
        }
    }

    .event-time {
        margin-left: 3%;
    }
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
</style>