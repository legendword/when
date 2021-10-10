<template>
    <div :class="'calendar-event text-subtitle2' + (active ? ' shadow-5' : '')"  :title="event.title + (!event.fullDay ? (' ' + event.timeFrom) : '')" :style="categoryHelper.calendarItemStyle(event)">
        <div :class="'event-title ellipsis' + (event.isTodo ? ' todo' : '') + ((event.isTodo && event.done) ? ' strikethrough' : '')">{{ event.title }}</div>
        <div v-if="!event.fullDay" class="event-time text-grey-7">{{ event.timeFrom }}</div>

        <q-popup-proxy @before-show="$emit('setActive')" @before-hide="$emit('removeActive')">
            <q-card style="min-width: 400px;">
                <q-bar class="q-pl-md" :style="categoryHelper.itemBackgroundStyle(event)">
                    <div class="text-body2 text-weight-medium">{{ event.isTodo ? 'Todo' : 'Event' }}</div>
                    <q-space />
                    <q-btn @click="$emit('confirmRemove')" dense flat icon="delete" />
                    <q-btn @click="$emit('edit')" dense flat icon="edit" v-close-popup />
                    <q-btn dense flat icon="close" v-close-popup />
                </q-bar>
                <q-card-section>
                    <div class="text-h6 calendar-popup-title">
                        <div>{{ event.title }}</div>
                        <div>
                            <q-chip v-if="event.category != null" :style="categoryHelper.itemBackgroundStyle(event)">{{ categoryHelper.categoryName[event.category] }}</q-chip>
                        </div>
                    </div>
                    <template v-if="event.dateTo && event.dateTo != event.dateFrom"> <!-- multi-day events -->
                        <div class="text-body2">
                            <span style="display: inline-block; width: 42px;">From </span>
                            <span>{{ humanWeekDate(event.dateFrom) }}</span>
                            <span v-if="!event.fullDay" class="text-grey-7"> {{ event.timeFrom }}</span>
                        </div>
                        <div class="text-body2">
                            <span style="display: inline-block; width: 42px;">To </span>
                            <span>{{ humanWeekDate(event.dateTo) }}</span>
                            <span v-if="!event.fullDay" class="text-grey-7"> {{ event.timeTo }}</span>
                        </div>
                    </template>
                    <div class="text-body2" v-else>
                        <span>{{ humanWeekDate(event.dateFrom) }}</span>
                        <span v-if="!event.fullDay" class="text-grey-7"> {{ event.timeFrom }}</span>
                        <span v-if="!event.fullDay && event.dateTo" class="text-grey-7"> - {{ event.timeTo }}</span>
                    </div>
                    <div class="q-mt-md event-notes" v-if="event.notes.length > 0">{{ event.notes }}</div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right" v-if="event.type == 'todo'">
                    <q-btn v-if="event.done" flat label="Mark Uncomplete" no-caps class="text-grey-7 text-subtitle2" @click="$emit('done', false)" />
                    <q-btn v-else flat label="Mark Completed" no-caps class="text-grey-7 text-subtitle2" @click="$emit('done', true)"  />
                </q-card-actions>
            </q-card>
        </q-popup-proxy>

        <q-menu touch-position context-menu>
            <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup @click="$emit('move', -1)">
                    <q-item-section>Move to Previous Day</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('move', 1)">
                    <q-item-section>Move to Next Day</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('reorder', -1)">
                    <q-item-section>Move Up</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('reorder', 1)">
                    <q-item-section>Move Down</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('edit')">
                    <q-item-section class="text-primary">Edit Event</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('remove')">
                    <q-item-section class="text-negative">Delete Event</q-item-section>
                </q-item>
            </q-list>
        </q-menu>
    </div>
</template>

<script>
import { humanWeekDate } from 'src/util/date'
export default {
    name: 'CalendarEvent',
    props: ['event', 'categoryHelper', 'active'],
    data() {
        return {
            humanWeekDate
        }
    }
}
</script>

<style lang="scss">
.calendar-popup-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
</style>