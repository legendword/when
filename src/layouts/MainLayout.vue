<template>
    <q-layout view="lHh LpR fFf">

        <q-header bordered class="bg-white text-primary top-bar">
            <q-toolbar>
                <q-btn dense flat round :icon="menu ? 'chevron_left' : 'chevron_right'" @click="menu = !menu" />

                <q-toolbar-title>
                    {{ pageTitle }}
                </q-toolbar-title>

                <q-btn label="Create" icon="add" @click="newEventDialog = true" color="primary" flat />
            </q-toolbar>
        </q-header>

        <q-drawer show-if-above v-model="menu" side="left" :width="250" bordered>
            <div class="text-h5 top-bar q-ml-md">When</div>
            <div class="column">
                <q-list padding class="menu-list">
                    <q-item clickable v-ripple to="/" exact>
                        <q-item-section avatar>
                            <q-icon name="list" />
                        </q-item-section>
                        <q-item-section>
                            Schedule
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple to="/calendar" exact>
                        <q-item-section avatar>
                            <q-icon name="event" />
                        </q-item-section>
                        <q-item-section>
                            Calendar
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple to="/deadlines" exact>
                        <q-item-section avatar>
                            <q-icon name="alarm" />
                        </q-item-section>
                        <q-item-section>
                            Deadlines
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-separator />
                <q-list padding class="menu-list">
                    <q-item clickable v-ripple to="/support" exact>
                        <q-item-section avatar>
                            <q-icon name="help_outline" />
                        </q-item-section>
                        <q-item-section>
                            Support
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </q-drawer>

        <!--
        <q-drawer v-model="drawer" side="right" overlay elevated behavior="mobile" :width="drawerWidth">
            <new-event :show="drawer" @close="drawer = false" />
        </q-drawer>
        -->

        <q-page-container>
            <router-view />
        </q-page-container>

        <q-dialog v-model="newEventDialog">
            <q-card style="width: 700px; max-width: 95vw;">
                <new-event :show="newEventDialog" @close="newEventDialog = false" />
            </q-card>
        </q-dialog>
    </q-layout>
</template>

<script>
import NewEvent from '../components/NewEvent.vue'
export default {
    name: 'MainLayout',
    components: {
        NewEvent
    },
    data () {
        return {
            menu: true,
            pageHiddenProp: 'hidden',
            newEventDialog: false
        }
    },
    computed: {
        pageTitle() {
            return this.$store.state.layout.pageTitle
        }
    },
    methods: {
        applyListener() {
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            else {
                return
            }
            this.pageHiddenProp = hidden
            document.addEventListener(visibilityChange, this.handlePageVisibilityChange, false)
        },
        handlePageVisibilityChange() {
            this.$store.commit('layout/pageVisibilityChange', !document[this.pageHiddenProp])
        }
    },
    mounted() {
        //apply listener for page visibility change
        this.applyListener()
    }
}
</script>

<style scoped lang="scss">
.top-bar {
    height: 60px;
    line-height: 60px;
}
</style>