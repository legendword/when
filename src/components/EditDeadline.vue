<template>
    <div class="q-py-md q-px-xl">
        <div class="q-my-md text-h4">Edit Deadline</div>
        <div class="full-width">
            <div class="q-mb-lg">
                <q-input v-model="value.title" label="Title" ref="title" input-class="text-input" />
            </div>
            <div class="q-mb-md">
                <date-time-input v-model="value.startDate" label="Start Date" :date-only="false" @focus="dateFocus('startDate')" @blur="inFocus.dateFrom = false" ref="startDate" />
            </div>
            <div class="q-mb-md">
                <date-time-input v-model="value.dueDate" label="Due Date" :date-only="false" @focus="dateFocus('dueDate')" @blur="inFocus.dateTo = false" ref="dueDate" />
            </div>
            <div class="q-my-lg">
                <q-btn color="primary" unelevated label="Save" class="full-width" @click="submit" />
            </div>
        </div>
    </div>
</template>

<script>
import DateTimeInput from './DateTimeInput.vue'
import moment from 'moment'
import deadlinesUtil from '../util/deadlines'
export default {
    name: 'EditDeadline',
    props: {
        ddl: Object
    },
    components: {
        DateTimeInput
    },
    data() {
        return {
            value: {
                title: '',
                startDate: moment().format('YYYY-MM-DD HH:mm'),
                dueDate: moment().add(1, 'day').format('YYYY-MM-DD HH:mm'),
                progress: 0,
                completeDate: null
            },
            inFocus: {
                //notes: false,
                startDate: false,
                dueDate: false
            }
        }
    },
    mounted() {
        this.value = {...this.ddl}
        this.$refs.title.focus()
    },
    methods: {
        goFocus(name) {
            if (this.$refs[name]) {
                this.$refs[name].focus()
                for (let i of ['startDate', 'dueDate']) {
                    if (this.inFocus[i]) {
                        this.$refs[i].toggleActive()
                    }
                }
            }
        },
        dateFocus(name) {
            this.inFocus[name] = true
            for (let i of ['startDate', 'dueDate']) {
                if (i != name && this.inFocus[i]) {
                    this.$refs[i].toggleActive()
                }
            }
        },
        submit() {
            deadlinesUtil.update(this.value).then(() => {
                console.log('deadline edit success')
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