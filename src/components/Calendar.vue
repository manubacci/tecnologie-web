<template>
    <div class="calendar modal fade" id="modal-calendar" :inert="inert">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header bg-body-tertiary">
                    <h6 class="modal-title">
                        {{ calendar
                            ? italian ? "Modifica Calendario" : "Edit Calendar"
                            : italian ? "Nuovo Calendario" : "New Calendar" }}
                    </h6>
                    <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="modal">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">

                    <div class="form-label">
                        {{ italian ? "Nome e Aspetto" : "Name & Appearance" }}
                    </div>
                    <div class="title input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"><i class="bi bi-type"></i></span>
                        <input name="title" type="text" class="form-control bg-body-tertiary"
                            :placeholder="italian ? 'Nome del Calendario' : 'Calendar Name'" :value="selection.title"
                            @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                    </div>
                    <div v-show="alert.title" class="alert">
                        {{ italian
                            ? "Esiste già un calendario con lo stesso nome."
                            : "A calendar with the same name already exists.." }}
                    </div>
                    <div class="color bg-body-tertiary">
                        <span class="bg-body-secondary"><i class="bi bi-palette-fill"></i></span>
                        <div class="form-check bg-body-tertiary" @mouseenter="enter" @mouseleave="leave">
                            <label class="form-check-label" for="calendar-color">
                                {{ italian ? "Colore" : "Color" }}
                            </label>
                            <input id="calendar-color" class="form-check-input border" :class="border" type="color"
                                :value="selection.color || '#000000'">
                        </div>
                    </div>
                    <div v-show="alert.color" class="alert">
                        {{ italian
                            ? "Il colore selezionato è troppo simile a uno dei colori di sfondo."
                            : "The selected color is too similar to one of the background colors." }}
                    </div>
                </div>

                <div class="modal-footer">
                    <button v-show="calendar" data-bs-dismiss="modal" class="delete" @click="drop">
                        {{ italian ? "Elimina" : "Delete" }}
                    </button>
                    <button class="exit" data-bs-dismiss="modal">
                        {{ italian ? "Esci" : "Close" }}
                    </button>
                    <button class="save" @click="save">
                        {{ italian ? "Salva" : "Save" }}
                    </button>
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
import { distance } from '../utils/misc';

