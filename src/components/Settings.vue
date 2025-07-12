<template>
    <div class="settings modal fade" id="modal-settings" :inert="inert" @keydown.enter="save">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header bg-body-tertiary">
                    <h6 class="modal-title">
                        {{ selection.format === "it-IT" ? "Opzioni" : "Settings" }}
                    </h6>
                    <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="modal">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">

                    <div class="form-label">
                        {{ selection.format === "it-IT" ? "Tema" : "Theme" }}
                    </div>
                    <div class="theme dropdown bg-body-tertiary">
                        <span class="bg-body-secondary"><i class="bi bi-circle-half"></i></span>
                        <button class="dropdown-toggle btn btn-sm bg-body-tertiary" data-bs-toggle="dropdown"
                            @mouseenter="enter" @mouseleave="leave" @click="click">
                            {{ selection.theme === "dark"
                                ? selection.format === "it-IT" ? "Modalità Scura" : "Dark Mode"
                                : selection.format === "it-IT" ? "Modalità Chiara" : "Light Mode" }}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <div class="dropdown-item" @click="choice('theme', 'dark')">
                                    {{ selection.format === "it-IT" ? "Modalità Scura" : "Dark Mode" }}
                                </div>
                            </li>
                            <li>
                                <div class="dropdown-item" @click="choice('theme', 'light')">
                                    {{ selection.format === "it-IT" ? "Modalità Chiara" : "Light Mode" }}
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="color bg-body-tertiary">
                        <span class="bg-body-secondary"><i class="bi bi-palette-fill"></i></span>
                        <div class="form-check bg-body-tertiary" @mouseenter="enter" @mouseleave="leave">
                            <label class="form-check-label" for="settings-color">
                                {{ selection.format === "it-IT" ? "Colore" : "Color" }}
                            </label>
                            <input id="settings-color" class="form-check-input border" :class="border" type="color"
                                :value="selection.color">
                        </div>
                    </div>
                    <div v-show="alert.color" class="alert">
                        {{ selection.format === "it-IT"
                            ? "Il colore selezionato è troppo simile a uno dei colori di sfondo."
                            : "The selected color is too similar to one of the background colors." }}
                    </div>
                    <div class="form-label">
                        {{ selection.format === "it-IT" ? "Lingua" : "Language" }}
                    </div>
                    <div class="language dropdown bg-body-tertiary">
                        <span class="bg-body-secondary"><i class="bi bi-translate"></i></span>
                        <button class="dropdown-toggle btn btn-sm bg-body-tertiary" data-bs-toggle="dropdown"
                            @mouseenter="enter" @mouseleave="leave" @click="click">
                            {{ selection.format === "it-IT" ? "Italiano (it-IT)" : "English (en-EN)" }}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <div class="dropdown-item" @click="choice('language', 'it-IT')">
                                    Italiano (it-IT)
                                </div>
                            </li>
                            <li>
                                <div class="dropdown-item" @click="choice('language', 'en-EN')">
                                    English (en-EN)
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="form-label">
                        {{ selection.format === "it-IT" ? "Avanzate" : "Advanced" }}
                    </div>
                    <div class="seconds bg-body-tertiary">
                        <span class="bg-body-secondary"><i class="bi bi-clock-history"></i></span>
                        <div class="form-check form-switch bg-body-tertiary" @mouseenter="enter" @mouseleave="leave">
                            <label class="form-check-label" for="settings-seconds">
                                {{ selection.format === "it-IT" ? "Secondi nell'Orologio" : "Seconds in Clock" }}
                            </label>
                            <input id="settings-seconds" class="form-check-input" type="checkbox"
                                :checked="selection.seconds" @click="choice('seconds')">
                        </div>
                    </div>
                    <div class="invasive bg-body-tertiary">
                        <span class="bg-body-secondary"><i class="bi bi-arrows-fullscreen"></i></span>
                        <div class="form-check form-switch bg-body-tertiary" @mouseenter="enter" @mouseleave="leave">
                            <label class="form-check-label" for="settings-invasive">
                                {{ selection.format === "it-IT" ? "Eventi Continuativi Invasivi" : "Invasive Continuous Events" }}
                            </label>
                            <input id="settings-invasive" class="form-check-input" type="checkbox"
                                :checked="selection.invasive" @click="choice('invasive')">
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div>
                        <button class="exit" data-bs-dismiss="modal">
                            {{ selection.format === "it-IT" ? "Esci" : "Close" }}
                        </button>
                        <button class="save" @click="save">
                            {{ selection.format === "it-IT" ? "Salva" : "Save" }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';
import { appearance, distance } from '../utils/misc';

export default {
    data() {
        return {
            selection: {
                theme: null,
                color: null,
                format: null,
                seconds: null,
                invasive: null
            },
            alert: { color: null },
            picking: null,
            hover: null,
            inert: true
        }
    },
    computed: {
        user() {
            return global.user;
        },
        border() {
            return {
                [`border-${settings.theme}`]: true
            }
        }
    },
    methods: {
        enter(event) {
            const target = event.target.closest('button, .form-check');
            this.hover = target;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-tertiary');
                target.classList.add('bg-body-secondary', 'text-body');
            }
        },
        leave(event) {
            const target = event.target.closest('button, .form-check');
            this.hover = null;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-secondary', 'text-body');
                target.classList.add('bg-body-tertiary');
            }
        },
        choice(type, selection) {
            switch (type) {
                case 'language':
                    this.selection.format = selection;
                    return;
                case 'theme':
                    this.selection.theme = selection;
                    return;
                case 'seconds':
                    this.selection.seconds = !this.selection.seconds;
                    return;
                case 'invasive':
                    this.selection.invasive = !this.selection.invasive;
                    return;
            }
        },
        load() {
            this.inert = false;
            Object.assign(this.selection, settings);
            this.alert = { color: null };
            this.$el.querySelector('.color').classList.remove('warning');
            this.picking = false;
            this.hover = null;
        },
        hide() {
            this.inert = true;
        },
        color(event) {
            this.selection.color = event.target.value;
            this.alert.color = null;
            this.$el.querySelector('.color').classList.remove('warning');
        },
        blur(event) {
            event.target.blur();
        },
        focus(element) {
            const picker = !(element instanceof Element);
            let target = !picker
                ? element.querySelector('.dropdown-toggle')
                : this.$el.querySelector('.color .form-check');

            if (this.picking && picker) {
                target = target.querySelector('.form-check-input');
                target.style.display = 'none';
                requestAnimationFrame(() =>
                    target.style.display = '');
            } else
                target.classList.add('focus');

            if (picker)
                this.picking = true;
        },
        release(element) {
            const picker = !(element instanceof Element);
            const target = !picker
                ? element.querySelector('.dropdown-toggle')
                : this.$el.querySelector('.color .form-check');

            target.classList.remove('focus')

            if (this.hover !== target) {
                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');
            }

            if (this.picking)
                setTimeout(() => this.picking = false, 501);
        },
        async save() {
            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            this.alert.color = distance('#212529', this.selection.color) || distance('#FFFFFF', this.selection.color);
            if (this.alert.color) {
                this.$el.querySelector('.color').classList.add('warning');
                return;
            }

            this.$el.querySelector('.close').click();

            const selfie = document.querySelector((this.selection.theme === settings.theme ? 'body' : '#selfie'));
            selfie.classList.add('disappear');
            await delay(animations.refresh);

            if (global.user) {
                try {
                    const data = {}
                    Object.assign(data, this.selection);
                    data.user = global.user;
                    data.order = settings.order;
                    const response = await axios.put('/api/settings/update', data);
                    Object.assign(settings, response.data.settings);
                } catch (error) {
                    console.error('Error while updating settings:', error);
                }
            } 
            Object.assign(settings, this.selection);
            sessionStorage.setItem('preset', JSON.stringify(settings));

            appearance();

            selfie.classList.remove('disappear');
            selfie.classList.add('appear');

            await delay(animations.refresh);
            selfie.classList.remove('appear');
        }
    },
    mounted() {
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);

        this.$el.querySelector('.color .form-check-input')
            .addEventListener('input', this.color);

        if (!global.touch) {
            this.$el.querySelector('.color .form-check-input')
                .addEventListener('focus', this.focus);

            this.$el.querySelector('.color .form-check-input')
                .addEventListener('blur', this.release);

            this.$el.querySelectorAll('.seconds .form-check-input, .invasive .form-check-input').forEach(element =>
                element.addEventListener('focus', this.blur));

            this.$el.querySelectorAll('.dropdown').forEach(element => {
                element.focus = () => this.focus(element);
                element.release = () => this.release(element);
                element.addEventListener('show.bs.dropdown', element.focus);
                element.addEventListener('hidden.bs.dropdown', element.release);
            });
        }
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);

        this.$el.querySelector('.color .form-check-input')
            .removeEventListener('input', this.color);

        if (!global.touch) {
            this.$el.querySelector('.color .form-check-input')
                .removeEventListener('focus', this.focus);

            this.$el.querySelector('.color .form-check-input')
                .removeEventListener('blur', this.release);

            this.$el.querySelectorAll('.seconds .form-check-input, .invasive .form-check-input').forEach(element =>
                element.removeEventListener('focus', this.blur));

            this.$el.querySelectorAll('.dropdown').forEach(element => {
                element.removeEventListener('show.bs.dropdown', element.focus);
                element.removeEventListener('hidden.bs.dropdown', element.release);
            });
        }

        this.selection = {
            theme: null,
            color: null,
            format: null,
            seconds: null,
            invasive: null
        };
        this.alert = { color: null };
        this.picking = null;
        this.hover = null;
        this.inert = true;
    },
}
</script>

