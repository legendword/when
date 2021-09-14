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
                    <div class="q-my-xs text-center text-subtitle2 text-grey-7">{{ (day.date == 1 ? CalendarHelper.monthNameRef[day.month] + ' ' : '' ) + day.date }}</div>
                    <template v-if="days[day.fullDate] != null">
                        <div class="calendar-event" v-for="event in days[day.fullDate]" :key="event.id">
                            {{event.title}}
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
                    let dateStr = i.date.substr(0, 10)
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

            .calendar-event {
                text-align: left;
                padding-left: 5%;
            }
        }
    }
}
</style>