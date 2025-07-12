<template>
    <div :class="class">
        <Day v-for="day in week" :month="month" :day="day" />
    </div>
</template>

<script>
import Day from './Day.vue';
import { weekday } from '../utils/misc';

export default {
    name: 'week',
    components: {
        Day
    },
    props: {
        day: {
            type: Date
        },
        focus: {
            type: Boolean
        },
        month: {
            type: Number
        },
        index: {
            type: Number
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        week() {
            const day = new Date(this.target);
            day.setDate(day.getDate() - weekday(day) - 1);

            return Array.from({ length: 7 }).map((_, i) => {
                day.setDate(day.getDate() + 1);
                return new Date(day);
            });
        },
        class() {
            return {
                'week row g-0': true,
                focus: this.focus,
                first: this.index === 0
            };
        }
    }
};
</script>

<style>
.week {
    width: 100%;
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
    padding-left: var(--clock-width);
}
</style>