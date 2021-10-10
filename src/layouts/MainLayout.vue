<template>
    <q-layout view="lHh LpR fFf">

        <q-header bordered class="bg-white text-primary top-bar">
            <q-toolbar>
                <q-btn dense flat round :icon="menu ? 'chevron_left' : 'chevron_right'" @click="menu = !menu" />

                <q-tabs v-if="$q.screen.gt.sm">
                    <q-route-tab label="Schedule" to="/" exact />
                    <q-route-tab label="Calendar" to="/calendar" exact />
                    <q-route-tab label="Deadlines" to="/deadlines" exact />
                </q-tabs>
                <q-btn-dropdown v-else flat :label="$route.name">
                    <q-list>
                        <q-item clickable v-close-popup to="/" exact>
                            <q-item-section>
                                <q-item-label>Schedule</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup to="/calendar" exact>
                            <q-item-section>
                                <q-item-label>Calendar</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup to="/deadlines" exact>
                            <q-item-section>
                                <q-item-label>Deadlines</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>

                <q-space />

                <month-switcher v-show="$route.path == '/calendar'" />

                <q-btn v-if="$q.screen.gt.xs" label="Create" icon="add" @click="newEventDialog = true" color="primary" flat />
                <q-btn v-else icon="add" @click="newEventDialog = true" color="primary" round dense flat />
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
                        <q-item v-for="category in categories" :key="category.id" clickable v-ripple :style="{color: category.color}" :class="'text-weight-medium' + ((categoryFilter != null && categoryFilter == category.id) ? ' shadow-5' : '')" @click="categoryClick(category.id)">
                            <q-item-section>
                                {{ category.name }}
                            </q-item-section>
                            <q-item-section side>
                                {{ categoryStats[category.id] }}
                            </q-item-section>

                            <q-menu touch-position context-menu>
                                <q-list dense style="min-width: 100px">
                                    <q-item clickable v-close-popup @click="startEditCategory(category)">
                                        <q-item-section class="text-primary">Edit</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup @click="confirmRemoveCategory(category)">
                                        <q-item-section class="text-negative">Delete</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>

                            <q-popup-proxy :value="editCategory.id == category.id" @input="editCategoryPopupChange">
                                <q-card class="q-pa-sm">
                                    <q-input class="category-input-wrapper" autofocus v-model="editCategory.name" hide-bottom-space placeholder="Category Name" />
                                    <q-color class="q-my-md" v-model="editCategory.color" format-model="hex" default-view="palette" :palette="categoryColorPalette" />
                                    <div class="row">
                                        <q-space />
                                        <q-btn :style="{color: editCategory.color }" flat label="Save" @click="submitEditCategory" v-close-popup />
                                    </div>
                                </q-card>
                            </q-popup-proxy>
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
                <new-event :show="newEventDialog" @close="newEventDialog = false" :categories="categories" />
            </q-card>
        </q-dialog>
    </q-layout>
</template>

<script>
import NewEvent from '../components/NewEvent.vue'
import MonthSwitcher from '../components/MonthSwitcher.vue'
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
        NewEvent,
        MonthSwitcher
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
            editCategory: {
                id: null,
                name: '',
                color: ''
            },
            categoryColorPalette
        }
    },
    computed: {
        dataIteration() {
            return this.$store.state.data.iteration
        },
        categoryStats() {
            return this.$store.state.data.categoryStats
        },
        categoryFilter() {
            return this.$store.state.layout.categoryFilter
        }
    },
    watch: {
        dataIteration() {
            // console.log('MainLayout dataIteration', val)
            this.getCategories()
        }
    },
    methods: {
        categoryClick(id) {
            this.$store.commit('layout/filterCategory', this.categoryFilter === id ? null : id)
        },
        editCategoryPopupChange(val) {
            if (!val) {
                this.editCategory = {
                    id: null,
                    name: '',
                    color: ''
                };
            }
        },
        getCategories() {
            categoryUtil.getAll().then(res => {
                this.categories = res;
                this.categoriesLoaded = true;
                this.$store.commit('data/categories', res);
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
        submitEditCategory() {
            categoryUtil.edit(this.editCategory.id, {...this.editCategory}).then(() => {
                this.editCategory.id = null;
                this.getCategories();
                this.$store.commit('data/change');
            }).catch(err => {
                console.error(err);
            })
        },
        startEditCategory(ct) {
            this.editCategory = {
                ...ct
            };
        },
        removeCategory(id) {
            categoryUtil.delete(id).then(() => {
                this.$store.commit('data/change')
            }).catch(err => {
                console.error(err)
            })
        },
        confirmRemoveCategory(ct) {
            this.$q.dialog({
                title: 'Confirm Delete',
                message: `Would you like to delete ${ct.name}? The items under this category will lose their category set.`,
                cancel: true,
                persistent: true,
                ok: {
                    color: 'negative',
                    label: 'Delete',
                    flat: true
                }
            }).onOk(() => {
                this.removeCategory(ct.id)
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