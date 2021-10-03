<template>
    <div class="q-py-lg q-px-xl">
        <div class="full-width">
            <div class="q-mb-md">
                <q-input autofocus v-model="value.title" hide-bottom-space placeholder="Title" ref="title" input-class="text-input" />
            </div>
            <div class="q-my-md">
                <q-chip v-for="category in categories" :key="category.id" clickable :outline="value.category != category.id" :style="value.category != category.id ? {color: category.color} : {backgroundColor: category.color, color: textColor(category.color)}" @click="value.category = value.category == category.id ? null : category.id">
                    {{ category.name }}
                </q-chip>
            </div>
            <q-tabs v-model="type" dense class="text-grey" :active-color="type" :indicator-color="type" align="left">
                <q-tab name="event" label="Event" />
                <q-tab name="todo" label="Todo" />
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
            </q-tab-panels>

            <div class="q-mt-lg q-mb-md">
                <q-btn color="primary" unelevated label="Done" @click="submit" />
                <q-btn color="grey" flat label="Cancel" @click="$emit('close')" class="q-ml-sm" />
            </div>
        </div>
    </div>
</template>

<script>
import DateInput from './DateInput.vue'
import TimeInput from './TimeInput.vue'
import listUtil from '../util/list'
import { textColor } from '../util/color'
export default {
    name: 'EditEvent',
    props: {
        show: Boolean,
        event: Object
    },
    components: {
        DateInput,
        TimeInput
    },
    computed: {
        categories() {
            return this.$store.state.data.categories;
        }
    },
    data() {
        return {
            type: 'event',
            textColor,
            value: {
                title: '',
                category: null,
                isTodo: false,
                fullDay: true,
                dateFrom: null,
                dateTo: null,
                timeFrom: null,
                timeTo: null,
                notes: ''
            },
            valueInitialized: false,
            inFocus: {
                date: false,
                notes: false
            },
            currentActive: ''
        }
    },
    mounted() {
        this.value = {...this.event};
        this.type = this.value.isTodo ? 'todo' : 'event';
        this.valueInitialized = true;
        this.$refs.title.focus();
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
            this.value.isTodo = this.type == 'todo'
            if (this.value.isTodo) {
                this.value.dateTo = null
                this.value.timeTo = null
            }
            listUtil.editEvent(this.event, this.value).then(() => {
                console.log('editEvent success')
                this.$store.commit('data/change')
                this.$emit('close')
            }).catch(err => {
                console.error('editEvent error: ', err)
            })
        }
    }
}
</script>

<style lang="scss">
/* style is the same as NewEvent.vue */
</style>