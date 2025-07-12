<template>
    <div :class="class">
        <div class="preview">
            <div class="previous" v-if="dimension('xl')">
                <Period :day="date(-1).day" />
                <Week v-for="(day, index) in date(-1).weeks" :index="index" :month="date(-1).month" :day="day" />
            </div>
            <div class="current">
                <Period :day="date(0).day" />
                <Week v-for="(day, index) in date(0).weeks" :index="index" :month="date(0).month" :day="day" />
            </div>
            <div class="next" v-if="dimension('lg')">
                <Period :day="date(1).day" />
                <Week v-for="(day, index) in date(1).weeks" :index="index" :month="date(1).month" :day="day" />
            </div>
        </div>
        <hr>
        <div class="recap">
            <div class="previous" v-if="dimension('xl')">
                <Resume :date="date(-1).day" />
            </div>
            <div class="current">
                <Resume :date="date(0).day" />
            </div>
            <div class="next" v-if="dimension('lg')">
                <Resume :date="date(1).day" />
            </div>
        </div>
    </div>
</template>

<script>
import Period from './Period.vue';
import Week from './Week.vue';
import Resume from './Resume.vue';
import { global } from '../store/global';
import { weekday, month } from '../utils/misc';

export default {
    name: 'monthly',
    components: {
        Period,
        Week,
        Resume
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
            return this.day ?? new Date(parseInt(this.$route.params.scroll));
        },
        class() {
            return {
                'monthly': true,
                'focus': this.focus
            };
        }
    },
    methods: {
        dimension(type) {
            const lg = global.size.width > 768;
            const xl = global.size.width > 992;

            if (lg && !xl) global.swipe.displayed = 2;
            else if (xl) global.swipe.displayed = 3;
            else global.swipe.displayed = 1;

            switch (type) {
                case 'lg':
                    return lg;
                case 'xl':
                    return xl;
            }
        },
        date(direction) {
            const day = new Date(this.target);
            day.setDate(1);
            month(day, 1 * direction);

            const target = new Date(day);

            day.setDate(- 7);
            day.setDate(day.getDate() - weekday(day));
            return {
                day: target,
                month: target.getMonth(),
                weeks:
                    Array.from({ length: 6 }).map((_, i) => {
                        day.setDate(day.getDate() + 7);

                        const end = new Date(day);
                        end.setDate(end.getDate() + 6);
                        if (day.getMonth() !== target.getMonth() && end.getMonth() !== target.getMonth()) return;

                        return new Date(day);
                    }).filter(Boolean)
            }
        }
    }
};
</script>

<style>
.monthly {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

@media (hover: hover) and (pointer: fine) {
    .monthly .day .numeric:hover:not(.target).concurrent {
        background-color: var(--bs-secondary-bg);
    }
}

.monthly .preview {
    display: flex;
    flex-direction: row;
    padding-bottom: 1rem;
}

.monthly .recap {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    height: 100%;
}

.monthly .current {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
    height: 100%;
}

.monthly .next {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin-left: 1rem;
}

.monthly .previous {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin-right: 1rem;
}

.monthly hr {
    margin: 0;
}

.monthly .month,
.monthly .year {
    cursor: default;
    pointer-events: none;
}

.monthly .week {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
}

.monthly .week.first {
    padding-top: 0.5rem;
}

.monthly .first .short {
    padding-bottom: 0.5rem;
}

.monthly .week:not(.first) .short,
.monthly .week:not(.first) .numeric:not(.concurrent) {
    display: none;
}

.monthly .first .numeric:not(.concurrent) {
    color: transparent;
    background-color: transparent;
    cursor: default;
}

.monthly .first .numeric:not(.concurrent) .selection{
    background-color: transparent;
}
</style>