export default {
    props: {
        calendar: {
            type: Object
        }
    },
    data() {
        return {
            selection: {
                title: null,
                color: null
            },
            alert: {
                color: null,
                title: null
            },
            picking: null,
            hover: null,
            inert: true,
            restore: null
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        border() {
            return {
                [`border-${settings.theme}`]: true
            }
        }
    },
    methods: {
        enter(event) {
            const target = event.target.closest('button, .form-control, .form-check');
            this.hover = target;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-tertiary');
                target.classList.add('bg-body-secondary', 'text-body');
            }
        },
        leave(event, mantain) {
            const target = event.target.closest('button, .form-control, .form-check');
            if (!mantain)
                this.hover = null;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-secondary', 'text-body');
                target.classList.add('bg-body-tertiary');
            }
        },
        load() {
            this.inert = false;
            if (this.calendar) {
                this.selection = {
                    title: this.calendar.title,
                    color: this.calendar.color
                };
            } else {
                this.selection = {
                    title: null,
                    color: getComputedStyle(document.documentElement).getPropertyValue('--background-primary').trim()
                };
                this.$el.querySelector('.modal-footer .save').disabled = true;
            }
            this.alert = {
                color: null,
                title: null
            };
            this.$el.querySelector('.color').classList.remove('warning');
            this.$el.querySelector('.title').classList.remove('warning');
            this.picking = false;
            this.hover = null;
            this.restore = false;
            if (!global.touch)
                setTimeout(() => {
                    const title = this.$el.querySelector('.title input');
                    title.focus();
                    title.classList.remove('bg-body-tertiary');
                    title.classList.add('bg-body-secondary');
                }, animations.open);
        },
        hide() {
            this.inert = true;
        },
        input(event) {
            this.$el.querySelectorAll('.modal-body button, .form-control, .form-check').forEach(element =>
                this.leave({ target: element }, true));
            this.restore = true;

            if (event.target.closest('.title')) {
                event.target.value = event.target.value.replace(/^\s+/, "");
                this.selection.title = event.target.value;
                this.alert.title = null;
                this.$el.querySelector('.title').classList.remove('warning');

                if (!this.selection.title)
                    this.$el.querySelector('.modal-footer .save').disabled = true;
                else this.$el.querySelector('.modal-footer .save').disabled = false;

            } else if (event.target.closest('.color')) {
                this.selection.color = event.target.value;
                this.alert.color = null;
                this.$el.querySelector('.color').classList.remove('warning');
            }
        },
        focus(event) {
            const picker = event.target.closest('.color');
            let target = !picker
                ? this.$el.querySelector('.form-control')
                : this.$el.querySelector('.form-check');

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
        release(event) {
            const picker = event.target.closest('.color');
            const target = !picker
                ? this.$el.querySelector('.form-control')
                : this.$el.querySelector('.form-check');

            target.classList.remove('focus')

            if (this.hover !== target) {
                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');
            }

            if (this.picking)
                setTimeout(() => this.picking = false, 501);
        },
        lose(event) {
            const target = event.target.closest('.form-control');
            target.blur();
            if (!global.touch) {
                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');
                this.save();
            }
        },
        recover() {
            if (this.restore && this.hover) {
                this.restore = false;
                this.enter({ target: this.hover });
            }
        },
        async drop() {
            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            const alert = confirm(this.italian
                ? 'Attenzione! Procedendo con l\'eliminazione del calendario tutti i dati e gli elementi ad esso associati saranno definitivamente rimossi. Desideri comunque continuare?'
                : 'Attention! By proceeding with the deletion of the calendar, all associated data and items will be permanently removed. Do you want to continue?');

            if (!alert)
                return;

            for (const event of global.events.filter(event => event.calendar === this.calendar._id)) {
                try {
                    const elements =
                        Array.from(document.querySelectorAll('.event'))
                            .filter(item => item.getAttribute('data-event') === event._id);

                    elements.forEach(element => element.classList.add('remove'));
                    await delay(animations.visibility);

                    await axios.get('/api/events/drop', { params: { id: event._id } });
                    global.events = global.events.filter(item => item._id !== event._id);

                    elements.forEach(element => element.classList.remove('remove'));
                } catch (error) {
                    console.error('Error while deleting events:', error);
                }
            }
            try {
                const calendar = Array.from(document.querySelectorAll('.menu .calendar'))
                    .find(calendar => calendar.getAttribute('data-calendar') == this.calendar._id);

                this.$el.querySelector('.close').click();

                calendar.classList.add('remove');
                await delay(animations.visibility);

                await axios.get('/api/calendars/drop', { params: { id: this.calendar._id } });
                global.calendars = global.calendars.filter(calendar => calendar._id !== this.calendar._id);

                calendar.classList.remove('remove');
            } catch (error) {
                console.error('Error while deleting calendars:', error);
            }
        },
        async save() {
            if (this.$el.querySelector('.modal-footer .save').disabled)
                return;

            this.alert.color = distance('#212529', this.selection.color) || distance('#FFFFFF', this.selection.color);
            if (this.alert.color) {
                this.$el.querySelector('.color').classList.add('warning');
                return;
            }

            if (this.selection.title === 'Personal' || this.selection.title === 'Personale') {
                this.alert.title = true;
                let title = this.$el.querySelector('.title');
                title.classList.add('warning');
                title = title.querySelector('input');
                title.focus();
                title.classList.remove('bg-body-tertiary');
                title.classList.add('bg-body-secondary');
                return;
            }
            try {
                const data = {
                    title: this.selection.title.trim(),
                    color: this.selection.color
                }
                data.show = true;
                data.user = global.user;

                const response = await axios.put('/api/calendars/update', data, { params: { id: this.calendar?._id } });
                if (response.data.calendar) {
                    this.$el.querySelector('.close').click();

                    if (this.calendar) {
                        const index = global.calendars.findIndex(calendar => calendar.title === this.calendar.title);
                        global.calendars[index] = response.data.calendar;
                    } else
                        global.calendars.push(response.data.calendar);

                    global.calendars = global.calendars.sort((a, b) => a.title.localeCompare(b.title));
                    requestAnimationFrame(() => {
                        const calendar = Array.from(document.querySelectorAll('.menu .calendar'))
                            .find(calendar => calendar.getAttribute('data-calendar') == response.data.calendar._id);

                        calendar.classList.add('add');
                        setTimeout(() =>
                            calendar.classList.remove('add'),
                            animations.visibility);
                    });
                } else {
                    this.alert.title = true;
                    let title = this.$el.querySelector('.title');
                    title.classList.add('warning');
                    title = title.querySelector('input');
                    title.focus();
                    title.classList.remove('bg-body-tertiary');
                    title.classList.add('bg-body-secondary');
                }
            } catch (error) {
                console.error('Error while updating calendar:', error);
            }
        }
    },
    mounted() {
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.form-control, .form-check-input').forEach(element =>
            element.addEventListener('input', this.input));

        if (!global.touch) {
            this.$el.addEventListener('pointermove', this.recover);
            this.$el.querySelectorAll('.form-control, .form-check-input').forEach(element =>
                element.addEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control, .form-check-input').forEach(element =>
                element.addEventListener('blur', this.release));
        }
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.form-control, .form-check-input').forEach(element =>
            element.removeEventListener('input', this.input));

        if (!global.touch) {
            this.$el.removeEventListener('pointermove', this.recover);
            this.$el.querySelectorAll('.form-control, .form-check-input').forEach(element =>
                element.removeEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control, .form-check-input').forEach(element =>
                element.removeEventListener('blur', this.release));
        }

        this.selection = {
            title: null,
            color: null
        };
        this.alert = {
            color: null,
            title: null
        };
        this.picking = null;
        this.hover = null;
        this.inert = true;
        this.restore = null;
    },
}
</script>

