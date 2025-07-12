<template>
    <div class="yearly" :class="class">
        <div class="preview">
            <Year :day="target" />
            <div class="row g-0">
                <div class="block col-4 col-md-3 col-lg-2" v-for="month in months" @enter="enter" @leave="leave">
                    <Period :day="date(month).day" />

                    <div v-for="week in date(month).weeks" class="week">
                        <div v-for="day in weeks(week)" class="day">
                            {{ day.getMonth() === month.getMonth() ? day.getDate() : '' }}
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <hr>
        <Resume :date="new Date(target.getFullYear(), 0, 1)" />
    </div>
</template>

<script>
import Year from './Year.vue';
import Period from './Period.vue';
import Week from './Week.vue';
import Resume from './Resume.vue';
import { global } from '../store/global';
import { animations } from '../store/animations';
import { month, weekday } from '../utils/misc';
import { toggle } from '../utils/swipe';

export default {
    name: 'yearly',
    components: {
        Year,
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
    data() {
        return {
            top: null,
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.scroll));
        },
        class() {
            return {
                'focus': this.focus
            };
        },
        months() {
            const day = new Date(this.target.getFullYear(), 0, 1);
            month(day, -1);

            return Array.from({ length: 12 }).map((_, i) => {
                month(day, 1);
                return new Date(day);
            });
        },
        weeks() {
            return (target) => {
                const day = new Date(target);
                day.setDate(day.getDate() - weekday(day) - 1);

                return Array.from({ length: 7 }).map((_, i) => {
                    day.setDate(day.getDate() + 1);
                    return new Date(day);
                });
            }
        }
    },
    methods: {
        date(date) {
            const day = new Date(date),
                target = new Date(day);

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
        },
        scroll() {
            this.top = this.$el.scrollTop;
        },
        click(event, month) {
            const $el = event.target.closest('.block');
            const id = event.touches?.[0].identifier;

            const startX = global.touch
                ? event.touches[0].clientX
                : event.clientX,
                startY = global.touch
                    ? event.touches[0].clientY
                    : event.clientY;
            let deltaX = 0,
                deltaY = 0;

            global.swipe.point = new Date(this.target.getFullYear(),
                month,
                (new Date(JSON.parse(sessionStorage.getItem('target')))).getDate());;

            let delta = false;
            function move(event) {
                const currentX = global.touch
                    ? Array.from(event.touches).find(touch => touch.identifier === id).clientX
                    : event.clientX,
                    currentY = global.touch
                        ? Array.from(event.touches).find(touch => touch.identifier === id).clientY
                        : event.clientY;
                deltaX = currentX - startX;
                deltaY = currentY - startY;

                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)
                    delta = true;
            }

            function up() {
                if (!delta) {
                    global.swipe.transition = true;
                    sessionStorage.setItem('target', global.swipe.point.getTime());

                    setTimeout(() => {
                        document.querySelector('.navbar .radio-weekly').previousElementSibling.checked = true;
                        document.querySelector('.navbar .selection').style.transform = 'translateX(0)';

                        if (!global.touch) {
                            var hover = document.querySelector('.navbar .hover');
                            hover.style.opacity = 0;
                        }
                        setTimeout(() => {
                            if (!global.touch) {
                                hover.style.left = 0;
                                hover.style.opacity = 1;
                            }
                            toggle('weekly');
                        }, animations.transition)
                    }, (animations.pulse - animations.transition));
                }
                window.removeEventListener(global.touch ? 'touchmove' : 'mousemove', move)
                window.removeEventListener(global.touch ? 'touchend' : 'mouseup', up)
            }
            window.addEventListener(global.touch ? 'touchmove' : 'mousemove', move)
            window.addEventListener(global.touch ? 'touchend' : 'mouseup', up)
        },
        today() {
            const scroll = this.target,
                target = new Date(parseInt(sessionStorage.getItem('target'))),
                today = new Date(global.today.day.getFullYear(), global.today.day.getMonth(), global.today.day.getDate());

            if (target.getFullYear() === scroll.getFullYear()) {
                const day = Array.from(Array.from(this.$el.querySelectorAll('.block'))[target.getMonth()]
                    .querySelectorAll('.day')).find(day => parseInt(day.textContent) === target.getDate());

                day.classList.add(target.getTime() === today.getTime() ? 'today' : 'target');
            } else {
                this.$el.querySelectorAll('.day').forEach(day => day.classList.remove('today', 'target'));
            }
        }
    },
    mounted() {
        const top = JSON.parse(sessionStorage.getItem('yearly'));
        requestAnimationFrame(() => {
            if (top || top === 0)
                this.$el.scrollTop = top;
        });
        this.today();

        this.$el.addEventListener('scroll', this.scroll);
        this.$el.querySelectorAll('.block').forEach((element, index) => {
            element.click = (event) => this.click(event, index);
            element.addEventListener(global.touch ? 'touchstart' : 'mousedown', element.click)
        });
    },
    unmounted() {
        this.top = null;

        this.$el.removeEventListener('scroll', this.scroll);
        this.$el.querySelectorAll('.block').forEach((element, index) => {
            element.removeEventListener(global.touch ? 'touchstart' : 'mousedown', element.click)
        });
    },
    watch: {
        top() {
            sessionStorage.setItem('yearly', JSON.stringify(this.top));
        },
        target() {
            requestAnimationFrame(() =>
                this.today());
        }
    }
};
</script>

<style>
.yearly {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: auto;
}

@media (hover: hover) and (pointer: fine) {
    .yearly .block:hover {
        opacity: 0.65;
    }
}

.yearly .block {
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

.yearly .block:active {
    transform: scale(var(--pop-xl));
}

.yearly .preview {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    padding-bottom: 1rem;
}

.yearly .preview>div {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.yearly .resume {
    min-height: 25rem;
}

.yearly .year {
    padding-left: 0.5rem;
}

.yearly .block {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 1rem;
}

.yearly .period {
    padding-top: 0;
    padding-left: 0;
    margin-bottom: 0.;
}

.yearly .period .year {
    display: none;
}

.yearly .period .month {
    font-size: 0.9rem;
    padding-left: 0.2rem;
}

.yearly .month,
.yearly .year {
    cursor: default;
    pointer-events: none;
}

.yearly .week {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-left: 0;
    padding-top: 0.1rem;
    padding-bottom: 0.1rem;
}

.yearly .day {
    font-size: 0.6rem;
    padding-left: 0.1rem;
    padding-right: 0.1rem;
    width: 100%;
}

.yearly .day.target {
    background-color: inherit;
    color: var(--text-secondary);
    font-weight: 500;
}

.yearly .day.today {
    background-color: inherit;
    color: var(--background-primary);
    font-weight: 600;
}

.yearly hr {
    margin: 0;
}
</style>