<template>
    <q-page class="q-px-md q-pb-lg">
        <div class="q-my-md">
            <div class="text-h6 text-grey-7">Active Deadlines</div>
        </div>
        <div v-if="deadlines.length == 0">
            <div class="text-subtitle1 q-my-md text-grey-7">No active deadlines.</div>
        </div>
        <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOutDown">
            <div v-for="(ddl, ind) in deadlines" :key="ddl.id" class="q-my-md">
                <q-card>
                    <q-card-section>
                        <div class="row justify-between">
                            <div class="text-h5">
                                <span :style="categoryHelper.itemTextStyle(ddl)">{{ddl.title}}</span>
                                <span class="q-ml-md">due {{dueStr[ddl.id]}}</span>
                            </div>
                            <div>
                                <q-btn v-if="ddl.completeDate == null" class="q-mr-sm" color="primary" label="Complete" @click="completeDeadline(ind)" />
                                <q-btn v-else class="q-mr-sm" flat color="primary" label="Completed" disable />
                                <q-btn flat round icon="more_horiz">
                                    <q-popup-proxy anchor="bottom right" self="top right">
                                        <q-list>
                                            <q-item clickable v-close-popup @click="editDeadline(ind)">
                                                <q-item-section>Edit</q-item-section>
                                            </q-item>
                                            <q-item clickable v-close-popup @click="removeDeadline(ddl)">
                                                <q-item-section class="text-negative">Delete</q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-popup-proxy>
                                </q-btn>
                            </div>
                        </div>
                        <deadline-progress :value="ddl.progress" @input="progressChange(ind, $event)" :time-value="timeProgress[ddl.id]" :completed="ddl.completeDate != null" class="q-mx-md" />
                        <div class="q-pt-sm text-body2 row justify-between">
                            <div class="q-pr-sm">Started {{calendarTime(ddl.startDate)}}</div>
                            <div v-if="ddl.completeDate != null" class="q-px-sm">Completed {{calendarTime(ddl.completeDate)}}</div>
                            <div class="q-pl-sm">Due {{calendarTime(ddl.dueDate)}}</div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </transition-group>
        <q-btn v-if="!showHistory" flat label="View Past Deadlines" color="grey-7" class="full-width" :loading="historyLoading" @click="viewHistory" ref="historyLoadBtn" />
        <div v-else class="q-mt-lg q-mb-md">
            <div class="text-h6 text-grey-7">Past Deadlines</div>
            <div v-if="historyDeadlines.length == 0">
                <div class="text-subtitle1 q-my-md text-grey-7">No past deadlines.</div>
            </div>
        </div>
        <transition-group v-if="showHistory" appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOutDown">
            <div v-for="ddl in historyDeadlines" :key="ddl.id" class="q-my-md">
                <q-card>
                    <q-card-section>
                        <div class="row justify-between">
                            <div class="text-h5">
                                <span :style="categoryHelper.itemTextStyle(ddl)">{{ddl.title}}</span>
                                <span class="q-ml-md">due {{calendarTime(ddl.dueDate)}}</span>
                            </div>
                            <div>
                                <q-btn v-if="ddl.completeDate == null" class="q-mr-sm" color="primary" label="Complete" disable />
                                <q-btn v-else class="q-mr-sm" flat color="primary" label="Completed" disable />
                                <q-btn flat round icon="more_horiz">
                                    <q-popup-proxy anchor="bottom right" self="top right">
                                        <q-list>
                                            <!--
                                            <q-item clickable v-close-popup @click="editDeadline(ind, true)">
                                                <q-item-section>Edit</q-item-section>
                                            </q-item>
                                            -->
                                            <q-item clickable v-close-popup @click="removeDeadline(ddl, true)">
                                                <q-item-section class="text-negative">Delete</q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-popup-proxy>
                                </q-btn>
                            </div>
                        </div>
                        <deadline-progress :value="ddl.progress" :time-value="1" :completed="ddl.completeDate != null" class="q-mx-md" />
                        <div class="q-pt-sm text-body2 row justify-between">
                            <div class="q-pr-sm">Started {{calendarTime(ddl.startDate)}}</div>
                            <div v-if="ddl.completeDate != null" class="q-px-sm">Completed {{calendarTime(ddl.completeDate)}}</div>
                            <div class="q-pl-sm">Due {{calendarTime(ddl.dueDate)}}</div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </transition-group>
        <q-dialog v-model="editDialog">
            <q-card style="width: 800px; max-width: 90vw;">
                <edit-deadline :ddl="editddl" @close="editDialogClose" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import moment from 'moment'
