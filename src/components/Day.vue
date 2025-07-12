<template>
    <div class="day col">
        <div class="short">{{ short }}</div>
        <button class="numeric" :class="class">
            <span>{{ numeric }}</span>
            <div class="selection"></div>
        </button>
    </div>
</template>

<script>
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';
import { compare } from '../utils/misc';
import { toggle } from '../utils/swipe';

export default {
    props: {
        day: {
            type: Date
        },
        month: {
            type: Number
        }
    },
    data() {
        return {
            hover: null,
            monthly: null,
        };
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        short() {
            return this.target
                .toLocaleDateString(settings.format, { weekday: 'short' })
                .toUpperCase();
        },
        numeric() {
            return this.target.getDate();
        },
        small() {
            return global.size.width <= 575;
        },
        class() {
            const today = compare(this.target, global.today.day);
            const target = this.target.getTime() == (JSON.parse(sessionStorage.getItem('target')) ?? this.$route.params.target);
            const week = compare(this.target, global.today.day, 'week') && !this.small;
            const concurrent = this.month === this.target.getMonth();
            const point = global.swipe.point.getTime() === 0;

            return {
                'today': today,
                'target': target || (today && week && !this.monthly),
                'concurrent': concurrent,
                'small': (this.small || this.monthly) && (point || global.swipe.component === 'point'),
                'focus': !today && target && ((!this.monthly && this.small) || (this.monthly && concurrent)),
            };
        }
    },
    methods: {
        enter(event) {
            if (!global.touch) {
                const target = this.target.getTime() == (JSON.parse(sessionStorage.getItem('target')) ?? this.$route.params.target);
                const concurrent = this.month === this.target.getMonth();
                const point = global.swipe.point.getTime() === 0;

                if (!target && ((!this.monthly && this.small) || (this.monthly && concurrent)) && point)
                    event.target.closest('.numeric').classList.add('bg-body-secondary');
            }
        },
        leave(event) {
            if (!global.touch) {
                event.target.closest('.numeric').classList.remove('bg-body-secondary');
            }
        },
        click(event) {
            const target = event.target.closest('.numeric');
            if (!(event.target.closest('.week.first') && !target.classList.contains('concurrent'))) {
                if (this.target.getTime() != this.$route.params.target && (this.monthly || this.small) &&
                    !global.swipe.transition) {

                    global.swipe.point = this.target;
                    global.swipe.component = 'point';

                    if (this.monthly) {
                        const id = event.touches?.[0].identifier;

                        const startX = global.touch
                            ? event.touches[0].clientX
                            : event.clientX,
                            startY = global.touch
                                ? event.touches[0].clientY
                                : event.clientY;
                        let deltaX = 0,
                            deltaY = 0;

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

                                const before = document.querySelector('.focus .target.concurrent');
                                const selection = {
                                    target: target.querySelector('.selection'),
                                    before: before?.querySelector('.selection')
                                };
                                selection.before?.classList.add('pulse-out');
                                if (before?.closest('.today.target'))
                                    before.style.color = 'var(--background-primary)';

                                selection.target.classList.add('pulse-in');
                                target.classList.add(compare(global.swipe.point, global.today.day) ? 'target' : 'focus');

                                setTimeout(() => {
                                    selection.before?.classList.remove('pulse-out')
                                    before?.classList.remove('target', 'focus');

                                    if (before)
                                        before.style.color = '';

                                    selection.target.classList.remove('pulse-in')
                                    target.classList.remove('target', 'secondary');
                                }, animations.pulse);

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
                    }
                }
            }
        }
    },
    mounted() {
        this.monthly = this.$el.closest('.monthly');
        this.$el.querySelector('.numeric')
            .addEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
    },
    unmounted() {
        this.$el.querySelector('.numeric')
            .removeEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
        this.monthly = null;
    }
};
</script>

<style>
.day {
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: center;
    justify-content: center;
}

.day .numeric {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    position: relative;
    border-radius: 1rem;
    transition: transform 0.1s ease-out;
}

.day .numeric.small {
    cursor: pointer;
}

.day .numeric.small:active {
  transform: scale(var(--pop-sm));
}

.day .numeric>span {
    font-size: 0.95rem;
    z-index: 12
}

.day .selection {
    border-radius: 50%;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.day .short {
    font-size: 0.65rem;
}

.day .target {
    pointer-events: none;
}

.day .focus .selection {
    background-color: var(--background-secondary);
}

.day .today.target .selection {
    background-color: var(--background-primary);
}

.day .today.target {
    color: var(--text-primary);
}

.day .today:not(.target) {
    color: var(--background-primary);
}
</style>