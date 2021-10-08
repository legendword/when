<template>
    <div class="month-switcher">
        <q-btn class="today-btn" label="Today" flat no-caps @click="today" />
        <q-btn icon="chevron_left" round dense flat @click="change(-1)" />
        <div class="text-subtitle2 month-switcher-value">
            {{ monthDisplay }}
        </div>
        <q-btn icon="chevron_right" round dense flat @click="change(1)" />
    </div>
</template>

<script>
import { offsetMonth, readableMonth, thisMonth } from 'src/util/date'
export default {
    name: 'MonthSwitcher',
    data() {
        return {
            monthDisplay: ''
        }
    },
    methods: {
        today() {
            let newMonth = thisMonth()
            this.$store.commit('data/changeMonth', newMonth)
        },
        change(offset) {
            let newMonth = offsetMonth(this.currentMonth, offset)
            this.$store.commit('data/changeMonth', newMonth)
        }
    },
    watch: {
        currentMonth(val) {
            this.monthDisplay = readableMonth(val)
        }
    },
    computed: {
        currentMonth() {
            return this.$store.state.data.currentMonth
        }
    },
    created() {
        if (this.currentMonth == '') {
            this.$store.commit('data/changeMonth', thisMonth())
        }
    }
}
</script>

<style>
.month-switcher {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 10px;
}
.month-switcher-value {
    height: 50px;
    line-height: 50px;
    margin: 0 10px;
}
.today-btn {
    margin-right: 10px;
}
</style>