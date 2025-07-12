<template>
    <div class="content">
        <div class="spacer"></div>
        <div class="view">
            <router-view />
        </div>
        <div class="modals">
            <Profile />
            <Settings />
            <Editor />
            <Timemachine />
            <Writer />
            <Activities />
        </div>
    </div>
</template>

<script>
import { global } from '../store/global';
import Profile from './Profile.vue';
import Settings from './Settings.vue';
import Editor from './Editor.vue';
import Timemachine from './Timemachine.vue';
import Writer from './Writer.vue';
import Activities from './Activities.vue';

export default {
    components: {
        Profile,
        Settings,
        Editor,
        Timemachine,
        Writer,
        Activities
    },
    data() {
        return {
            observer: null
        };
    },
    mounted() {
        global.size.width = this.$el.querySelector('.view').offsetWidth;

        this.observer = new ResizeObserver(() =>
            global.size.width = this.$el.querySelector('.view').offsetWidth);
        this.observer.observe(this.$el.querySelector('.spacer'));
    },
    unmounted() {
        this.observer.disconnect();
        this.observer = null;
    }
};
</script>

<style>
.content {
    display: flex;
}

.content .view {
    overflow: hidden;
    width: 100%;
    margin: 0;
    padding: 0;
}

.content .spacer {
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    transition: width 0.3s ease-in-out;
}
</style>