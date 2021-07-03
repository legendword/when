<template>
    <div>
        <q-input borderless :value="value" :label="label" readonly input-class="cursor-pointer" :label-color="active ? 'primary' : 'default'" @click="toggleActive()">
            <template v-slot:before>
                <q-btn :color="active ? 'primary' : 'default'" round flat icon="event" @click="toggleActive()" />
            </template>
        </q-input>
        <q-slide-transition>
            <div v-show="active" class="q-pl-xl">
                <div class="q-my-sm row items-center">
                    <div v-for="(info, name) in dateComponentInfo" :key="name" class="row items-center">
                        <div v-if="info.prepend">
                            {{'&nbsp;' + info.prepend + '&nbsp;'}}
                        </div>
                        <q-input outlined dense :value="dateComponents[name]" :maxlength="info.len" :style="{width: name == 'year' ? '4rem' : '2.5rem'}" input-class="text-center" @focus="selectAll(info.id)" @input="updateValue(name, $event)" debounce="1000" ref="dateInputs" />
                    </div>
                </div>
                <div class="q-mb-md q-gutter-md row items-start">
                    <q-date :value="value" @input="valueChange" :mask="mask" color="primary" today-btn />
                    <q-time v-if="!dateOnly" :value="value" @input="valueChange" :mask="mask" color="primary" now-btn />
                </div>
            </div>
        </q-slide-transition>
    </div>
</template>

<script>
const dateComponentInfo = {
    year: {
        id: 0,
        pos: 0,
        len: 4,
        isValid: val => val.length == 4
    },
    month: {
        id: 1,
        pos: 5,
        len: 2,
        isValid: val => val.length > 0 && val >= 1 && val <= 12,
        prepend: '-'
    },
    day: {
        id: 2,
        pos: 8,
        len: 2,
        isValid: val => val.length > 0 && val >= 1 && val <= 31,
        prepend: '-'
    }
}
const dateTimeComponentInfo = {
    year: {
        id: 0,
        pos: 0,
        len: 4,
        isValid: val => val.length == 4
    },
    month: {
        id: 1,
        pos: 5,
        len: 2,
        isValid: val => val.length > 0 && val >= 1 && val <= 12,
        prepend: '-'
    },
    day: {
        id: 2,
        pos: 8,
        len: 2,
        isValid: val => val.length > 0 && val >= 1 && val <= 31,
        prepend: '-'
    },
    hour: {
        id: 3,
        pos: 11,
        len: 2,
        isValid: val => val.length > 0 && val >= 0 && val <= 23,
        prepend: ' '
    },
    minute: {
        id: 4,
        pos: 14,
        len: 2,
        isValid: val => val.length > 0 && val >= 0 && val <= 59,
        prepend: ':'
    }
}
export default {
    name: 'DateTimeInput',
    props: ['value', 'dateOnly', 'label'],
    data() {
        return {
            active: false
        }
    },
    computed: {
        mask() {
            return this.dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'
        },
        dateComponentInfo() {
            return this.dateOnly ? dateComponentInfo : dateTimeComponentInfo
        },
        dateComponents() { //YYYY-MM-DD HH:mm
            let dateStr = this.value
            if (!dateStr) {
                return { year: '', month: '', day: '', hour: '', minute: '' }
            }
            else { //position also stored in const dateComponentPos
                return { year: dateStr.substr(0, 4), month: dateStr.substr(5, 2), day: dateStr.substr(8, 2), hour: dateStr.substr(11, 2), minute: dateStr.substr(14, 2) }
            }
        }
    },
    methods: {
        toggleActive() {
            this.active = !this.active
            this.$emit(this.active ? 'focus' : 'blur')
        },
        valueChange(val) {
            console.log(val)
            this.$emit('input', val)
        },
        selectAll(id) {
            if (this.$refs.dateInputs[id]) this.$refs.dateInputs[id].select()
        },
        updateValue(name, val) {
            console.log('updateValue', name, val)
            let info = dateComponentInfo[name]
            if (info.isValid(val)) {
                let newStr = val.toString()
                if (val < 10) newStr = '0' + newStr
                let newVal = this.value.substr(0, info.pos) + newStr + this.value.substr(info.pos + info.len)
                this.$emit('input', newVal)
            }
        }
    }
}
</script>

<style>

</style>