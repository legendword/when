<template>
    <q-layout view="lHh LpR fFf">

        <q-header bordered class="bg-white text-primary top-bar">
            <q-toolbar>
                <q-btn dense flat round :icon="menu ? 'chevron_left' : 'chevron_right'" @click="menu = !menu" />

                <q-tabs>
                    <q-route-tab label="Schedule" to="/" exact />
                    <q-route-tab label="Calendar" to="/calendar" exact />
                    <q-route-tab label="Deadlines" to="/deadlines" exact />
                </q-tabs>

                <q-space />

                <q-btn label="Create" icon="add" @click="newEventDialog = true" color="primary" flat />
            </q-toolbar>
        </q-header>

        <q-drawer show-if-above v-model="menu" side="left" :width="250" bordered>
            <div class="text-h5 top-bar q-ml-md">When</div>
            <div class="sidebar-container">
                <div class="categories-container">
                    <div class="categories-title">
                        <div class="title-text">CATEGORIES</div>
                        <div>
                            <q-btn dense flat size="sm" icon="add" color="primary">
                                <q-popup-proxy>
                                    <q-card class="q-pa-sm">
                                        <q-input class="category-input-wrapper" autofocus v-model="newCategory.name" hide-bottom-space placeholder="Category Name" />
                                        <q-color class="q-my-md" v-model="newCategory.color" format-model="hex" default-view="palette" :palette="categoryColorPalette" />
                                        <div class="row">
                                            <q-space />
                                            <q-btn :style="{color: newCategory.color }" flat label="Create" @click="createCategory" v-close-popup />
                                        </div>
                                    </q-card>
                                </q-popup-proxy>
                            </q-btn>
                        </div>
                    </div>
                    <q-list dense padding class="menu-list" v-if="categories.length > 0">
                        <q-item v-for="category in categories" :key="category.name" clickable v-ripple :style="{color: category.color}" class="text-weight-medium">
                            <q-item-section>
                                {{ category.name }}
                            </q-item-section>
                            <q-item-section side>
                                {{ category.total }}
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <div v-else-if="categoriesLoaded" class="text-center text-grey-8 text-caption q-my-md">
                        No categories.<br />Create the first one by clicking "+".
                    </div>
                </div>

                <div>
                    <q-btn round flat icon="help_outline" title="Support" to="/support" />
                </div>
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
import categoryUtil from '../util/category'
const categoryColorPalette = [
    '#8e24aa', '#9e69af', '#b39edb', '#7886cb', '#3f51b5', '#4185f3', '#059be5', '#009688', '#0b8043', '#33b579', '#7db442', '#c0cb33', '#e4c441', '#f5bf24', '#f09300', '#ef6c00', '#f4501e', '#d50201', '#d81a60', '#ae1457',
    '#e07a5f', '#ffd166',
    '#3d405b', '#118ab2',
    '#06d6a0', '#ef476f', '#a79b8d', '#7a5647', '#616161'
];
export default {
    name: 'MainLayout',
    components: {
        NewEvent
    },
    data () {
        return {
            menu: true,
            pageHiddenProp: 'hidden',
            newEventDialog: false,
            categories: [],
            categoriesLoaded: false,
            newCategory: {
                name: '',
                color: categoryColorPalette[Math.floor(Math.random() * categoryColorPalette.length)]
            },
            categoryColorPalette
        }
    },
    computed: {
        pageTitle() {
            return this.$store.state.layout.pageTitle
        }
    },
    methods: {
        getCategories() {
            categoryUtil.getAll().then(res => {
                this.categories = res;
                this.categoriesLoaded = true;
            }).catch(err => {
                console.error(err);
            })
        },
        createCategory() {
            if (this.newCategory.name.length == 0 || this.newCategory.color.length != 7) return;
            categoryUtil.add(this.newCategory.name, this.newCategory.color).then(() => {
                this.newCategory.name = '';
                this.newCategory.color = categoryColorPalette[Math.floor(Math.random() * categoryColorPalette.length)];
                this.getCategories();
            }).catch(err => {
                console.error(err);
            })
        },
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
    created() {
        // fetch categories
        this.getCategories();
    },
    mounted() {
        // apply listener for page visibility change
        this.applyListener()
    }
}
</script>

<style scoped lang="scss">
.sidebar-container {
    height: calc( 100vh - 50px );
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
}
.categories-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .title-text {
        font-size: 12px;
        color: $grey-7;
        font-weight: 500;
        padding-top: 2px;
    }
}
.top-bar {
    height: 50px;
    line-height: 50px;

    .q-toolbar {
        padding-left: 5px !important;
    }
}
</style>