<style>
.settings .modal-header {
    height: 3rem;
    padding: 0.5rem;
    padding-left: 0.9rem;
}

.settings .modal-body {
    padding: 0.9rem;
    padding-top: 0.75rem;
    padding-bottom: 0.7rem;
}

.settings .form-label {
    font-size: 0.8rem;
    padding-top: 0.25rem;
}

.settings .modal-footer {
    height: 3rem;
    padding: 0.5rem;
    justify-content: right;
}

.settings .modal-header .close {
    border-radius: 50%;
    border: none;
}

@media (hover: none) and (pointer: coarse) {
    .settings .modal-header .close {
        background-color: var(--bs-body-bg) !important;
    }
}

@media (hover: hover) and (pointer: fine) {
    .settings .modal-header button:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .settings .modal-footer button:hover:not(:disabled) {
        background-color: var(--bs-secondary-bg) !important;
        color: var(--bs-body-color) !important;
    }
}

.settings .theme,
.settings .color,
.settings .language,
.settings .seconds,
.settings .invasive {
    display: flex;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}

.settings .modal-header button,
.settings .modal-footer button,
.settings .theme,
.settings .color,
.settings .language,
.settings .seconds,
.settings .invasive {
    transition: transform 0.1s ease-out;
    cursor: pointer;
    z-index: 2;
}

