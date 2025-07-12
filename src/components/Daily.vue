<template>
    <div class="daily">
        <Timeslot type="daily" :day="target" :style="{ height: Math.min(height, minimum) + 'px' }" />
        <div class="display" :style="{ height: Math.min(height, minimum) + 'px' }">
            <div :style="{ height: height + 'px' }">
                <div v-for="day in days">
                    <Event v-if="mounted" v-for="event in events(day)" :day="day" :event="event" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Timeslot from './Timeslot.vue';
import Event from './Event.vue';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { weekday, show, start, end } from '../utils/misc';

export default {
    components: {
        Timeslot,
        Event
    },
    props: {
        day: {
            type: Date
        }
    },
    data() {
        return {
            overflow: 1,
            mounted: null
        }
    },
    computed: {
        target() {
            this.overflow = 1;
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        small() {
            return global.size.width <= 575;
        },
        calendars() {
            return global.calendars;
        },
        height() {
            return 2 * parseFloat(getComputedStyle(document.documentElement).fontSize) * this.overflow + 3;
        },
        minimum() {
            return 4.5 * parseFloat(getComputedStyle(document.documentElement).fontSize) + 2;
        },
        days() {
            const target = this.target;
            global.calendars;

            if (this.small) {
                this.overflow = this.overflowing(this.target).length || 1;
                return [target];
            } else {
                const day = new Date(target);
                day.setDate(day.getDate() - weekday(day) - 1);

                let overflow = 1;
                const result = Array.from({ length: 7 }).map((_, i) => {
                    day.setDate(day.getDate() + 1);
                    overflow = Math.max(overflow, this.overflowing(day).length);
                    return new Date(day);
                });
                this.overflow = overflow;

                return result;
            }
        },
        events() {
            const events = global.events;
            return (target) => {
                return events.filter(event => {
                    const daily = {
                        start: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
                        end: new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59)
                    };

                    return show(event, target).show &&
                        (event.activity || event.daily || (!settings.invasive && start(event, target).getTime() === daily.start.getTime() &&
                            end(event, target).getTime() === daily.end.getTime()));
                });
            };
        }
    },
    methods: {
        overflowing(day) {
            const overflowing = global.events.filter(event => {
                const daily = {
                    start: new Date(day.getFullYear(), day.getMonth(), day.getDate()),
                    end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59)
                };
                const calendar = global.calendars.find(calendar => calendar._id === event.calendar);
                
                return show(event, day).show && calendar.show &&
                    (event.activity || event.daily || (!settings.invasive && start(event, day).getTime() === daily.start.getTime() &&
                        end(event, day).getTime() === daily.end.getTime()));
            });
            return overflowing;
           
        }
    },
    watch: {
        calendars: {
            handler() {
                this.overflow = 1;
            },
            deep: true
        }
    },
    mounted() {
        this.mounted = true;
    },
    unmounted() {
        this.mounted = null;
        this.overflow = 1;
    },
};
</script>

<style>
.daily .display {
    overflow: scroll;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.daily .cell {
    border-bottom: 0.9px solid;
}
</style>