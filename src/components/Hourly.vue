<template>
    <div class="hourly" :style="{ height: height }">
        <Hand v-if="today" />
        <Timeslot type="spacer-top" :day="target" />
        <Timeslot v-for="index in 24" type="hourly" :day="target" :hour="index - 1" />
        <Timeslot type="spacer-bottom" :day="target" />
        <div v-for="day in days">
            <Event v-if="mounted" v-for="event in events(day)" :day="day" :event="event" />
        </div>
    </div>
</template>

<script>
import Timeslot from './Timeslot.vue';
import Hand from './Hand.vue';
import Event from './Event.vue';
import { settings } from '../store/settings';
import { global } from '../store/global';
import { compare, weekday, show, start, end } from '../utils/misc';

export default {
    components: {
        Timeslot,
        Hand,
        Event
    },
    props: {
        day: {
            type: Date
        }
    },
    data() {
        return {
            top: null,
            mounted: null,
            daily: 0
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        small() {
            return global.size.width <= 575;
        },
        today() {
            return compare(this.target, global.today.day, 'day') ||
                (global.size.width > 575 && compare(this.target, global.today.day, 'week'));
        },
        height() {
            const height =
                (global.size.height >= 500 ? global.size.height : 700) - (
                    document.querySelector('.navbar').offsetHeight +
                    document.querySelector('.period').offsetHeight +
                    document.querySelector('.week').offsetHeight +
                    this.daily
                );
            return `${height}px`;
        },
        days() {
            const target = this.target;
            if (this.small)
                return [target];
            else {
                const day = new Date(target);
                day.setDate(day.getDate() - weekday(day) - 1);

                return Array.from({ length: 7 }).map((_, i) => {
                    day.setDate(day.getDate() + 1);
                    return new Date(day);
                });
            }
        },
        events() {
            return (target) => {
                return global.events.filter(event => {
                    const daily = {
                        start: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
                        end: new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59)
                    };
                    return show(event, target).show && !event.daily && !event.activity &&
                        !(!settings.invasive && start(event, target).getTime() === daily.start.getTime() &&
                            end(event, target).getTime() === daily.end.getTime());
                });
            };
        },
    },
    methods: {
        scroll() {
            this.top = this.$el.scrollTop
        }
    },
    mounted() {
        requestAnimationFrame(() => {
            this.daily = this.$el.closest('.schedule').querySelector('.daily').offsetHeight;

            this.$el.observer = new ResizeObserver(() => {
                this.daily = this.$el.closest('.schedule').querySelector('.daily').offsetHeight;
            });

            this.$el.observer.observe(this.$el.closest('.schedule').querySelector('.daily'));
        });


        if (this.target.getTime() == this.$route.params.target) {
            this.$el.addEventListener('scroll', this.scroll);

            const top = JSON.parse(sessionStorage.getItem('hourly'));
            requestAnimationFrame(() => {
                if (!top && top != 0)
                    this.$el.querySelectorAll('.timeslot')[global.today.now.getHours()].scrollIntoView();
                else
                    this.$el.scrollTop = top;
            });
        }
        this.mounted = true;
    },
    unmounted() {
        if (this.target.getTime() == this.$route.params.target)
            this.$el.removeEventListener('scroll', this.scroll);

        this.mounted = null;
        this.top = null;
        this.daily = 0;
    },
    watch: {
        top(value) {
            sessionStorage.setItem('hourly', JSON.stringify(value));
        }
    },

};
</script>

<style>
.hourly {
    position: relative;
    overflow: auto;
    overflow-x: hidden !important;
}

.hourly .timeslot {
    height: 5rem;
}

.hourly [class*='spacer'] {
    padding-left: var(--clock-width);
    height: 0.5rem;
}
</style>