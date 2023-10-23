<template>
  <q-item>
    <q-item-section side>
      <div class="checkbox-placeholder flex items-center justify-center">
        <slot name="side"></slot>
      </div>
    </q-item-section>
    <q-item-section>
      <div
        :class="'text-h4 list-header-text text-' + (color ? color : 'primary')"
      >
        <slot></slot>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: "ListHeader",
  props: {
    color: String,
  },
};
</script>

<style lang="scss">
.checkbox-placeholder {
  width: 40px; /* smaller than 40px to allow text to be a bit to the left */
  height: 40px;
}
.list-header-text {
  font-size: 1.6rem;
}
</style>
