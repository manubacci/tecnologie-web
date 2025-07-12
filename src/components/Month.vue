<template>
    <button class="month">
        {{ month }}
    </button>
</template>

<script>
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';
import { capitalize } from '../utils/misc';
import { toggle } from '../utils/swipe';

export default {
    props: {
        day: {
            type: Date
        }
    },
    data() {
        return {
            special: null
        };
    },
    computed: {
        target() {
            return this.day || new Date(parseInt(this.$route.params.target));
        },
        month() {
            return capitalize(
                this.target
                    .toLocaleDateString(settings.format, { month: 'long' }));
        }
    },
    methods: {
        click(event) {
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
                    document.querySelector('.radio-monthly').previousElementSibling.checked = true;
                    document.querySelector('.navbar .selection').style.transform = 'translateX(3.4rem)';

                    if (!global.touch) {
                        var hover = document.querySelector('.navbar .hover');
                        hover.style.opacity = 0;
                    }
                    toggle('monthly');
                    setTimeout(() => {
                        if (!global.touch) {
                            hover.style.left = '3.4rem';
                            hover.style.opacity = 1;
                        }
                    }, animations.transition);
                }
                window.removeEventListener(global.touch ? 'touchmove' : 'mousemove', move)
                window.removeEventListener(global.touch ? 'touchend' : 'mouseup', up)
            }
            window.addEventListener(global.touch ? 'touchmove' : 'mousemove', move)
            window.addEventListener(global.touch ? 'touchend' : 'mouseup', up)
        }
    },
    mounted() {
        this.special = this.$el.closest('.monthly') || this.$el.closest('.yearly');
        if (!this.special)
            this.$el.addEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
    },
    unmounted() {
        if (!this.special)
            this.$el.removeEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
        this.special = null;
    },
};
</script>

<style>
.month {
    all: unset;
    font-size: 2.2rem;
    font-weight: 400;
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

.month:active {
    transform: scale(var(--pop-lg));
}

@media (hover: hover) and (pointer: fine) {
    .weekly .month:hover {
        color: var(--background-secondary);
    }
}
</style>
