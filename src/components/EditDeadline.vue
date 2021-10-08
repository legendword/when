<template>
    <div class="q-py-md q-px-xl">
        <div class="full-width">
            <div class="q-mb-md">
                <q-input autofocus v-model="value.title" hide-bottom-space placeholder="Title" ref="title" input-class="text-input" />
            </div>
            <div class="q-my-md">
                <q-chip v-for="category in categories" :key="category.id" clickable :outline="value.category != category.id" :style="value.category != category.id ? {color: category.color} : {backgroundColor: category.color, color: textColor(category.color)}" @click="value.category = value.category == category.id ? null : category.id">
                    {{ category.name }}
                </q-chip>
            </div>
            <div class="ne-row">
                <div class="ne-icon">
                    <q-icon name="schedule" :color="(inFocus.date && (currentActive == 'dateFrom' || currentActive == 'timeFrom')) ? 'primary' : 'default'" size="20px" />
                </div>
                <div class="ne-input ne-date-wrapper">
                    <div style="width: 50px;">Starts </div>
                    <date-input v-model="value.dateFrom" @focus="dateFocus('dateFrom')" @blur="dateBlur('dateFrom')" />
                    <time-input v-model="value.timeFrom" @focus="dateFocus('timeFrom')" @blur="dateBlur('timeFrom')" />
                </div>
            </div>
            <div class="ne-row">
                <div class="ne-icon">
                    <q-icon name="alarm" :color="(inFocus.date && (currentActive == 'dateTo' || currentActive == 'timeTo')) ? 'primary' : 'default'" size="20px" />
                </div>
                <div class="ne-input ne-date-wrapper">
                    <div style="width: 50px;">Due </div>
                    <date-input v-model="value.dateTo" @focus="dateFocus('dateTo')" @blur="dateBlur('dateTo')" />
                    <time-input v-model="value.timeTo" @focus="dateFocus('timeTo')" @blur="dateBlur('timeTo')" />
                </div>
            </div>
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
import moment from 'moment'
import deadlinesUtil from '../util/deadlines'
import { textColor } from '../util/color'
import { nowStr, todayStr, tomorrowStr } from 'src/util/date'
export default {
    name: 'EditDeadline',
    props: {
        ddl: Object
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
            textColor,
            value: {
                dateFrom: todayStr(),
                dateTo: tomorrowStr(),
                timeFrom: nowStr(),
                timeTo: nowStr(),
                startDate: '', // calculated at submit()
                dueDate: '', // calculated at submit()
                progress: 0,
                completeDate: null
            },
            inFocus: {
                date: false,
                // notes: false
            },
            currentActive: ''
        }
    },
    mounted() {
        this.value = {...this.ddl}
    },
    methods: {
        dateFocus(val) {
            this.inFocus.date = true
            this.currentActive = val
        },
        dateBlur(val) {
            if (this.currentActive == val) this.inFocus.date = false
        },
        submit() {
            // #todo date validation
            let submitValue = {
                ...this.value,
                startDate: this.value.dateFrom + ' ' + this.value.timeFrom,
                dueDate: this.value.dateTo + ' ' + this.value.timeTo
            }
            deadlinesUtil.update(submitValue).then(() => {
                // console.log('deadline edit success')
                this.$emit('close')
            }).catch(err => {
                console.error('deadline edit error: ', err)
            })
        }
    }
}
</script>

<style lang="scss">
.text-input {
    font-size: 1rem;
}
.toggle-inactive .q-toggle__label {
    color: #616161;
}
</style>