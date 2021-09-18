<template>
    <div class="q-py-lg q-px-xl">
        <div class="full-width">
            <div class="q-mb-lg">
                <q-input autofocus v-model="value.title" hide-bottom-space placeholder="Title" ref="title" input-class="text-input" />
            </div>
            <q-tabs v-model="type" dense class="text-grey" :active-color="type" :indicator-color="type" align="left">
                <q-tab name="event" label="Event" />
                <q-tab name="todo" label="Todo" />
                <q-tab name="deadline" label="Deadline" />
            </q-tabs>
            <q-tab-panels v-model="type" animated transition-prev="fade" transition-next="fade">
                <q-tab-panel name="event" class="ne-tab-panel">
                    <div class="ne-row">
                        <div class="ne-icon">
                            <q-icon name="schedule" :color="inFocus.date ? 'primary' : 'default'" size="20px" />
                        </div>
                        <div class="ne-input ne-date-wrapper">
                            <date-input v-model="value.dateFrom" @focus="dateFocus('dateFrom')" @blur="dateBlur('dateFrom')" />
                            <time-input v-if="!value.fullDay" v-model="value.timeFrom" @focus="dateFocus('timeFrom')" @blur="dateBlur('timeFrom')" @remove="removeTime" :removeBtn="true" />

                            <template v-if="value.dateTo != null">
                                <div> to </div>
                                <date-input v-model="value.dateTo" @focus="dateFocus('dateTo')" @blur="dateBlur('dateTo')" />
                                <time-input v-if="!value.fullDay" v-model="value.timeTo" @focus="dateFocus('timeTo')" @blur="dateBlur('timeTo')" />
                            </template>

                            <q-btn v-if="value.fullDay" @click="addTime" label="Add Time" color="primary" flat dense />
                            <q-btn v-if="value.dateTo == null" @click="addDateTo" label="Add End Date" color="primary" flat dense />
                            <q-btn v-else @click="removeDateTo" icon="close" flat dense round size="12px" style="color: rgba(0, 0, 0, 0.54);" />
                        </div>
                    </div>
                    <div class="ne-row">
                        <div class="ne-icon pd">
                            <q-btn :color="inFocus.notes ? 'primary' : 'default'" round flat dense size="12px" icon="notes" @click="goFocus('notes')" />
                        </div>
                        <div class="ne-input">
                            <q-input borderless v-model="value.notes" label="Notes" autogrow @focus="inFocus.notes = true" @blur="inFocus.notes = false" ref="notes" />
                        </div>
                    </div>
                </q-tab-panel>
                <q-tab-panel name="todo" class="ne-tab-panel">
                    <div class="ne-row">
                        <div class="ne-icon">
                            <q-icon name="schedule" :color="inFocus.date ? 'primary' : 'default'" size="20px" />
                        </div>
                        <div class="ne-input ne-date-wrapper">
                            <date-input v-model="value.dateFrom" @focus="dateFocus('dateFrom')" @blur="dateBlur('dateFrom')" />
                            <time-input v-if="!value.fullDay" v-model="value.timeFrom" @focus="dateFocus('timeFrom')" @blur="dateBlur('timeFrom')" @remove="removeTime" :removeBtn="true" />

                            <q-btn v-if="value.fullDay" @click="addTime" label="Add Time" color="primary" flat dense />
                        </div>
                    </div>
                    <div class="ne-row">
                        <div class="ne-icon pd">
                            <q-btn :color="inFocus.notes ? 'primary' : 'default'" round flat dense size="12px" icon="notes" @click="goFocus('notes')" />
                        </div>
                        <div class="ne-input">
                            <q-input borderless v-model="value.notes" label="Notes" autogrow @focus="inFocus.notes = true" @blur="inFocus.notes = false" ref="notes" />
                        </div>
                    </div>
                </q-tab-panel>
                <q-tab-panel name="deadline" class="ne-tab-panel">
                    <div class="ne-row">
                        <div class="ne-icon">
                            <q-icon name="schedule" :color="inFocus.date ? 'primary' : 'default'" size="20px" />
                        </div>
                        <div class="ne-input ne-date-wrapper">
                            <div style="width: 50px;">Starts </div>
                            <date-input v-model="deadlineValue.dateFrom" @focus="dateFocus('dateFrom')" @blur="dateBlur('dateFrom')" />
                            <time-input v-model="deadlineValue.timeFrom" @focus="dateFocus('timeFrom')" @blur="dateBlur('timeFrom')" />
                        </div>
                    </div>
                    <div class="ne-row">
                        <div class="ne-icon">
                            <q-icon name="alarm" :color="inFocus.date ? 'primary' : 'default'" size="20px" />
                        </div>
                        <div class="ne-input ne-date-wrapper">
                            <div style="width: 50px;">Due </div>
                            <date-input v-model="deadlineValue.dateTo" @focus="dateFocus('dateTo')" @blur="dateBlur('dateTo')" />
                            <time-input v-model="deadlineValue.timeTo" @focus="dateFocus('timeTo')" @blur="dateBlur('timeTo')" />
                        </div>
                    </div>
                </q-tab-panel>
            </q-tab-panels>

            <div class="q-mt-lg q-mb-md">
                <q-btn color="primary" unelevated label="Done" @click="submit" />
                <q-btn color="grey" flat label="Cancel" @click="$emit('close')" class="q-ml-sm" />
            </div>
        </div>
    </div>
