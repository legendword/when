<template>
  <q-item
    :draggable="!item.multiDay"
    dense
    :class="'q-my-sm list-event' + (isDragging ? ' list-event-dragging' : '')"
    @mouseenter="hoverState(true)"
    @mouseleave="hoverState(false)"
  >
    <q-item-section side top>
      <q-checkbox
        class="list-checkbox"
        :value="item.done"
        @input="checkItem"
        v-if="item.isTodo"
        keep-color
        :style="categoryHelper.itemTextStyle(item)"
      />
      <div class="checkbox-placeholder flex items-center justify-center" v-else>
        <div
          class="list-dot"
          :style="categoryHelper.itemBackgroundStyle(item)"
        ></div>
      </div>
    </q-item-section>
    <q-item-section>
      <div
        :class="
          'list-title' + (item.isTodo && item.done ? ' strikethrough' : '')
        "
        :style="categoryHelper.itemTextStyle(item)"
      >
        <span>{{ item.title }}</span>
        <span v-if="!item.fullDay" class="list-time">{{ item.timeFrom }}</span>
      </div>
      <div
        :class="
          'list-notes' + (item.isTodo && item.done ? ' strikethrough' : '')
        "
      >
        {{ item.notes }}
      </div>
      <div class="list-notes" v-if="showDate && item.date != 'unassigned'">
        {{ hover ? item.dateFrom : dateAgo(item.dateFrom) }}
      </div>
    </q-item-section>

    <q-menu touch-position context-menu>
      <q-list dense style="min-width: 100px">
        <template v-if="isAssigned">
          <q-item clickable v-close-popup @click="$emit('move', -1)">
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
        <template v-if="!noReorder && !item.multiDay">
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
          <q-item-section class="text-negative">Delete Event</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script>
import listUtil from "src/util/list";
import { dateAgo } from "../util/date";
export default {
  name: "ListEvent",
  props: {
    item: {
      type: Object,
      required: true,
    },
    isAssigned: {
      type: Boolean,
    },
    noReorder: {
      type: Boolean,
      default: false,
    },
    showDate: {
      type: Boolean,
      default: false,
    },
    isDragging: {
      type: Boolean,
      default: false,
    },
    categoryHelper: {
      type: Object,
    },
  },
  data() {
    return {
      // checked: false,
      hover: false,
      dateAgo,
    };
  },
  methods: {
    hoverState(val) {
      this.hover = val;
    },
    checkItem(val) {
      listUtil.changeEventDone(this.item, val).then(() => {
        this.item.done = val;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.list-event {
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 300ms ease;

  &:hover {
    background-color: $grey-2;
  }
}
.list-time {
  color: $grey-7;
  margin-left: 8px;
}
.list-event-dragging {
  opacity: 0.5;
}
.checkbox-placeholder {
  width: 40px; /* smaller than 40px to allow text to be a bit to the left */
  height: 40px;
}
.list-title {
  font-size: 1rem;
  font-weight: 500;
}
.list-notes {
  font-size: 0.9rem;
  color: #616161;
}
.list-dot {
  border-radius: 10px;
  height: 10px;
  width: 10px;
}
</style>
