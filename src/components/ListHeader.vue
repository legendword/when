<template>
    <q-item class="q-mt-lg q-mb-sm">
        <q-item-section side>
            <div class="checkbox-placeholder flex items-center justify-center">
                <slot name="side"></slot>
            </div>
        </q-item-section>
        <q-item-section>
            <div :class="'text-h4 text-'+(color?color:'primary')">
                <slot></slot>
            </div>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'ListHeader',
    props: {
        color: String,

    }
}
</script>

<style lang="scss">
.checkbox-placeholder {
    width: 40px; /* smaller than 40px to allow text to be a bit to the left */
    height: 40px;
}
</style>