</template>

<script>
import { nowStr, todayStr, tomorrowStr } from 'src/util/date'
import DateInput from './DateInput.vue'
import TimeInput from './TimeInput.vue'
import listUtil from '../util/list'
export default {
    name: 'NewEvent',
    props: {
        show: Boolean
    },
    components: {
        DateInput,
        TimeInput
    },
    data() {
        return {
            type: 'event',

            //defaults should be in sync with clear()
            value: {
                title: '',
                isTodo: false,
                fullDay: true,
                dateFrom: todayStr(),
                dateTo: null,
                timeFrom: null,
                timeTo: null,
                notes: ''
            },
            deadlineValue: {
                title: '',
                dateFrom: todayStr(),
                dateTo: tomorrowStr(),
                timeFrom: nowStr(),
                timeTo: nowStr(),
                progress: 0,
                completeDate: null
            },
            inFocus: {
                date: false,
                notes: false
            },
            currentActive: ''
        }
    },
    watch: {
        show: {
            handler(val) {
                if (val) {
                    if (this.$store.state.layout.pageTitle == 'Deadlines') {
                        this.type = 'deadline'
                    }
                }
            },
            immediate: true
        }
    },
    methods: {
        goFocus(name) {
            if (this.$refs[name]) {
                this.$refs[name].focus()
            }
        },
        dateFocus(val) {
            this.inFocus.date = true
            this.currentActive = val
        },
        dateBlur(val) {
            if (this.currentActive == val) this.inFocus.date = false
        },
        removeTime() {
            this.value.fullDay = true
            this.value.timeFrom = null
            this.value.timeTo = null
        },
        addTime() {
            this.value.fullDay = false
            this.value.timeFrom = nowStr()
            if (this.value.dateTo != null) this.value.timeTo = nowStr()
        },
        removeDateTo() {
            this.value.dateTo = null
            this.value.timeTo = null
        },
        addDateTo() {
            this.value.dateTo = todayStr()
            if (!this.value.fullDay) this.value.timeTo = nowStr()
        },
        submit() {
            if (this.type == 'deadline') {
                // #todo
                this.deadlineValue.title = this.value.title
            }
            else {
                this.value.isTodo = this.type == 'todo'
                if (!this.value.isTodo && this.value.dateTo && this.value.dateFrom && this.value.dateTo < this.value.dateFrom) {
                    this.$q.notify({
                        type: 'negative',
                        message: 'Invalid date range.',
                        timeout: 2500
                    })
                    return
                }
                if (this.value.isTodo) {
                    this.value.dateTo = null
                    this.value.timeTo = null
                }
                let event = {
                    ...this.value,
                    done: false // for todo
                }
                listUtil.addEvent(event).then(() => {
                    this.$store.commit('data/newEvent', true)
                    this.$emit('close')
                    this.clear()
                }).catch(err => {
                    console.error('addEvent error: ', err)
                })
            }
        },
        clear() {
            //reset to default
            this.value = {
                title: '',
                isTodo: true,
                fullDay: true,
                dateFrom: todayStr(),
                dateTo: null,
                timeFrom: null,
                timeTo: null,
                notes: ''
            }
            for (let i in this.inFocus) {
                this.inFocus[i] = false
            }
            this.currentActive = ''
        }
    }
}
</script>

<style lang="scss" scoped>
.text-input {
    font-size: 1rem;
}
.toggle-inactive .q-toggle__label {
    color: #616161;
}
.ne-tab-panel {
    padding: 14px 0 0 0;
}
.ne-row {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;

    .ne-icon {
        width: 42px;
        padding-top: 10px;
        display: flex;
        align-items: flex-start;
        justify-content: center;

        &.pd {
            padding-top: 14px;
        }
    }
    .ne-input {
        width: 100%;
    }
}
.ne-dash {
    font-size: 1.5rem;
}
.ne-date-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    column-gap: 10px;
}
</style>