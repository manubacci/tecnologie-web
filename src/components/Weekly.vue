<template>
    <div class='weekly'>
        <Wrapper :component='period' />
        <Wrapper :component='week' />
        <Wrapper :component='schedule' />
    </div>
</template>

<script>
import Wrapper from './Wrapper.vue';
import Period from './Period.vue';
import Week from './Week.vue';
import Schedule from './Schedule.vue';
import { global } from '../store/global';
import { compare } from '../utils/misc';

export default {
    components: {
        Wrapper,
        Period,
        Week,
        Schedule
    },
    data() {
        return {
            intervall: null
        };
    },
    computed: {
        period() {
            return Period;
        },
        week() {
            return Week;
        },
        schedule() {
            return Schedule;
        }
    },
    methods: {
        clock() {
            global.today.now = new Date(Date.now() - global.today.alpha);
            if (!compare(global.today.now, global.today.day)) {
                global.today.day = new Date(global.today.now);
            }
        }
    },
    mounted() {
        this.intervall = setInterval(this.clock, 1000);
    },
    unmounted() {
        clearInterval(this.intervall);
        this.intervall = null;
    }
};
</script>

<style>
@media (hover: hover) and (pointer: fine) {
    .weekly .day .numeric:hover:not(.target).small {
        background-color: var(--bs-secondary-bg);
    }
}
</style>