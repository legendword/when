<template>
    <q-item draggable dense class="q-my-sm list-event">
        <q-item-section side top>
            <q-checkbox v-model="checked" v-if="item.isTodo" />
            <div class="checkbox-placeholder flex items-center justify-center" v-else>
                <q-icon name="event" size="sm" />
            </div>
        </q-item-section>
        <q-item-section>
            <div class="list-title">{{ item.title }}</div>
            <div class="list-notes">{{ item.notes }}</div>
        </q-item-section>
        
        <q-menu
            touch-position
            context-menu
        >
            <q-list dense style="min-width: 100px">
                <template v-if="isAssigned">
                    <q-item clickable v-close-popup :disable="isToday" @click="$emit('move', -1)">
                        <q-item-section>Move to Previous Day</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="$emit('move', 1)">
                        <q-item-section>Move to Next Day</q-item-section>
                    </q-item>
                </template>
                <template v-else>
                    <q-item clickable v-close-popup @click="$emit('assign', 'today')">
                        <q-item-section>Assign to Today</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="$emit('assign', 'tomorrow')">
                        <q-item-section>Assign to Tomorrow</q-item-section>
                    </q-item>
                </template>
                <q-separator />
                <template v-if="!noReorder">
                    <q-item clickable v-close-popup @click="$emit('reorder', -1)">
                        <q-item-section>Move Up</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="$emit('reorder', 1)">
                        <q-item-section>Move Down</q-item-section>
                    </q-item>
                </template>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('edit')">
                    <q-item-section class="text-primary">Edit Event</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('remove')">
                    <q-item-section class="text-negative">Remove Event</q-item-section>
                </q-item>
            </q-list>

        </q-menu>
    </q-item>
</template>

<script>
export default {
    name: 'ListEvent',
    props: {
        item: {
            type: Object,
            required: true
        },
        isAssigned: {
            type: Boolean
        },
        isToday: {
            type: Boolean
        },
        noReorder: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            checked: false
        }
    }
}
</script>

<style lang="scss">
.list-event {
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 300ms ease;

    &:hover {
        background-color: $grey-3;
    }
}
.checkbox-placeholder {
    width: 40px; /* smaller than 40px to allow text to be a bit to the left */
    height: 40px;
}
.list-title {
    font-size: 1rem;
}
.list-notes {
    font-size: 0.9rem;
    color: #616161;
}
</style>