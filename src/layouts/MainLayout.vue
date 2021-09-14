<template>
    <q-layout view="hHr LpR fFr">

        <q-drawer show-if-above v-model="menu" side="left" :width="250">
            <div class="text-h5 q-mt-md q-mb-sm q-ml-md">When</div>
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

        <q-footer elevated class="bg-primary text-white">
            <q-toolbar>
                <q-toolbar-title>
                    Current Event: None
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>
    </q-layout>
</template>

<script>
export default {
    name: 'MainLayout',
    data () {
        return {
            menu: true,
            pageHiddenProp: 'hidden'
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
.menu-list .q-item {
    border-radius: 0 32px 32px 0;
}
</style>