import { calendarTime } from '../util/date'
import deadlinesUtil from '../util/deadlines'
import DeadlineProgress from '../components/DeadlineProgress.vue'
import EditDeadline from '../components/EditDeadline.vue'
import categoryUtil from 'src/util/category'
import CategoryHelper from 'src/util/CategoryHelper'
export default {
    name: 'Deadlines',
    components: {
        DeadlineProgress,
        EditDeadline
    },
    data() {
        return {
            deadlines: [],
            timer: null,
            timeProgress: {},
            dueStr: {},
            editDialog: false,
            editddl: {},
            editIsHistory: false,
            calendarTime,
            showHistory: false,
            historyLoading: false,
            historyDeadlines: [],
            categoryHelper: new CategoryHelper()
        }
    },
    methods: {
        loadHistoryDeadlines() {
            deadlinesUtil.getAllInactive().then(res => {
                this.historyDeadlines = res.reverse()
                this.historyLoading = false
                this.showHistory = true
            }).catch(err => {
                console.error(err)
            })
        },
        viewHistory() {
            this.historyLoading = true
            this.loadHistoryDeadlines()
        },
        completeDeadline(ind) {
            this.deadlines[ind].progress = 1
            this.deadlines[ind].completeDate = moment().format('YYYY-MM-DD HH:mm')
            deadlinesUtil.update(this.deadlines[ind]).then(() => {

            }).catch(err => {
                console.error(err)
            })
        },
        editDeadline(ind, isHistory = false) {
            this.editddl = isHistory ? this.historyDeadlines[ind] : this.deadlines[ind]
            this.editDialog = true
            this.editIsHistory = isHistory
        },
        removeDeadline(ddl, isHistory = false) {
            deadlinesUtil.remove(ddl).then(() => {
                if (isHistory) this.loadHistoryDeadlines()
                else this.loadDeadlines()
            }).catch(err => {
                console.error(err)
            })
        },
        updateTime() {
            let cur = moment()
            for (let i of this.deadlines) {
                let start = moment(i.startDate)
                let end = moment(i.dueDate)
                if (cur.diff(end) > 0) {
                    this.loadDeadlines()
                    if (this.showHistory) {
                        this.loadHistoryDeadlines()
                    }
                    return
                }
                let prog = cur.diff(start) / end.diff(start)
                this.timeProgress[i.id] = prog
                this.dueStr[i.id] = cur.to(end)
            }
        },
        progressChange(ind, val) {
            this.deadlines[ind].progress = val
            deadlinesUtil.update(this.deadlines[ind]).then(() => {

            }).catch(err => {
                console.error(err)
            })
        },
        editDialogClose() {
            if (this.editIsHistory) this.loadHistoryDeadlines()
            else this.loadDeadlines()
            this.editDialog = false
        },
        addDialogClose() {
            this.loadDeadlines()
            this.addDialog = false
        },
        loadDeadlines() {
            categoryUtil.getAll().then(categories => {
                this.categoryHelper.setCategories(categories);

                deadlinesUtil.getAllActive().then((res) => {
                    this.deadlines = res
                    let timeProgress = {}
                    let dueStr = {}
                    for (let i of this.deadlines) {
                        timeProgress[i.id] = 0
                        dueStr[i.id] = ''
                        // i.startDate = i.dateFrom + ' ' + i.timeFrom
                    }
                    this.timeProgress = timeProgress
                    this.dueStr = dueStr
                    this.updateTime()
                }).catch(err => {
                    console.error(err)
                })
            }).catch(err => {
                console.error(err)
            })
        }
    },
    watch: {
        dataIteration() {
            this.loadDeadlines()
            if (this.showHistory) {
                this.loadHistoryDeadlines()
            }
        },
        pageVisible(val) {
            if (val) {
                this.loadDeadlines()
            }
        }
    },
    computed: {
        dataIteration() {
            return this.$store.state.data.iteration
        },
        pageVisible() {
            return this.$store.state.layout.pageVisible
        }
    },
    mounted() {
        this.loadDeadlines()
        this.timer = setInterval(this.updateTime, 1000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    }
}
</script>

<style lang="scss">

</style>