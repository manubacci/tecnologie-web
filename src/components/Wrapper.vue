<template>
    <div class="wrapper g-0" :style="{ width: width, height: height, transform: transform }">
        <component :is="component" :day="date(-1)" />
        <component :is="component" :day="date(0)" :focus="true" />
        <component :is="component" :day="date(1)" />
    </div>
</template>

<script>
import { global } from '../store/global';
import { month, scroll } from '../utils/misc';
import { swipe } from '../utils/swipe';

export default {
    props: {
        component: {
            type: Object
        },
        day: {
            type: Date
        }
    },
    data() {
        return {
            mounted: null,
        };
    },
    computed: {
        target() {
            return this.$route.params.scroll
                ? new Date(parseInt(this.$route.params.scroll))
                : new Date(parseInt(this.$route.params.target));
        },
        height() {
            if (!this.mounted || (this.component.name !== 'monthly' && this.component.name !== 'yearly'))
                return;

            const height =
                (global.size.height >= 500 ? global.size.height : 700) -
                document.querySelector('.navbar').offsetHeight;
            return `${height}px`;
        },
        date() {
            return (direction) => {
                let target = new Date(this.target);
                const type = (this.component.name === 'yearly' || this.component.name === 'monthly')
                    ? this.component.name : global.swipe.component
                switch (type) {
                    case 'period':
                        month(target, 1 * direction);
                        break;
                    case 'week':
                        target.setDate(target.getDate() + 7 * direction);
                        break;
                    case 'schedule':
                        target.setDate(target.getDate() + (global.size.width <= 575 ? 1 : 7) * direction);
                        break;
                    case 'monthly':
                        month(target, global.swipe.displayed * direction);
                        break;
                    case 'yearly':
                        month(target, 12 * direction);
                        break;
                    case 'point':
                        if (direction !== 0) target = new Date(global.swipe.point);
                        break;
                }
                return target;
            }
        },
        width() {
            return `${3 * global.size.width}px`;
        },
        transform() {
            if (!this.mounted) return;
            return `translateX(${-global.size.width}px)`;
        },
        large() {
            return global.size.width >= 992;
        }
    },
    mounted() {
        this.mounted = true;

        this.$el.swipe = (event) => swipe(event, this.component.name);
        this.$el.addEventListener(global.touch ? 'touchstart' : 'mousedown', this.$el.swipe);
    },
    unmounted() {
        this.$el.removeEventListener(global.touch ? 'touchstart' : 'mousedown', this.$el.swipe);

        this.mounted = null;
    },
    watch: {
        target() {
            if (this.component.name === 'yearly' || this.component.name === 'monthly') {
                requestAnimationFrame(() => {
                    const month = new Date(this.target);
                    month.setDate(1);

                    if(global.swipe.displayed === 3)
                        month.setMonth(month.getMonth() - 1);

                    this.$el.querySelectorAll('.focus .resume').forEach((resume, index) => {
                        const date = new Date(month);
                        date.setMonth(date.getMonth() + index);
                        scroll(resume, date);
                    });
                })
            }
        }
    }
};
</script>

<style>
.wrapper {
    display: flex;
}
</style>