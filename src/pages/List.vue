<template>
    <q-page>
        <q-list>
            <q-item>
                <q-item-section side>
                    <div class="checkbox-placeholder">

                    </div>
                </q-item-section>
                <q-item-section>
                    <div class="text-h4 q-mt-lg q-mb-sm text-brown-8">Monday</div>
                </q-item-section>
            </q-item>
            
            <q-item clickable draggable>
                <q-item-section side top>
                    <q-checkbox v-model="check" />
                </q-item-section>
                <q-item-section>
                    <div class="list-title">Test</div>
                </q-item-section>
            </q-item>

            <q-item>
                <q-item-section side>
                    <div class="checkbox-placeholder">

                    </div>
                </q-item-section>
                <q-item-section>
                    <div class="text-h4 q-mt-lg q-mb-sm text-orange-8">Today</div>
                </q-item-section>
            </q-item>
            
            <q-item clickable>
                <q-item-section side top>
                    <q-checkbox v-model="check" />
                </q-item-section>
                <q-item-section>
                    <div class="list-title">Test with notes</div>
                    <div class="list-notes">This is the notes.</div>
                </q-item-section>
            </q-item>

            <q-item clickable>
                <q-item-section side top>
                    <q-checkbox v-model="check" />
                </q-item-section>
                <q-item-section>
                    <div class="list-title">Really Long Text; Really Long Text; Really Long Text; Really Long Text; Really Long Text; Really Long Text; Really Long Text; Really Long Text; Really Long Text; </div>
                </q-item-section>
            </q-item>

            <q-item>
                <q-item-section side>
                    <div class="checkbox-placeholder">

                    </div>
                </q-item-section>
                <q-item-section>
                    <div class="text-h4 q-mt-lg q-mb-sm text-light-green-8">Wednesday</div>
                </q-item-section>
            </q-item>
            
            <q-item>
                <q-item-section side>
                    <div class="checkbox-placeholder">

                    </div>
                </q-item-section>
                <q-item-section>
                    <div class="text-subtitle2 text-grey-8">No events.</div>
                </q-item-section>
            </q-item>

            <q-item>
                <q-item-section side>
                    <div class="checkbox-placeholder">

                    </div>
                </q-item-section>
                <q-item-section>
                    <div class="text-h4 q-mt-lg q-mb-sm text-light-green-8">Thursday</div>
                </q-item-section>
            </q-item>
            
            <q-item>
                <q-item-section side>
                    <div class="checkbox-placeholder">

                    </div>
                </q-item-section>
                <q-item-section>
                    <div class="text-subtitle2 text-grey-8">No events.</div>
                </q-item-section>
            </q-item>
        </q-list>
        <q-page-sticky position="bottom-right" :offset="[25, 25]">
            <q-btn fab icon="add" color="primary" @click="openDrawer" />
        </q-page-sticky>
    </q-page>
</template>

<script>
export default {
    name: 'List',
    data() {
        return {
            check: false
        }
    },
    methods: {
        openDrawer() {
            this.$store.commit('layout/drawerState', true)
        }
    }
}
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