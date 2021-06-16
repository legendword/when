<template>
    <div class="q-py-lg q-px-xl">
        <div class="q-my-md text-h4">New Event</div>
        <div class="full-width">
            <div class="q-mb-lg">
                <q-input v-model="title" label="Title" ref="title" input-class="text-input" />
            </div>
            <div class="q-mb-md row q-gutter-md">
                <q-toggle v-model="isTodo" label="Todo" :class="isTodo ? 'toggle-active' : 'toggle-inactive'" />
                <q-toggle v-model="fullDay" label="Full Day" :class="fullDay ? 'toggle-active' : 'toggle-inactive'" />
            </div>
            <div class="q-mb-md">
                <date-time-input v-model="dateFrom" :label="isTodo ? 'Date' : 'From'" :date-only="fullDay" @focus="dateFocus('dateFrom')" @blur="inFocus.dateFrom = false" ref="dateFrom" />
            </div>
            <div class="q-mb-md" v-show="!isTodo">
                <date-time-input v-model="dateTo" label="To" :date-only="fullDay" @focus="dateFocus('dateTo')" @blur="inFocus.dateTo = false" ref="dateTo" />
            </div>
            <div class="q-mb-md">
                <q-input borderless v-model="notes" label="Notes" autogrow @focus="inFocus.notes = true" @blur="inFocus.notes = false" ref="notes">
                    <template v-slot:before>
                        <q-btn :color="inFocus.notes ? 'primary' : 'default'" round flat icon="notes" @click="goFocus('notes')" />
                    </template>
                </q-input>
            </div>
            <div class="q-my-lg">
                <q-btn color="primary" unelevated label="Add Event" class="full-width" @click="submit" />
            </div>
        </div>
    </div>
</template>

<script>
import DateTimeInput from '../components/DateTimeInput.vue'
import listUtil from '../util/list'
export default {
    name: 'NewEvent',
    props: {
        show: Boolean
    },
    components: {
        DateTimeInput
    },
    data() {
        return {
            title: '',
            isTodo: true,
            fullDay: false,
            dateFrom: null,
            dateTo: null,
            notes: '',
            inFocus: {
                notes: false,
                dateFrom: false,
                dateTo: false
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.$refs.title.focus()
            }
        }
    },
    methods: {
        goFocus(name) {
            if (this.$refs[name]) {
                this.$refs[name].focus()
                for (let i of ['dateFrom', 'dateTo']) {
                    if (this.inFocus[i]) {
                        this.$refs[i].toggleActive()
                    }
                }
            }
        },
        dateFocus(name) {
            this.inFocus[name] = true
            for (let i of ['dateFrom', 'dateTo']) {
                if (i != name && this.inFocus[i]) {
                    this.$refs[i].toggleActive()
                }
            }
        },
        submit() {
            let event = {};
            for (let i of ['title', 'isTodo', 'fullDay', 'dateFrom', 'dateTo', 'notes']) {
                event[i] = this[i]
            }
            listUtil.addEvent(event).then(() => {
                console.log('addEvent success')
                this.$store.commit('data/newEvent', true)
                this.$emit('close')
            }).catch(err => {
                console.error('addEvent error: ', err)
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