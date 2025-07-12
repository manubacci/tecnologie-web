<template>
    <div class="home" :style="{ height: height }">
        <div>
            <button @click="click('weekly')">
                <div @mouseenter="enter">
                    <div class="panel">
                        <Weekly />
                    </div>
                    <div class="label">
                        {{ italian ? "Calendario" : "Calendar" }}
                    </div>
                </div>
            </button>

            <button @click="click(user ? 'notes' : null)" :style="{ transform: !user ? 'none' : '' }">
                <div @mouseenter="enter">
                    <div class="panel">
                        <Notes v-show="user" />
                        <div v-show="!user" class="hide">
                            <i class="bi bi-lock-fill"></i>
                            <div>
                                {{ italian ? "Per accedere alle funzionalità complete,\nè necessario effettuare il login.\nClicca sul pulsante "
                                : "To access the full features,\nyou need to log in.\nClick the button "}}
                                <i class="bi bi-person-plus-fill"></i>
                                {{ italian ? " nel menu " : " in menu " }}
                                <i class="bi bi-list"></i>
                                .
                            </div>
                        </div>
                    </div>
                    <div class="label">
                        {{ italian ? "Note" : "Notes" }}
                    </div>
                </div>
            </button>
        </div>
    </div>
</template>

<script>
import Weekly from './Weekly.vue';
import Notes from './Notes.vue';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';

export default {
    components: {
        Weekly,
        Notes
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        user() {
            return global.user;
        },
        height() {
            const height =
                (global.size.height >= 500 ? global.size.height : 700) - (
                    document.querySelector('.navbar').offsetHeight);
            return `${height}px`;
        },
        width() {
            return global.size.width;
        }
    },
    methods: {
        enter(event) {
            this.$el.querySelectorAll('.home div:has(>.panel)').forEach(element => {
                element.style.zIndex = 1;
                element.firstChild.style.filter = 'blur(1px)';
            });
            const target = event.target.closest('.home div:has(>.panel)');
            target.style.zIndex = 2;
            target.firstChild.style.filter = 'blur(0)';
        },
        click(route) {
            if (!route)
                return;

            const view = document.querySelector('.view');
            view.classList.add('disappear');
            setTimeout(() => {
                view.classList.remove('disappear');
                view.classList.add('appear');

                switch (route) {
                    case 'weekly':
                        this.$router.push({ name: 'weekly', params: { target: this.$route.params.target } });
                        break;
                    case 'notes':
                        this.$router.push({ name: 'notes' });
                        break;
                }

                setTimeout(() =>
                    view.classList.remove('appear'),
                    animations.refresh);
            }, animations.refresh);
        }
    },
    mounted() {
        requestAnimationFrame(() =>
            document.documentElement.style.setProperty('--width', (global.size.width / 2) + 'px'));
    },
    watch: {
        width() {
            document.documentElement.style.setProperty('--width', (global.size.width / 2) + 'px');
        },
    }
}
</script>

<style>
.home {
    width: 100%;
}

.home>div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: calc(100% - 5rem);
}

.home div:has(>.panel) {
    position: relative;
    padding: 1.5rem;
    padding-top: 1rem;
    padding-left: 1rem;
    width: calc(var(--width) + 2rem);
    height: calc(50vh + 7rem);
    border-radius: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    background-color: var(--background-tertiary);
}

.home>div>button {
    all: unset;
    width: calc(var(--width) + 2rem);
    height: calc(50vh + 7rem);
}

.home button:active {
    transform: scale(var(--pop-xxl));
    z-index: 3;
}

.home div:has(>.panel):has(.weekly) {
    position: relative;
    left: 5rem;
    top: 0.5rem;
    z-index: 2;
    transform: rotate(-2deg);
    transform-origin: bottom right;
}

.home div:has(>.panel):has(.notes) {
    position: relative;
    right: 5rem;
    bottom: 0.5rem;
    z-index: 1;
    transform: rotate(2deg);
    transform-origin: bottom left;
}

.home .panel:has(.notes) {
    filter: blur(1px);
}

.home .hide {
    display: flex;
    flex-direction: column;
    height: 200% !important;
    width: 100%;
    text-align: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 300;
    white-space: pre;
}

@media (hover: none) and (pointer: coarse) {
    .home div:has(>.panel) {
        height: calc(50vh + 3rem);
    }
}

.home .hide>i {
    font-size: 9rem;
}

.home .label {
    position: absolute;
    display: flex;
    left: 0;
    bottom: 0;

    height: 20%;
    width: calc(var(--width) + 2rem);
    background-color: var(--bs-secondary-bg);
    z-index: 1;
    border-bottom-right-radius: 1rem;
    border-bottom-left-radius: 1rem;
    box-shadow: 0 -10px 10px -10px rgba(0, 0, 0, 0.4);

    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 400;
}

@media (hover: hover) and (pointer: fine) {
    .home div:has(>.panel):hover {
        background-color: var(--bs-secondary-bg);
    }

}

.home .panel {
    width: var(--width);
    height: calc(50vh - 1rem) !important;
    overflow: hidden;
}

@media (min-width: 576px) {
    .home .panel {
        left: 0;
    }
}

.home .panel>div {
    transform: scale(0.5);
    transform-origin: top left;
    pointer-events: none;
    width: calc(var(--width) * 2);
    height: 100vh;
}

.home .panel .weekly {
    height: 0;
}
</style>