<template>
    <button class="year">{{ year }}</button>
</template>

<script>
import { global } from '../store/global';
import { animations } from '../store/animations';
import { toggle } from '../utils/swipe';

export default {
    props: {
        day: {
            type: Date
        }
    },
    data() {
        return {
            yearly: null,
            monthly: null
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        year() {
            return this.target.getFullYear();
        }
    },
    methods: {
        click(event) {
            const $el = this.$el;
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

                    document.querySelector('.radio-yearly').previousElementSibling.checked = true;
                    document.querySelector('.navbar .selection').style.transform = 'translateX(6.8rem)';

                    if (!global.touch) {
                        var hover = document.querySelector('.navbar .hover');
                        hover.style.opacity = 0;
                    }
                    toggle('yearly');

                    setTimeout(() => {
                        if (!global.touch) {
                            hover.style.left = '6.8rem';
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
        this.yearly = this.$el.closest('.yearly');
        this.monthly = this.$el.closest('.monthly') && !this.yearly;
        if (!this.yearly && !this.monthly)
            this.$el.addEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
    },
    unmounted() {
        if (!this.yearly && !this.monthly)
            this.$el.removeEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
        this.yearly = null;
        this.monthly = null;
    },
};
</script>

<style>
.year {
    all: unset;
    font-size: 2.2rem;
    font-weight: 300;
    color: var(--background-primary);
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

.year:active {
  transform: scale(var(--pop-lg));
}

@media (hover: hover) and (pointer: fine) {
    .year:hover {
        color: var(--background-secondary);
    }
}
</style>
