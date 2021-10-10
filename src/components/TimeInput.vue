<template>
    <div>
        <q-input class="time-input-wrapper" input-class="time-input" :value="value" @input="valueChange" @focus="toggleActive(true)" @blur="toggleActive(false)" ref="input" :error="error" hide-bottom-space>
            <q-popup-proxy no-parent-event v-model="popup">
                <q-card>
                    <q-time :value="value" @input="valueChange" mask="HH:mm" color="primary" format24h landscape />
                </q-card>
            </q-popup-proxy>
            <template v-slot:append v-if="removeBtn">
                <q-btn @click="$emit('remove')" icon="close" flat dense round size="12px" />
            </template>
        </q-input>
    </div>
</template>

<script>
import { validateTime } from 'src/util/date';
export default {
    name: 'TimeInput',
    props: ['value', 'removeBtn'],
    data() {
        return {
            active: false,
            popup: false,
            error: false
        }
    },
    methods: {
        validate() { // exposed to parent component for validation
            let valid = this.value.length == 5 && this.value[2] == ':' && validateTime(this.value);
            this.error = !valid;
            return valid;
        },
        toggleActive(val) {
            this.active = val
            this.$emit(this.active ? 'focus' : 'blur')
            if (val) {
                this.popup = true
                this.$refs.input.select()
            }
        },
        valueChange(val) {
            // console.log('valueChange', val)
            this.$emit('input', val)
        }
    }
}
</script>

<style lang="scss">
.time-input {
    width: 50px;
    text-align: center;
}
</style>