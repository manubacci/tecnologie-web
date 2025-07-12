<template>
    <div class="period" :class="class">
        <Month :day="target" />
        <Year :day="target" />
    </div>
</template>

<script>
import Month from './Month.vue';
import Year from './Year.vue';

export default {
    name: 'period',
    components: {
        Month,
        Year
    },
    props: {
        day: {
            type: Date
        },
        focus: {
            type: Boolean
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        class() {
            return {
                'focus': this.focus
            }
        }
    }
};
</script>

<style>
.period {
    width: 100%;
    display: flex;
    gap: 0.5rem;
    padding-top: 0.5rem;
    padding-left: 1rem;
}
</style>