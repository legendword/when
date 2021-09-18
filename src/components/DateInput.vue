<template>
    <div>
        <q-input class="date-input-wrapper" input-class="date-input" :value="value" @input="valueChange" @focus="toggleActive(true)" @blur="toggleActive(false)" ref="input">
            <q-popup-proxy no-parent-event v-model="popup">
                <q-card>
                    <q-date :value="value" @input="valueChange" mask="YYYY-MM-DD" color="primary" today-btn minimal no-unset />
                </q-card>
            </q-popup-proxy>
        </q-input>
    </div>
</template>

<script>
export default {
    name: 'DateInput',
    props: ['value'],
    data() {
        return {
            active: false,
            popup: false
        }
    },
    methods: {
        toggleActive(val) {
            this.active = val
            this.$emit(this.active ? 'focus' : 'blur')
            if (val) {
                this.popup = true
                this.$refs.input.select()
            }
        },
        valueChange(val) {
            console.log('valueChange', val)
            this.$emit('input', val)
        }
    }
}
</script>

<style lang="scss">
.date-input {
    width: 90px;
    text-align: center;
}
</style>