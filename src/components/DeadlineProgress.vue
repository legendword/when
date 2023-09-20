<template>
    <div class="deadline-progress" v-touch-pan.horizontal.prevent.mouse="handlePan" @click="handleClick" ref="container">
        <q-linear-progress rounded size="40px" :value="value" :color="(completed?'positive':(behind?'warning':'primary'))" track-color="grey-3" class="progress-progress" />
        <q-linear-progress rounded size="40px" :value="timeValue" color="grey-5" track-color="transparent" class="time-progress progress-overlay" />
        <svg height="45" width="10" class="pointer pointer-time" :style="{left: (timePointer - 5) + 'px'}">
            <path d="M 0 0 L 5 5 L 10 0 L 0 0 M 4 4 L 4 45 L 6 45 L 6 4 Z" />
        </svg>
        <div class="pointer-text pointer-text-time column justify-center text-center" :style="{left: (timePointer - 35) + 'px'}">
            <div>Time</div>
            <div>{{ formatPercentage(timeValue) }}</div>
        </div>
        <svg height="45" width="10" :class="'pointer pointer-progress' + (completed?' completed':(behind?' behind':''))" :style="{left: (progressPointer - 5) + 'px'}">
            <path d="M 0 45 L 5 40 L 10 45 L 0 45 M 4 0 L 4 41 L 5 40 L 6 41 L 6 0 Z" />
        </svg>
        <div :class="'pointer-text pointer-text-progress column justify-center text-center' + (completed?' completed':(behind?' behind':''))" :style="{left: (progressPointer - 35) + 'px'}">
            <div>{{ formatPercentage(value) }}</div>
            <div>Progress</div>
        </div>
    </div>
</template>

<script>
const formatPercentage = function(val) {
    return Math.round(val * 100) + '%'
}
export default {
    name: 'DeadlineProgress',
    props: {
        value: {
            type: Number,
            required: true,
            default: 0
        },
        timeValue: {
            type: Number,
            default: 0
        },
        completed: Boolean
    },
    data() {
        return {
            progressPointer: 0,
            timePointer: 0,
            formatPercentage
        }
    },
    watch: {
        timeValue(val) {
            let { width } = this.$refs.container.getBoundingClientRect() 
            this.timePointer = val * width
        },
        value(val) {
            let { width } = this.$refs.container.getBoundingClientRect() 
            this.progressPointer = val * width
        }
    },
    computed: {
        behind() { //whether progress is behind time
            return this.timeValue > this.value
        }
    },
    methods: {
        updateValue(offsetX) {
            //console.log(val)
            let { x, width } = this.$refs.container.getBoundingClientRect() 
            offsetX = Math.min(Math.max(0, offsetX - x), width)
            let val = offsetX / width
            //this.progressPointer = offsetX
            this.$emit('input', val)
        },
        handlePan(d) {
            // disabling pan due to its high rate of fire and thus frequent idb operations
            // can be enabled again after adding a debounce (todo)

            // if (this.completed) return
            // this.updateValue(d.position.left)
        },
        handleClick(e) {
            if (this.completed) return
            this.updateValue(e.clientX)
        },
        resizeHandler() {
            let { width } = this.$refs.container.getBoundingClientRect() 
            this.progressPointer = this.value * width
            this.timePointer = this.timeValue * width
        }
    },
    mounted() {
        let { width } = this.$refs.container.getBoundingClientRect() 
        this.progressPointer = this.value * width
        this.timePointer = this.timeValue * width
        window.addEventListener('resize', this.resizeHandler)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeHandler)
    }
}
</script>

<style lang="scss">
.deadline-progress {
    position: relative;
    cursor: grab;
    height: 40px;
    margin-top: 60px;
    margin-bottom: 60px;

    .progress-progress {
        border: 1px solid $grey-5;
    }

    .time-progress {
        opacity: 0.5;
    }

    .progress-overlay {
        position: absolute;
        top: 0;
    }

    .pointer {
        position: absolute;
        left: -5px;
        transition: left 0.3s;

        &.pointer-time {
            top: -5px;
            path {
                fill: $grey-5;
            }
        }
        &.pointer-progress {
            top: 0;
            path {
                fill: $primary;
            }
            &.behind {
                path {
                    fill: $warning !important;
                }
            }
            &.completed {
                path {
                    fill: $positive !important;
                }
            }
        }
    }

    .pointer-text {
        position: absolute;
        left: -35px;
        transition: left 0.3s;
        width: 70px;
        height: 55px;

        &.pointer-text-time {
            top: -60px;
            color: $grey-7;
        }
        &.pointer-text-progress {
            top: 45px;
            color: $primary;
            &.behind {
                color: $warning !important;
            }
            &.completed {
                color: $positive !important;
            }
        }
    }
}
</style>