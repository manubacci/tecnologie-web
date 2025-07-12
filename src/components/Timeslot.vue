<template>
    <div :class="class">
        <Clock :type="type" :hour="hour" />
        <Cell v-for="index in 7" :type="type" :day="target" :weekday="index - 1" 
            @mousedown="(event) => click(event, index)" @touchstart="(event) => click(event, index)"/>
        <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-editor"></button>
    </div>
</template>

<script>
import Cell from './Cell.vue';
import Clock from './Clock.vue';
import { global } from '../store/global';

export default {
    components: {
        Clock,
        Cell
    },
    props: {
        type: {
            type: String
        },
        day: {
            type: Date
        },
        hour: {
            type: Number
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        class() {
            const spacer = new RegExp('spacer').test(this.type);
            return {
                'timeslot': !spacer,
                [this.type]: spacer,
                'row g-0': true
            };
        }
    },
    methods: {
        click(event, index) {
            if (global.user) {
                const $el = this.$el,
                    hour = this.hour,
                    type = this.type;

                const id = event.touches?.[0].identifier,
                    start = global.touch
                        ? event.touches[0].clientX
                        : event.clientX

                let delta = 0,
                    timer = 0;

                const hold = setInterval(() => {
                    timer++;
                    if (timer >= 5)
                        up(true);
                }, 100);

                function move(event) {
                    const current = global.touch
                        ? Array.from(event.touches).find(touch => touch.identifier === id).clientX
                        : event.clientX
                    delta = current - start;
                }
                function up(forced) {
                    clearInterval(hold);
                    if (Math.abs(delta) < 5) {
                        if (timer >= 5 && forced === true) {
                            global.editor = {
                                event: null,
                                edit: false,
                                time: hour,
                                day: index,
                                daily: type === 'daily'
                            };
                            $el.querySelector('.toggler').click();
                        }
                    }
                    if (forced !== true) {
                        timer = 0;
                        window.removeEventListener(global.touch ? 'touchmove' : 'mousemove', move);
                        window.removeEventListener(global.touch ? 'touchend' : 'mouseup', up);
                    }
                }
                window.addEventListener(global.touch ? 'touchmove' : 'mousemove', move);
                window.addEventListener(global.touch ? 'touchend' : 'mouseup', up);
            }
        }
    }
};
</script>

<style>
.timeslot {
    padding-left: var(--clock-width);
}

.timeslot .cell {
    z-index: 1;
}
</style>