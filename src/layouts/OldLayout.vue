<template>
  <q-layout view="hHr LpR fFr">

    <q-drawer show-if-above v-model="left" side="left">
      <div class="text-h5 q-my-md q-ml-md">When</div>
      <q-list padding class="menu-list">
          <q-item clickable v-ripple to="/" exact>
              <q-item-section avatar>
                  <q-icon name="dashboard" />
              </q-item-section>

              <q-item-section>
                List
              </q-item-section>
          </q-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="right" side="right" overlay elevated>
      <!-- drawer content -->
    </q-drawer>

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
  data () {
    return {
      left: false,
      right: false
    }
  }
}
</script>

<style scoped lang="scss">
.menu-list .q-item {
    border-radius: 0 32px 32px 0;
}
</style>