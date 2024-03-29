<template>
  <q-page class="q-px-md q-pb-lg">
    <q-list>
      <div v-if="unassigned.length > 0">
        <list-header color="black"> Unassigned </list-header>

        <list-event
          v-for="item in unassigned"
          :key="item.id"
          :item="item"
          :is-dragging="drag.active && drag.event.id == item.id"
          @edit="editEvent(item)"
          @remove="removeEvent(item)"
          @assign="assignEvent(item, $event)"
          @reorder="reOrderEvent(item, $event)"
          @dragstart.native="dragStart(item, 'unassigned', null)"
          @dragover.native="dragOver($event)"
          @drop.native="drop($event)"
          @dragenter.native="dragEnter(item, 'unassigned', null)"
          @dragleave.native="dragLeave()"
          @dragend.native="dragEnd()"
          :categoryHelper="categoryHelper"
        />

        <q-separator />
      </div>

      <div v-if="pastDue.length > 0" class="q-py-sm">
        <list-header color="black"> Past Due </list-header>

        <list-event
          v-for="item in pastDue"
          :key="item.id"
          :item="item"
          @edit="editEvent(item)"
          @remove="removeEvent(item)"
          @assign="assignEvent(item, $event)"
          no-reorder
          show-date
          :is-dragging="drag.active && drag.event.id == item.id"
          @dragstart.native="dragStart(item, 'pastDue', null)"
          @drop.native="drop($event)"
          @dragend.native="dragEnd()"
          :categoryHelper="categoryHelper"
        />

        <q-separator />
      </div>

      <div v-for="(day, dayInd) in closeDays" :key="day.date">
        <list-header
          color="black"
          @dragover.native="dragOver($event)"
          @dragenter.native="dragEnter(0, 'closeDays', dayInd)"
          @drop.native="drop($event)"
        >
          {{ day.displayDate }}

          <template v-slot:side>
            {{ day.date.substr(8, 2) }}
          </template>
        </list-header>

        <list-event
          v-for="item in day.events"
          :key="item.id"
          :item="item"
          is-assigned
          @edit="editEvent(item)"
          @remove="removeEvent(item)"
          @move="moveEvent(item, $event)"
          @reorder="reOrderEvent(item, $event)"
          :is-dragging="drag.active && drag.event.id == item.id"
          @dragstart.native="dragStart(item, 'closeDays', dayInd)"
          @dragover.native="dragOver($event)"
          @drop.native="drop($event)"
          @dragenter.native="dragEnter(item, 'closeDays', dayInd)"
          @dragleave.native="dragLeave()"
          @dragend.native="dragEnd()"
          :categoryHelper="categoryHelper"
        />

        <q-item v-if="day.events.length == 0">
          <q-item-section side>
            <div class="checkbox-placeholder"></div>
          </q-item-section>
          <q-item-section>
            <div class="text-subtitle2 text-grey-8">No events.</div>
          </q-item-section>
        </q-item>

        <q-separator
          v-if="days.length != 0 || dayInd != closeDays.length - 1"
        />
      </div>

      <div v-for="(day, dayInd) in days" :key="day.date">
        <list-header
          color="black"
          @dragover.native="dragOver($event)"
          @dragenter.native="dragEnter(0, 'closeDays', dayInd)"
          @drop.native="drop($event)"
        >
          {{ humanDate(day.date) }}
        </list-header>

        <list-event
          v-for="item in day.events"
          :key="item.id"
          :item="item"
          isAssigned
          @edit="editEvent(item)"
          @remove="removeEvent(item)"
          @move="moveEvent(item, $event)"
          @reorder="reOrderEvent(item, $event)"
          :is-dragging="drag.active && drag.event.id == item.id"
          @dragstart.native="dragStart(item, 'days', dayInd)"
          @dragover.native="dragOver($event)"
          @drop.native="drop($event)"
          @dragenter.native="dragEnter(item, 'days', dayInd)"
          @dragleave.native="dragLeave()"
          @dragend.native="dragEnd()"
          :categoryHelper="categoryHelper"
        />

        <q-separator v-if="dayInd != days.length - 1" />
      </div>
    </q-list>
    <!--
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="newEventDialog = true" />
        </q-page-sticky>
        -->
    <q-dialog v-model="editEventDialog">
      <q-card style="width: 700px; max-width: 95vw">
        <edit-event
          :event="editEventObj"
          :show="editEventDialog"
          @close="editEventDialog = false"
        />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import EditEvent from "../components/EditEvent.vue";
