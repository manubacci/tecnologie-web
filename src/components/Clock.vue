<template>
    <div :class="class">
        <div>{{ time }}</div>
    </div>
</template>

<script>
import { global } from '../store/global';
import { settings } from '../store/settings';

export default {
    props: {
        type: {
            type: String
        },
        hour: {
            type: Number
        }
    },
    computed: {
        time() {
            let time;
            if (this.type === 'hourly') {
                time = new Date(0);
                time.setHours(this.hour, 0, 0);
                time = time.toLocaleTimeString(settings.format, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23'
                });
            } else if (this.type === 'now') {
                time = global.today.now.toLocaleTimeString(settings.format, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: settings.seconds ? '2-digit' : undefined,
                    hourCycle: 'h23'
                });
            } else if (this.type === 'daily') {
                time = settings.format === 'it-IT' ? 'Giorno' : 'Day';
            }
            return time;
        },
        class() {
            return {
                clock: this.type !== 'now',
                now: this.type === 'now',
                col: true
            };
        }
    }
};
</script>

<style>
.clock,
.now {
    position: absolute;
    left: 0;
    font-size: 0.7rem;
    width: calc(var(--clock-width) - var(--clock-space));
    display: flex;
    align-items: center;
    justify-content: end;
}

:root {
    --clock-space: 0.5rem;
}

.clock>div {
    display: inline-block;
}

.now {
    left: calc((var(--clock-space) + (1.5 * var(--now-space))) - var(--clock-width));
    color: var(--text-primary);
}

.now>div {
    padding-top: 0.1rem;
    padding-bottom: 0.1rem;
    padding-left: var(--now-space);
    padding-right: var(--now-space);
    background-color: var(--background-primary);
    border-radius: 0.55rem 0 0.55rem 0.55rem;
    z-index: 1;
}

:root {
    --now-space: 0.3rem;
}
</style>