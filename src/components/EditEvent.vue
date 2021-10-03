<template>
    <div class="q-py-md q-px-xl">
        <div class="q-my-md text-h4">Edit Event</div>
        <div class="full-width">
            <div class="q-mb-lg">
                <q-input v-model="value.title" label="Title" ref="title" input-class="text-input" />
            </div>
            <div class="q-mb-md row q-gutter-md">
                <q-toggle v-model="value.isTodo" label="Todo" :class="value.isTodo ? 'toggle-active' : 'toggle-inactive'" />
                <q-toggle v-model="value.fullDay" label="Full Day" :class="value.fullDay ? 'toggle-active' : 'toggle-inactive'" />
            </div>
            <template v-if="valueInitialized">
                <div class="q-mb-md">
                    <date-time-input :date-only="value.fullDay" v-model="value.dateFrom" :label="value.isTodo ? 'Date' : 'From'" @focus="dateFocus('dateFrom')" @blur="inFocus.dateFrom = false" ref="dateFrom" />
                </div>
                <div class="q-mb-md" v-show="!value.isTodo">
                    <date-time-input :date-only="value.fullDay" v-model="value.dateTo" label="To" @focus="dateFocus('dateTo')" @blur="inFocus.dateTo = false" ref="dateTo" />
                </div>
            </template>
            
            <div class="q-mb-md">
                <q-input borderless v-model="value.notes" label="Notes" autogrow @focus="inFocus.notes = true" @blur="inFocus.notes = false" ref="notes">
                    <template v-slot:before>
                        <q-btn :color="inFocus.notes ? 'primary' : 'default'" round flat icon="notes" @click="goFocus('notes')" />
                    </template>
                </q-input>
            </div>
            <div class="q-my-lg">
                <q-btn color="primary" unelevated label="Save Changes" class="full-width" @click="submit" />
            </div>
        </div>
    </div>
</template>

<script>
import DateTimeInput from './DateTimeInput.vue'
import listUtil from '../util/list'
export default {
    name: 'EditEvent',
    props: {
        show: Boolean,
        event: Object
    },
    components: {
        DateTimeInput
    },
    data() {
        return {
            value: {
                title: '',
                isTodo: true,
                fullDay: true,
                dateFrom: null,
                dateTo: null,
                notes: ''
            },
            valueInitialized: false,
            inFocus: {
                notes: false,
                dateFrom: false,
                dateTo: false
            }
        }
    },
    mounted() {
        this.value = {...this.event}
        this.valueInitialized = true
        this.$refs.title.focus()
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
.text-input {
    font-size: 1rem;
}
.toggle-inactive .q-toggle__label {
    color: #616161;
}
</style>