<template>
    <q-item clickable draggable>
        <q-item-section side top>
            <q-checkbox v-model="checked" v-if="item.isTodo" />
            <div class="checkbox-placeholder" v-else>

            </div>
        </q-item-section>
        <q-item-section>
            <div class="list-title">{{ item.title }}</div>
            <div class="list-notes">{{ item.notes }}</div>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'ListEvent',
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            checked: false
        }
    }
}
</script>

<style lang="scss">
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