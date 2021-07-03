<template>
    <q-page class="q-px-md q-py-lg">
        <div v-for="(ddl, ind) in deadlines" :key="ddl.id" class="q-my-md">
            <q-card>
                <q-card-section>
                    <div class="text-h5">
                        <span>{{ddl.title}}</span>
                        <span class="q-ml-md text-primary">due {{dueStr[ddl.id]}}</span>
                    </div>
                    <deadline-progress :value="ddl.progress" @input="progressChange(ind, $event)" :time-value="timeProgress[ddl.id]" class="q-mx-sm" />
                    <div class="q-pt-sm text-subtitle1 row justify-between">
                        <div>Due {{ddl.dueDate}}</div>
                        <div>Started {{ddl.startDate}}</div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="addDialog = true" />
        </q-page-sticky>
        <q-dialog v-model="addDialog">
            <q-card style="width: 700px; max-width: 80vw;">
                <new-deadline :show="addDialog" @close="addDialogClose" />
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import moment from 'moment'
import deadlinesUtil from '../util/deadlines'
import DeadlineProgress from '../components/DeadlineProgress.vue'
import NewDeadline from '../components/NewDeadline.vue'
export default {
    name: 'Deadlines',
    components: {
        DeadlineProgress,
        NewDeadline
    },
    data() {
        return {
            deadlines: [],
            timer: null,
            timeProgress: {},
            dueStr: {},
            addDialog: false
        }
    },
    methods: {
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