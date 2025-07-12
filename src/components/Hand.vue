<template>
    <div class="hand" :style="{ top: top }">
        <Clock type="now" />
    </div>
</template>

<script>
import Clock from './Clock.vue';
import { global } from '../store/global';

export default {
    components: {
        Clock
    },
    data() {
        return {
            base: null,
            height: null
        };
    },
    computed: {
        top() {
            const top =
                this.base +
                this.height *
                (global.today.now.getHours() * 3600 + global.today.now.getMinutes() * 60 + global.today.now.getSeconds());
            return `${top}px`;
        }
    },
    mounted() {
        this.base = document.querySelector('[class*="spacer-"]').offsetHeight;
        this.height = (document.querySelector('.hourly').scrollHeight -
            (2 * this.base)) /
            (23 * 3600 + 60 * 60 + 60);
    },
    unmounted(){
        this.base = null;
        this.height = null;
    }
};
</script>

<style>
.hand {
    position: absolute;
    right: 0;
    width: calc(100% - (var(--clock-width) - (2 * var(--now-space))));
    border-bottom: 2px solid var(--background-primary);
}
</style>