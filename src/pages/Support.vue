<template>
    <q-page padding>
        <div class="text-center q-mt-md q-mb-lg">
            <div class="text-h4">When</div>
            <div class="text-subtitle2">The ultimate day planner &amp; deadline tracker.</div>
            <div class="text-body2 text-grey-8">v{{appInfo.version}}</div>
        </div>
        <section class="row q-my-xl justify-around">
            <div class="col-12 col-sm-6 col-md-4 q-pa-sm">
                <q-card class="full-height column justify-between">
                    <q-card-section>
                        <div class="text-h5 q-mb-md">Support &amp; Feedback</div>
                        <div class="text-body1">Join our Discord community for detailed questions, discussions, and feature requests.</div>
                    </q-card-section>
                    <q-card-actions>
                        <q-btn flat color="primary" label="Join Discord" @click="toLink('discord')" />
                    </q-card-actions>
                </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-4 q-pa-sm">
                <q-card class="full-height column justify-between">
                    <q-card-section>
                        <div class="text-h5 q-mb-md">Source Code</div>
                        <div class="text-body1">View the source code, make contributions, create issues and pull requests.</div>
                    </q-card-section>
                    <q-card-actions>
                        <q-btn flat color="primary" label="View on GitHub" @click="toLink('gitHubRepo')" />
                    </q-card-actions>
                </q-card>
            </div>
        </section>
    </q-page>
</template>

<script>
import appInfo from '../appInfo'
export default {
    name: 'Support',
    data() {
        return {
            appInfo
        }
    },
    methods: {
        toLink(name) {
            if (!appInfo[name]) return
            window.open(appInfo[name])
        }
    }
}
</script>

<style>

</style>