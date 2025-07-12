<template>
    <div class="schedule" :class="class">
        <Daily :day='target' />
        <Hourly v-if='mounted' :day='target' />
    </div>
</template>

<script>
import Daily from './Daily.vue';
import Hourly from './Hourly.vue';

export default {
    name: 'schedule',
    components: {
        Daily,
        Hourly
    },
    props: {
        day: {
            type: Date
        },
        focus: {
            type: Boolean
        }
    },
    data() {
        return {
            mounted: null
        };
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        class() {
            return {
                'focus' : this.focus
            };
        }
    },
    mounted() {
        this.mounted = true;
    },
    unmounted() {
        this.mounted = null;
    }
};
</script>

<style>
.schedule {
    width: 100%;
    position: relative;
}

:root {
    --clock-width: 3.7rem;
}
</style>