import ListEvent from "../components/ListEvent.vue";
import ListHeader from "../components/ListHeader.vue";
import listUtil from "../util/list";
import { arrayMove, arrayTransfer } from "../util/array";
import moment from "moment";
import {
  datecmp,
  offsetDate,
  humanDate,
  todayStr,
  tomorrowStr,
} from "src/util/date";
import categoryUtil from "src/util/category";
import CategoryHelper from "src/util/CategoryHelper";
//import { mapState } from 'vuex'
export default {
  name: "List",
  components: {
    ListEvent,
    ListHeader,
    EditEvent,
  },
  data() {
    return {
      list: [],
      unassigned: [],
      pastDue: [],
      closeDays: [],
      days: [],
      today: todayStr(),
      tomorrow: tomorrowStr(),
      humanDate,
      editEventDialog: false,
      editEventObj: {},
      drag: {
        active: false,
        event: null,
        originalSection: null,
        originalSubsection: null,
        originalIndex: null,
        currentSection: null,
        currentSubsection: null,
        currentIndex: null,
        hover: null,
      },
      categoryHelper: new CategoryHelper(),
      categories: [],
    };
  },
  methods: {
    drop(e) {
      e.preventDefault();
      let {
        currentSection,
        originalSection,
        currentSubsection,
        originalSubsection,
        currentIndex,
        originalIndex,
      } = this.drag;
      // console.log('drop', currentSection, originalSection, currentSubsection, originalSubsection, currentIndex, originalIndex)
      if (currentSection == "pastDue") {
        this.dragEnd();
        this.sortList();
        return;
      }
      if (
        currentSection == originalSection &&
        currentSubsection == originalSubsection
      ) {
        if (currentIndex == originalIndex) {
          this.dragEnd();
          return; //nothing to do here
        }
        // console.log('drop: reOrderEvent')
        listUtil
          .reOrderEvent(this.drag.event, currentIndex - originalIndex)
          .then(() => {
            this.loadList();
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        if (currentSection == "unassigned") {
          //currently does not support unassigning events
          //may be added in a future release
          this.dragEnd();
          this.sortList();
          return;
        }
        let targetDate =
          currentSubsection == null
            ? currentSection
            : this[currentSection][currentSubsection].date;
        if (this.drag.event.date == "unassigned") {
          // console.log('drop: assignEvent', targetDate)
          listUtil
            .assignEvent(this.drag.event, targetDate, currentIndex)
            .then(() => {
              this.loadList();
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          // console.log('drop: moveEvent', targetDate)
          listUtil
            .moveEvent(this.drag.event, targetDate, currentIndex)
            .then(() => {
              this.loadList();
            })
            .catch((err) => {
              console.error(err);
            });
        }
      }
      this.dragEnd();
    },
    dragEnter(evt, section, subsection) {
      // console.log('dragEnter', evt === 0 ? evt : evt.title, section, subsection)
      if (!this.drag.event) return;
      if (evt === 0) {
        this.drag.hover = null;
        let cursec = this.drag.currentSection;
        let cursub = this.drag.currentSubsection;
        if (cursec == section && cursub == subsection) {
          let arr =
            subsection == null
              ? this[section]
              : this[section][subsection].events;
          arrayMove(arr, this.drag.currentIndex, 0);
        } else {
          let oldArr =
            cursub == null ? this[cursec] : this[cursec][cursub].events;
          let newArr =
            subsection == null
              ? this[section]
              : this[section][subsection].events;
          // console.log('dragEnter!', oldArr, newArr, this.drag.currentIndex)

          arrayTransfer(oldArr, newArr, this.drag.currentIndex, 0);
          this.drag.currentSection = section;
          this.drag.currentSubsection = subsection;
        }
        this.drag.currentIndex = 0;
      } else if (evt.id == this.drag.event.id) return;
      else if (this.drag.hover != evt.id) {
        this.drag.hover = evt.id;
        let cursec = this.drag.currentSection;
        let cursub = this.drag.currentSubsection;
        if (cursec == section) {
          let arr =
            subsection == null
              ? this[section]
              : this[section][subsection].events;
          let newIndex = arr.findIndex((v) => v.id == evt.id);
          arrayMove(arr, this.drag.currentIndex, newIndex);
          this.drag.currentIndex = newIndex;
        } else {
          let oldArr =
            cursub == null ? this[cursec] : this[cursec][cursub].events;
          let newArr =
            subsection == null
              ? this[section]
              : this[section][subsection].events;
          let newIndex = newArr.findIndex((v) => v.id == evt.id);
          arrayTransfer(oldArr, newArr, this.drag.currentIndex, newIndex);
          this.drag.currentSection = section;
          this.drag.currentSubsection = subsection;
          this.drag.currentIndex = newIndex;
        }
      }
    },
    dragLeave() {
      this.drag.hover = null;
    },
    dragOver(e) {
      e.preventDefault();
    },
    dragEnd() {
      // console.log('dragEnd')
      this.drag.active = false;
      //this.drag.event = null
      //this.sortList()
    },
    dragStart(evt, section, subsection) {
      // console.log('dragStart', evt.title)
      this.drag.active = true;
      this.drag.event = evt;
      this.drag.currentSection = section;
      this.drag.currentSubsection = subsection;
      let arr =
        subsection == null ? this[section] : this[section][subsection].events;
      let ind = arr.findIndex((v) => v.id == evt.id);
      this.drag.currentIndex = ind;
      this.drag.originalSection = section;
      this.drag.originalSubsection = subsection;
      this.drag.originalIndex = ind;
    },
    editEvent(evt) {
      this.editEventObj = evt;
      this.editEventDialog = true;
    },
    reOrderEvent(evt, offset) {
      listUtil
        .reOrderEvent(evt, offset)
        .then(() => {
          this.loadList();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    moveEvent(evt, dayOffset) {
      // console.log(evt, dayOffset, dest)
      listUtil
        .moveEvent(evt, dayOffset)
        .then(() => {
          this.loadList();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    assignEvent(evt, day) {
      // console.log(evt, day)
      let dt = day == "today" ? this.today : this.tomorrow;
      listUtil
        .assignEvent(evt, dt)
        .then(() => {
          this.loadList();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    removeEvent(evt) {
      listUtil
        .deleteEvent(evt)
        .then(() => {
          this.$store.commit("data/change");
        })
        .catch((err) => {
          console.error(err);
        });
    },
    sortList() {
      //sort list content into unassigned, pastDue, and days
      this.unassigned = [];
      this.pastDue = [];
      this.closeDays = [];
      this.days = [];
      let categoryStats = {};
      for (let i of this.categories) {
        categoryStats[i.id] = 0;
      }
      let d = moment();
      const dateNames = ["Today", "Tomorrow"];
      for (let i = 0; i < 7; i++) {
        this.closeDays.push({
          date: d.format("YYYY-MM-DD"),
          displayDate: i < 2 ? dateNames[i] : d.format("dddd"),
          events: [],
        });
        d = d.add(1, "d");
      }
      for (let i of this.list) {
        // if (i.isTodo && i.done) continue
        if (this.categoryFilter != null && this.categoryFilter != i.category)
          continue;
        if (i.date == "unassigned") {
          this.unassigned.push(i);
        } else if (datecmp(i.date, this.today) < 0) {
          if (!i.isTodo) continue; // none-todo events are not past due
          if (i.done) continue; // done todos are not past due
          this.pastDue.push(i);
        } else {
          let dateStr = i.date;
          i.multiDay = i.dateTo && i.dateTo != dateStr;
          let closeInd = this.closeDays.findIndex((v) => v.date == dateStr);
          if (closeInd == -1) {
            let ind = this.days.findIndex((v) => v.date == dateStr);
            if (ind == -1) {
              this.days.push({
                date: dateStr,
                events: [i],
              });
            } else {
              this.days[ind].events.push(i);
            }
          } else {
            this.closeDays[closeInd].events.push(i);
          }
          if (i.multiDay) {
            // multi-day event parsing
            let jt = i.dateFrom;
            let j = moment(jt, "YYYY-MM-DD");
            while (jt != i.dateTo) {
              j.add(1, "day");
              jt = j.format("YYYY-MM-DD");
              let closeInd = this.closeDays.findIndex((v) => v.date == jt);
              if (closeInd == -1) {
                let ind = this.days.findIndex((v) => v.date == jt);
                if (ind == -1) {
                  this.days.push({
                    date: jt,
                    events: [i],
                  });
                } else {
                  this.days[ind].events.push(i);
                }
              } else {
                this.closeDays[closeInd].events.push(i);
              }
            }
          }
        }
        if (i.category != null) categoryStats[i.category]++;
      }
      this.unassigned.sort((a, b) => {
        return a.order - b.order;
      });
      for (let i in this.closeDays) {
        this.closeDays[i].events.sort((a, b) => {
          return a.order - b.order;
        });
      }
      for (let i in this.days) {
        this.days[i].events.sort((a, b) => {
          return a.order - b.order;
        });
      }
      this.$store.commit("data/categoryStats", categoryStats);
      // console.log(this.unassigned, this.pastDue, this.closeDays, this.days)
    },
    loadList() {
      categoryUtil
        .getAll()
        .then((categories) => {
          this.categories = categories;
          this.categoryHelper.setCategories(categories);

          listUtil
            .getAllEvents()
            .then((res) => {
              this.list = res;
              this.sortList();
            })
            .catch((err) => {
              console.error("getAllEvents error: ", err);
            });
        })
        .catch((err) => {
          console.error("error: ", err);
        });
    },
  },
  watch: {
    dataIteration() {
      // console.log('List dataIteration', val)
      this.loadList();
    },
    pageVisible(val) {
      if (val) {
        //either this.loadList() or this.sortList()
        // console.log('list re-render')
        this.today = todayStr();
        this.tomorrow = tomorrowStr();
        this.sortList();
      }
    },
    categoryFilter() {
      this.sortList();
    },
  },
  computed: {
    dataIteration() {
      return this.$store.state.data.iteration;
    },
    pageVisible() {
      return this.$store.state.layout.pageVisible;
    },
    categoryFilter() {
      return this.$store.state.layout.categoryFilter;
    },
  },
  created() {
    this.loadList();
  },
};
</script>

<style scoped lang="scss">
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