.settings .modal-header button:active {
    transform: scale(var(--pop-md));
}

.settings .modal-footer button:active {
    transform: scale(var(--pop-lg));
}

.settings .theme:active,
.settings .color:active,
.settings .language:active,
.settings .seconds:active,
.settings .invasive:active {
    transform: scale(var(--pop-xxl));
}

.settings span:has(i) {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0 0 1rem;
    height: 2rem;
    width: 2.05rem;
}

.settings .modal-header i,
.settings .modal-body i {
    position: relative;
}

.settings .close i {
    top: 0.5px;
}

.settings .theme i {
    font-size: 0.82rem;
    left: 1.5px;
    top: 0.5px
}

.settings .color i {
    font-size: 0.78rem;
    left: 1.5px;
}

.settings .language i {
    font-size: 0.82rem;
    left: 1.5px;
}

.settings .seconds i {
    font-size: 0.84rem;
    left: 1.5px;
    top: 0.5px;
}

.settings .invasive i {
    font-size: 0.72rem;
    left: 1.5px;
    top: 0.5px;
}

.settings .dropdown button,
.settings .form-check {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    width: 100%;
    padding-right: 0.8rem;
    border: none;
    cursor: pointer;
    margin: 0;
}

.settings .form-check-label {
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    cursor: pointer;
    width: 100%;
    height: 100%;
}

.settings .form-check {
    padding: 0;
}

.settings .form-check-input {
    position: relative;
    right: 0.5rem;
    height: 1rem;
    border: none;
    z-index: 1;
    cursor: pointer;
}

.settings .color .form-check-input {
    height: 1.1rem;
    width: 1.17rem;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    cursor: pointer;
    border-width: 0.15rem !important;
}

.settings .color .form-check-input::-webkit-color-swatch {
    border-radius: 50%;
    border: none;
    margin: 0;
}

.settings .seconds .form-check-input,
.settings .invasive .form-check-input {
    position: relative;
    bottom: 0.1rem;
    width: 1.65rem;
}

.settings .seconds .form-check-input:checked,
.settings .invasive .form-check-input:checked {
    background-color: var(--background-secondary);
}

.settings .form-check-input:focus {
    outline: none;
    box-shadow: none;
}

.settings .dropdown-menu {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.7rem;
}

.settings .dropdown-item {
    height: 2rem;
    padding-left: 0.8rem;
    display: flex;
    align-items: center;
}

.settings .dropdown-menu li:nth-of-type(1) .dropdown-item {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.settings .dropdown-menu li:nth-last-of-type(1) .dropdown-item {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.settings .dropdown-menu li:nth-of-type(even) .dropdown-item {
    background-color: var(--bs-tertiary-bg);
}

.settings .dropdown-menu .dropdown-item:hover,
.settings .dropdown-menu .dropdown-item:active {
    background-color: var(--background-secondary) !important;
    color: white !important;
}

.settings .modal-footer button {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    font-size: 0.7rem;
    font-weight: 500;
    height: 1.75rem;
    width: auto;
    padding-left: 0.85rem;
    padding-right: 0.85rem;
    color: var(--text-secondary);
    background-color: var(--background-secondary);
}

.settings .modal-footer>div {
    display: flex;
    margin: 0;
}

.settings .modal-footer .save {
    background-color: var(--background-primary);
    color: var(--text-primary);
}

.settings .modal-footer .exit {
    margin-right: 0.5rem;
}

.settings .alert {
    margin-bottom: 0.5rem;
    padding: 0;
    font-size: 0.7rem;
    color: red;
}

.settings .warning {
    border: 0.11rem solid red !important;
}
</style>