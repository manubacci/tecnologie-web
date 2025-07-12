<template>
    <div v-if="updated" id="menu" class="menu offcanvas offcanvas-start" data-bs-scroll="true"
        :data-bs-backdrop="backdrop">
        <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-calendar"></button>

        <div class="offcanvas-header bg-body-tertiary" :style="{ height: header }">
            <button class="profile btn btn-sm bg-body text-body" :style="{ backgroundImage: propic }"
                data-bs-toggle="modal" data-bs-target="#modal-profile" @click="click">
                <i v-show="user && propic == 'url(null)'" class="bi bi-person-fill"></i>
                <i v-show="!user" class="bi bi-person-plus-fill"></i>
            </button>
            <div>
                <button class="settings btn btn-sm bg-body text-body" data-bs-toggle="modal"
                    data-bs-target="#modal-settings" @click="click">
                    <i class="bi bi-gear-wide-connected"></i>
                </button>
                <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="offcanvas" @click="close">
                    <i class="bi bi-arrow-bar-left"></i>
                </button>
            </div>
        </div>
        <div class="offcanvas-body">
            <div v-show="!user" class="message bg-body-tertiary">
                {{ italian
                    ? "Per accedere a tutte\nle funzionalità dell'app,\nesegui il login tramite\nil pulsante "
                    : "To access all the\nfeatures of the app, log\nin using the button "
                }}
                <i class="bi bi-person-plus-fill"></i>
                .
            </div>
            <div v-show="user && view != 'notes'" class="list bg-body-tertiary">
                <button class="calendar personal btn btn-sm bg-body" @mouseenter="enter" @mouseleave="leave"
                    @click="(event) => show(event, 'personal')">
                    <div class="checkbox" :class="hidden('personal')">
                        <div v-show="personal"></div>
                    </div>
                    <span> {{ italian ? "Personale" : "Personal" }} </span>
                </button>
                <button class="new btn btn-sm bg-body" @mouseenter="enter" @mouseleave="leave"
                    @click="(event) => click(event)">
                    <div class="bg-body-secondary">
                        <i class="bi bi-plus"></i>
                    </div>
                    <span> {{ italian ? "Nuovo Calendario" : "New Calendar" }} </span>
                </button>
                <hr>
                <div>
                    <button v-for="calendar in list" :data-calendar="calendar._id" class="calendar btn btn-sm bg-body"
                        @mouseenter="enter" @mouseleave="leave" @click="(event) => show(event, calendar)">
                        <div class="checkbox" :class="hidden(calendar)" :style="{ backgroundColor: calendar.color }">
                            <div v-show="calendar.show" :style="{ backgroundColor: dot(calendar.color) }"></div>
                        </div>
                        <span> {{ calendar.title }} </span>
                        <div class="edit btn btn-sm bg-body-secondary" @mouseenter="enter" @mouseleave="leave"
                            @click="(event) => click(event, calendar)">
                            <i class="bi bi-pencil-fill"></i>
                        </div>
                    </button>
                </div>
            </div>
            <div>
                <div v-show="user">
                    <div v-show="view != 'notes'">
                        <div class="notes">
                            <div class="bg-body-secondary"><i class="bi bi-sticky"></i></div>
                            <button class="btn btn-sm bg-body-tertiary" @click="click">
                                {{ italian ? "Note" : "Notes" }}
                            </button>
                        </div>
                        <div class="activities">
                            <div class="bg-body-secondary"><i class="bi bi-list-check"></i></div>
                            <button class="btn btn-sm bg-body-tertiary" data-bs-toggle="modal"
                                data-bs-target="#modal-activities" @click="click">
                                {{ italian ? "Attività" : "Activities" }}
                            </button>
                        </div>
                    </div>
                    <div class="agenda" v-show="view == 'notes'">
                        <div class="bg-body-secondary"><i class="bi bi-calendar3"></i></div>
                        <button class="btn btn-sm bg-body-tertiary" @click="click">
                            {{ italian ? "Calendario" : "Calendar" }}
                        </button>
                    </div>
                </div>

                <div v-show="view != 'notes'" class="timemachine">
                    <div class="bg-body-secondary"><i class="bi bi-clock-history"></i></div>
                    <button class="btn btn-sm bg-body-tertiary" data-bs-toggle="modal"
                        data-bs-target="#modal-timemachine" @click="click">
                        {{ italian ? "Macchina del Tempo" : "Time Machine" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <Calendar :calendar="edit" />
</template>

<script>
import axios from 'axios';
import Calendar from './Calendar.vue';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';
import { luminance } from '../utils/misc';

export default {
    components: {
        Calendar
    },
    data() {
        return {
            mounted: null,
            updated: true,
            edit: null
        }
    },
    computed: {
        backdrop() {
            let tollerance = this.mounted;
            const spacer = document.querySelector('.spacer')?.offsetWidth;
            const menu = document.querySelector('.menu')?.offsetWidth + 1;
            if (spacer === 0 || spacer === menu)
                tollerance = menu;
            else tollerance = 0;

            return global.size.width <= 575 + tollerance;
        },
        header() {
            return `${document.querySelector('.navbar').offsetHeight}px`;
        },
        italian() {
            return settings.format === 'it-IT';
        },
        user() {
            return global.user;
        },
        propic() {
            return `url(${global.profile.propic})`;
        },
        list() {
            return global.calendars?.filter(calendar => calendar.title !== 'Personal');
        },
        personal() {
            if (this.user)
                return global.calendars.find(calendar => calendar.title === 'Personal')?.show;
        },
        view() {
            return this.$route.name;
        }
    },
    methods: {
        enter(event) {
            if (!global.touch) {
                if (!event.target.closest('.edit')) {
                    if (event.target.closest('.list')) {
                        event.target.classList.remove('bg-body');
                        event.target.querySelector('.edit')?.classList.remove('bg-body-secondary');
                    } else
                        event.target.classList.remove('bg-body-tertiary');

                    event.target.classList.add('bg-body-secondary');
                    event.target.querySelector('.edit')?.classList.add('bg-body-tertiary');
                } else {
                    event.target.closest('.edit')?.classList.remove('bg-body-tertiary');
                    event.target.closest('.edit')?.classList.add('background-secondary');

                    event.target.closest('.calendar').classList.remove('bg-body-secondary');
                    event.target.closest('.calendar').classList.add('bg-body');
                }
            }
        },
        leave(event) {
            if (!event.target.closest('.edit')) {
                event.target.classList.remove('bg-body-secondary');
                event.target.querySelector('.edit')?.classList.remove('bg-body-tertiary');

                if (event.target.closest('.list')) {
                    event.target.classList.add('bg-body');
                    event.target.querySelector('.edit')?.classList.add('bg-body-secondary');
                } else
                    event.target.classList.add('bg-body-tertiary');
            } else {
                event.target.closest('.edit')?.classList.remove('background-secondary');
                event.target.closest('.edit')?.classList.add('bg-body-tertiary');

                event.target.closest('.calendar').classList.remove('bg-body');
                event.target.closest('.calendar').classList.add('bg-body-secondary');
            }
        },
        close() {
            document.querySelector('.spacer').style.width = '0';
            if (!this.backdrop)
                sessionStorage.setItem('menu', JSON.stringify(false));
        },
        click(event, calendar) {
            const target = event.target.closest('.new, .edit, .notes, .agenda');

            if (target?.classList.contains('new')) {
                this.edit = null;
                requestAnimationFrame(() =>
                    document.querySelector('.menu .toggler').click());
            } else if (target?.classList.contains('edit')) {
                this.edit = calendar;
                requestAnimationFrame(() =>
                    document.querySelector('.menu .toggler').click());
            } else if (target?.classList.contains('notes')) {
                const view = document.querySelector('.view');
                view.classList.add('disappear');
                setTimeout(() => {
                    view.classList.remove('disappear');
                    view.classList.add('appear');

                    sessionStorage.setItem('target', this.$route.params.target)
                    this.$router.push({ name: 'notes' });

                    setTimeout(() =>
                        view.classList.remove('appear'),
                        animations.refresh);
                }, animations.refresh);

            } else if (target?.classList.contains('agenda')) {
                const view = document.querySelector('.view');
                view.classList.add('disappear');
                setTimeout(() => {
                    view.classList.remove('disappear');
                    view.classList.add('appear');

                    const now = new Date(Date.now())
                    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    this.$router.push({ name: 'weekly', params: { target: sessionStorage.getItem('target') || target.getTime() } });

                    setTimeout(() =>
                        view.classList.remove('appear'),
                        animations.refresh);
                }, animations.refresh);
            }
            if (this.backdrop)
                document.querySelector('.menu .close').click();
        },
        hidden(calendar) {
            if (calendar === 'personal')
                calendar = global.calendars.find(calendar => calendar.title === 'Personal');
            return {
                'bg-body-tertiary': !calendar?.show
            }
        },
        async show(event, calendar) {
            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            const personal = global.calendars.findIndex(calendar => calendar.title === 'Personal'),
                target = event.target.closest('.checkbox') ||
                    event.target.closest('.calendar').querySelector('.checkbox');

            if (!event.target.closest('.edit')) {
                if (calendar === 'personal')
                    calendar = global.calendars[personal];

                for (const event of global.events.filter(event => event.calendar === calendar._id)) {
                    Array.from(document.querySelectorAll('.event'))
                        .filter(item => item.getAttribute('data-event') === event._id)
                        .forEach(element => element.classList.add(!calendar.show ? 'appear' : 'disappear'));
                }
                await delay(animations.refresh);
                calendar.show = !calendar.show;

                for (const event of global.events.filter(event => event.calendar === calendar._id)) {
                    Array.from(document.querySelectorAll('.event'))
                        .filter(item => item.getAttribute('data-event') === event._id)
                        .forEach(element => element.classList.remove(!calendar.show ? 'appear' : 'disappear'));
                }

                if (!calendar.show)
                    target.classList.add('bg-body-tertiary');
                else
                    target.classList.remove('bg-body-tertiary');

                try {
                    await axios.put('/api/calendars/update', calendar, { params: { title: calendar.title, id: calendar._id } });
                } catch (error) {
                    console.error('Error while updating calendar:', error);
                }
            }
        },
        dot(color) {
            return luminance(color) ? '#000000' : '#FFFFFF';
        }
    },
    watch: {
        backdrop() {
            document.querySelector('.offcanvas-backdrop')?.remove();
            const spacer = document.querySelector('.spacer');
            if (spacer) {
                spacer.style.transition = 'none';
                spacer.style.width = '0';
                requestAnimationFrame(() => spacer.style.transition = 'width 0.3s ease-in-out');
            }
            this.updated = false;
            this.$nextTick(() =>
                this.updated = true);
        }
    },
    mounted() {
        this.mounted = true;

        if (!global.touch) {
            const menu = document.getElementById('menu');
            if (menu) {
                this.offcanvasInstance = new bootstrap.Offcanvas(menu, {
                    keyboard: false
                });
            }
        }
    },
    unmounted() {
        this.updated = true;
        this.mounted = null;
        this.edit = null;
    }
};
</script>

<style>
.menu {
    width: 11.7rem !important;
}

@media (hover: hover) and (pointer: fine) {

    .menu .offcanvas-header button:hover,
    .menu .timemachine:hover button,
    .menu .activities:hover button,
    .menu .notes:hover button,
    .menu .agenda:hover button {
        background-color: var(--bs-secondary-bg) !important;
    }
}

.menu .offcanvas-header {
    padding: 0.5rem;
}

.menu .offcanvas-body {
    padding: 0.5rem;
    padding-top: 0.9rem;
}

.menu .offcanvas-header button,
.menu .agenda,
.menu .activities,
.menu .new,
.menu .timemachine {
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

.menu .offcanvas-header button:active {
    transform: scale(var(--pop-md));
}

.menu .agenda:active,
.menu .notes:active,
.menu .activities:active,
.menu .timemachine:active,
.menu .calendar:active,
.menu .new:active {
    transform: scale(var(--pop-xl));
}

.menu .profile,
.menu .settings,
.menu .close {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    border: none;
    padding: 0;
}

.menu .profile {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.menu .settings {
    margin-right: 0.3rem;
}

@media (hover: none) and (pointer: coarse) {
    .menu .close {
        background-color: var(--bs-body-bg) !important;
    }
}

.menu .offcanvas-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.menu .agenda,
.menu .notes,
.menu .activities,
.menu .timemachine {
    display: flex;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}

.menu .agenda>div,
.menu .notes>div,
.menu .activities>div,
.menu .timemachine>div {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0 0 1rem;
    height: 1.75rem;
    width: 2.2rem;
}

.menu .agenda button,
.menu .notes button,
.menu .activities button,
.menu .timemachine button {
    display: flex;
    align-items: center;
    justify-content: left;
    font-size: 0.75rem;
    padding-left: 0.55rem;
    border-radius: 0 1rem 1rem 0;
    height: 1.75rem;
    width: 100%;
    border: none;
}

.menu i {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
    padding-right: 0.4rem;
}

.menu .message i {
    all: unset
}

.menu .offcanvas-header i,
.menu .new i {
    justify-content: center;
    padding-right: 0;
}

.menu .close i {
    font-size: 0.8rem;
    padding-right: 0.15rem;
}

.menu .edit i {
    position: relative;
    padding: 0;
    left: 2.5px;
    bottom: 1px;
}

.menu .profile .bi-person-fill {
    font-size: 0.9rem;
    padding-bottom: 0.05rem;
}

.menu .profile .bi-person-plus-fill {
    font-size: 0.85rem;
    padding-left: 0.1rem;
    padding-bottom: 0.1rem;
}

.menu .settings i {
    font-size: 0.85rem;
}

.menu .notes i {
    font-size: 0.76rem;
}

.menu .agenda i {
    font-size: 0.7rem;
}

.menu .activities i {
    position: relative;
    top: 1px;
    left: 0.5px;
    font-size: 0.85rem;
}

.menu .timemachine i {
    font-size: 0.8rem;
}

.menu .calendar i {
    font-size: 0.6rem;
}

.menu .list .new i {
    font-size: 0.98rem !important;
}

.menu .message {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-radius: 1rem;
    font-size: 0.7rem;
    white-space: pre-line;
    text-align: center;
}

.menu .list button {
    font-size: 0.7rem;
    border-radius: 0 1rem 1rem 0;
    height: 1.75rem;
    width: 100%;
    border: none;
}

.menu .list {
    width: 100%;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
    padding: 0.2rem;

    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
}

.menu .list>div {
    flex-grow: 1;
    overflow-y: auto;
}

.menu .list .new,
.menu .calendar {
    height: 1.75rem;
    width: 100%;
    border-radius: 1rem !important;
    padding-left: 0.4rem;
    padding-right: 0.25rem;
    display: flex;
    align-items: center;
    font-size: 0.7rem;
    gap: 0.65rem;
    margin-bottom: 0.2rem;
}

.menu .list .new {
    padding-left: 0.25rem;
    gap: 0.65rem;
}

.menu .list hr {
    margin-top: 0.4rem;
    margin-bottom: 0.4rem;
}

.menu .list .new>div,
.menu .calendar .edit {
    height: 1.3rem;
    width: 1.3rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.menu .list .new>div i {
    font-size: 0.9rem;
}

.menu .list .new span,
.menu .calendar span {
    margin-right: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.menu .calendar .checkbox {
    height: 1.1rem;
    width: 1.1rem;
    border-radius: 1rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.menu .calendar .checkbox>div {
    height: 0.4rem;
    width: 0.4rem;
    border-radius: 1rem;
}

.menu .personal .checkbox>div {
    background-color: var(--text-primary);
}

.menu .personal .checkbox {
    background-color: var(--background-primary);
}

.menu .disable {
    pointer-events: none;
    opacity: 0.8;
}

.menu .disable>div {
    background-color: var(--bs-tertiary-bg) !important;
}
</style>