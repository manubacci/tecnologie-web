<template>
    <div class="cell" :class="class"></div>
</template>

<script>
import { weekday } from '../utils/misc';
export default {
    props: {
        type: {
            type: String
        },
        day: {
            type: Date
        },
        weekday: {
            type: Number
        }
    },
    computed: {
        class() {
            const day = weekday(this.day);
            return {
                'col': true,
                'd-none d-sm-block': this.weekday != day,
                'border-top': this.type !== 'spacer-top',
                'border-start': this.weekday > day,
                'border-end': this.weekday < day
            };
        }
    }
}
</script>