<style>
.calendar .modal-header {
    height: 3rem;
    padding: 0.5rem;
    padding-left: 0.9rem;
}

.calendar .modal-body {
    padding: 0.9rem;
    padding-top: 0.75rem;
    padding-bottom: 0.7rem;
}

.calendar .form-label {
    font-size: 0.8rem;
    padding-top: 0.25rem;
}

.calendar .modal-footer {
    height: 3rem;
    padding: 0.5rem;
}

.calendar .modal-header .close {
    border-radius: 50%;
    border: none;
}

@media (hover: none) and (pointer: coarse) {
    .calendar .modal-header .close {
        background-color: var(--bs-body-bg) !important;
    }
}

@media (hover: hover) and (pointer: fine) {
    .calendar .modal-header button:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .calendar .modal-footer button:hover:not(:disabled) {
        background-color: var(--bs-secondary-bg) !important;
        color: var(--bs-body-color) !important;
    }
}

.calendar .modal-header button,
.calendar .modal-footer button,
.calendar .input-group,
.calendar .color {
    transition: transform 0.1s ease-out;
    cursor: pointer;
    z-index: 2;
}

.calendar .modal-header button:active {
    transform: scale(var(--pop-md));
}

.calendar .modal-footer button:active:not(:disabled) {
    transform: scale(var(--pop-lg));
}

.calendar .input-group:active,
.calendar .color:active {
    transform: scale(var(--pop-xxl));
}

.calendar .input-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}


.calendar .form-control {
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    border: none;
    box-shadow: none;
    line-height: 1.8;
    cursor: pointer;
}

.calendar .color {
    display: flex;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}

.calendar span:has(i) {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0 0 1rem;
    height: 2rem;
    width: 2rem;
    border: none;
}

.calendar .input-group-text {
    width: 2.05rem;
}

.calendar .form-check {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    width: 100%;
    padding-left: 0.2rem;
    border: none;
    cursor: pointer;
    margin: 0;
}

.calendar .form-check-input {
    position: relative;
    right: 0.5rem;
    height: 1.1rem;
    width: 1.17rem;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    z-index: 1;
    cursor: pointer;
    border-width: 0.15rem !important;
}

.calendar .form-check-label {
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    height: 100%;
    width: 100%;
}

.calendar .color .form-check-input::-webkit-color-swatch {
    border-radius: 50%;
    border: none;
    margin: 0;
}

.calendar .form-check-input:focus {
    outline: none;
    box-shadow: none;
}

.calendar .modal-body i {
    position: relative;
}

.calendar .color i {
    font-size: 0.78rem;
    left: 1.5px;
}

.calendar .title i {
    font-size: 0.88rem;
    left: 0.5px;
}

.calendar .close i {
    position: relative;
    top: 0.5px;
}

.calendar .modal-footer button {
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
    cursor: pointer;
    color: var(--text-secondary);
}

.calendar .modal-footer .delete {
    color: white;
    background-color: red;
    margin-right: auto;
}

.calendar .modal-footer .save {
    color: var(--text-primary);
    background-color: var(--background-primary);
}

.calendar .modal-footer .save:disabled {
    background-color: var(--bs-secondary-bg);
    color: inherit;
    cursor: inherit;
}

.calendar .modal-footer .exit {
    background-color: var(--background-secondary);
    margin-right: 0.5rem;
}

.calendar .alert {
    margin-bottom: 0.5rem;
    padding: 0;
    font-size: 0.7rem;
    color: red;
}

.calendar .warning {
    border: 0.11rem solid red !important;
}
</style>