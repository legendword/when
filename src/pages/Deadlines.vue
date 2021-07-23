<template>
    <q-page class="q-px-md q-py-lg">
        <transition-group v-if="showHistory" appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOutDown">
            <div v-for="(ddl, ind) in historyDeadlines" :key="ddl.id" class="q-my-md">
                <q-card>
                    <q-card-section>
                        <div class="row justify-between">
                            <div class="text-h5">
                                <span>{{ddl.title}}</span>
                                <span class="q-ml-md text-primary">due {{calendarTime(ddl.dueDate)}}</span>
                            </div>
                            <div>
                                <q-btn v-if="ddl.completeDate == null" class="q-mr-sm" color="primary" label="Complete" />
                                <q-btn v-else class="q-mr-sm" flat color="primary" label="Completed" disable />
                                <q-btn flat round icon="more_horiz">
                                    <q-popup-proxy anchor="bottom right" self="top right">
                                        <q-list>
                                            <q-item clickable v-close-popup @click="editDeadline(ind, true)">
                                                <q-item-section>Edit</q-item-section>
                                            </q-item>
                                            <q-item clickable v-close-popup @click="removeDeadline(ddl.id, true)">
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
        <div v-if="showHistory" class="q-my-xl">
            <div class="text-subtitle1 text-center text-grey-7">Past Deadlines</div>
            <q-separator inset />
            <div class="text-subtitle1 text-center text-grey-7">Current Deadlines</div>
        </div>
        <q-btn v-else flat label="View Past Deadlines" color="grey-7" class="full-width" :loading="historyLoading" @click="viewHistory" />
        <div v-if="deadlines.length == 0 ">
            <div class="text-h6 q-mt-md text-grey-7">No current deadlines.</div>
        </div>
        <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOutDown">
            <div v-for="(ddl, ind) in deadlines" :key="ddl.id" class="q-my-md">
                <q-card>
                    <q-card-section>
                        <div class="row justify-between">
                            <div class="text-h5">
                                <span>{{ddl.title}}</span>
                                <span class="q-ml-md text-primary">due {{dueStr[ddl.id]}}</span>
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
                                            <q-item clickable v-close-popup @click="removeDeadline(ddl.id)">
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
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="addDialog = true" />
        </q-page-sticky>
        <q-dialog v-model="addDialog">
            <q-card style="width: 1000px; max-width: 90vw;">
                <new-deadline @close="addDialogClose" />
            </q-card>
        </q-dialog>
        <q-dialog v-model="editDialog">
            <q-card style="width: 1000px; max-width: 90vw;">
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
import NewDeadline from '../components/NewDeadline.vue'
import EditDeadline from '../components/EditDeadline.vue'
export default {
    name: 'Deadlines',
    components: {
        DeadlineProgress,
        NewDeadline,
        EditDeadline
    },
    data() {
        return {
            deadlines: [],
            timer: null,
            timeProgress: {},
            dueStr: {},
            addDialog: false,
            editDialog: false,
            editddl: {},
            editIsHistory: false,
            calendarTime,
            showHistory: false,
            historyLoading: false,
            historyDeadlines: []
        }
    },
    methods: {
        loadHistoryDeadlines() {
            deadlinesUtil.getAllInactive().then(res => {
                this.historyDeadlines = res
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
            this.editddl = this.deadlines[ind]
            this.editDialog = true
            this.editIsHistory = isHistory
        },
        removeDeadline(id, isHistory = false) {
            deadlinesUtil.remove(id).then(() => {
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
            deadlinesUtil.getAllActive().then((res) => {
                this.deadlines = res
                let timeProgress = {}
                let dueStr = {}
                for (let i of this.deadlines) {
                    timeProgress[i.id] = 0
                    dueStr[i.id] = ''
                }
                this.timeProgress = timeProgress
                this.dueStr = dueStr
                this.updateTime()
            }).catch(err => {
                console.error(err)
            })
        }
    },
    watch: {
        pageVisible(val) {
            if (val) {
                this.loadDeadlines()
            }
        }
    },
    computed: {
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