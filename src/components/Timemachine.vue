<template>
    <div class="timemachine modal fade" id="modal-timemachine" :inert="inert">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-body-tertiary">
                    <h6 class="modal-title">
                        {{ italian ? "Macchina del Tempo" : "Time Machine" }}
                    </h6>
                    <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="modal">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-label">
                        {{ italian ? "Data" : "Date" }}
                    </div>
                    <div class="date input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"><i class="bi bi-calendar-event"></i></span>
                        <input name="timemachine-day" type="date" class="form-control bg-body-tertiary"
                            :value="selection.date" @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                    </div>
                    <div class="time input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"><i class="bi bi-clock"></i></span>
                        <input name="timemachine-time" type="time" class="form-control bg-body-tertiary"
                            :value="selection.time" @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="reset" data-bs-dismiss="modal" @click="(event) => save(event, true)">
                        {{ italian ? "Ripristina" : "Reset" }}
                    </button>
                    <div>
                        <button class="exit" data-bs-dismiss="modal">
                            {{ italian ? "Esci" : "Close" }}
                        </button>
                        <button class="save" data-bs-dismiss="modal" @click="save">
                            {{ italian ? "Salva" : "Save" }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';

export default {
    props: {
        event: {
            type: Event
        }
    },
    data() {
        return {
            selection: {
                date: null,
                time: null
            },
            hover: null,
            inert: true,
            restore: null
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        }
    },
    methods: {
        enter(event) {
            const target = event.target.closest('.form-control, button');
            this.hover = target;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-tertiary');
                target.classList.add('bg-body-secondary', 'text-body');
            }
        },
        leave(event, mantain) {
            const target = event.target.closest('.form-control, button');
            if (!mantain)
                this.hover = null;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-secondary', 'text-body');
                target.classList.add('bg-body-tertiary');
            }
        },
        load() {
            this.inert = false;
            const now = new Date(global.today.now);
            this.selection = {
                date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
                time: now.toLocaleTimeString(settings.format, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23'
                })
            }
            this.restore = false;
            this.hover = null;
            if (!global.touch)
                setTimeout(() => {
                    const date = this.$el.querySelector('.date input');
                    date.focus();
                    date.classList.remove('bg-body-tertiary');
                    date.classList.add('bg-body-secondary');
                }, animations.open);
            document.documentElement.style.setProperty('--timemachine-date-opacity', 1);
            document.documentElement.style.setProperty('--timemachine-time-opacity', 1);
            this.$el.querySelector('.save').disabled = false;
        },
        hide() {
            this.inert = true;
        },
        focus(event, element) {
            let target = !element
                ? event.target.closest('.form-control')
                : element.querySelector('.dropdown-toggle');

            target.classList.add('focus');
        },
        release(event, element) {
            let target = !element
                ? event.target.closest('.form-control')
                : element.querySelector('.dropdown-toggle');

            target.classList.remove('focus');
            if (this.hover !== target) {
                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');
            }
        },
        input(event) {
            this.$el.querySelectorAll('.modal-body button, .form-control').forEach(element =>
                this.leave({ target: element }, true));
            this.restore = true;

            if (event.target.closest('.date'))
                this.selection.date = event.target.value;
            else if (event.target.closest('.time'))
                this.selection.time = event.target.value;

            if (!(this.selection.date && this.selection.time))
                this.$el.querySelector('.save').disabled = true;
            else
                this.$el.querySelector('.save').disabled = false;

            if (!this.selection.date)
                document.documentElement.style.setProperty('--timemachine-date-opacity', 0.75);
            else document.documentElement.style.setProperty('--timemachine-date-opacity', 1);

            if (!this.selection.time)
                document.documentElement.style.setProperty('--timemachine-time-opacity', 0.75);
            else document.documentElement.style.setProperty('--timemachine-time-opacity', 1);
        },
        lose(event) {
            const target = event.target.closest('.form-control');
            target.blur();
            if (!global.touch) {
                this.$el.querySelectorAll('button, .form-control').forEach(element =>
                    this.leave({ target: element }, true));

                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');

                let siblings = Array.from(this.$el.querySelectorAll('.form-control[type="date"], .form-control[type="time"]'));
                const index = siblings.indexOf(target);

                function focalize(focus) {
                    focus.focus();
                    focus.classList.remove('bg-body-tertiary');
                    focus.classList.add('bg-body-secondary');
                }

                if (index < siblings.length - 1) {
                    const focus = siblings[index + 1];
                    focalize(focus);
                } else {
                    let i = 0;
                    let focus;
                    while (i < siblings.length) {
                        if (!siblings[i].value) {
                            focus = siblings[i];
                            break;
                        }
                        i++;
                    }
                    if (focus)
                        focalize(focus);
                    else
                        this.save();
                }
            }
        },
        recover() {
            if (this.restore && this.hover) {
                this.restore = false;
                this.enter({ target: this.hover });
            }
        },
        save(_, reset) {
            if (this.$el.querySelector('.save').disabled)
                return;

            const body = document.querySelector('body');
            body.classList.add('disappear');
            setTimeout(() => {
                setTimeout(() => {
                    body.classList.remove('disappear');
                    body.classList.add('appear');
                    setTimeout(() =>
                        body.classList.remove('appear'),
                        animations.close);

                    if (!reset) {
                        const date = this.selection.date.split('-');
                        const time = this.selection.time.split(':');
                        const today = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);
                        global.today.day = new Date(today);
                        global.today.now = new Date(today);
                        global.today.alpha = Date.now() - global.today.day.getTime();

                        const target = new Date(date[0], date[1] - 1, date[2]);
                        this.$router.push({ name: this.$route.name, params: { target: target.getTime() } });

                        sessionStorage.setItem('timemachine', JSON.stringify(global.today.alpha));
                    } else {
                        global.today.day = new Date(Date.now());
                        global.today.now = new Date(Date.now());
                        global.today.alpha = 0;

                        let target = global.today.day;
                        target = new Date(target.getFullYear(), target.getMonth(), target.getDate());
                        this.$router.push({ name: this.$route.name, params: { target: target.getTime() } });

                        sessionStorage.setItem('timemachine', null);
                    }
                }, animations.refresh);
            }, animations.refresh);

        }
    },
    mounted() {
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.addEventListener('input', this.input));

        if (!global.touch) {
            this.$el.addEventListener('pointermove', this.recover);

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('blur', this.release));
        }
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.removeEventListener('input', this.input));

        if (!global.touch) {
            this.$el.removeEventListener('pointermove', this.recover);

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('blur', this.release));
        }

        this.selection = {
            date: null,
            time: null
        }
        this.hover = null;
        this.inert = true;
        this.restore = null;
    }
}
</script>

<style>
.timemachine .modal-header {
    height: 3rem;
    padding: 0.5rem;
    padding-left: 0.9rem;
}

.timemachine .modal-body {
    padding: 0.9rem;
}

.timemachine .form-label {
    font-size: 0.8rem;
}

.timemachine .modal-footer {
    height: 3rem;
    padding: 0.5rem;
    justify-content: space-between;
}

.timemachine .modal-header .close {
    border-radius: 50%;
    border: none;
}

@media (hover: none) and (pointer: coarse) {
    .timemachine .modal-header .close {
        background-color: var(--bs-body-bg) !important;
    }
}

@media (hover: hover) and (pointer: fine) {
    .timemachine .modal-header button:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .timemachine .modal-footer button:hover:not(:disabled) {
        background-color: var(--bs-secondary-bg) !important;
        color: var(--bs-body-color) !important;
    }
}

.timemachine .modal-header button,
.timemachine .modal-footer button,
.timemachine .input-group {
    transition: transform 0.1s ease-out;
    cursor: pointer;
    z-index: 2;
}

.timemachine .modal-header button:active {
    transform: scale(var(--pop-md));
}

.timemachine .modal-footer button:active:not(:disabled) {
    transform: scale(var(--pop-lg));
}

.timemachine .input-group:active {
    transform: scale(var(--pop-xxl));
}

.timemachine .input-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}

.timemachine .input-group-text {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0 0 1rem;
    height: 2rem;
    width: 2.05rem;
    border: none;
}

.timemachine .date .form-control::-webkit-datetime-edit {
    opacity: var(--timemachine-date-opacity);
}

.timemachine .time .form-control::-webkit-datetime-edit {
    opacity: var(--timemachine-time-opacity);
}

.timemachine .modal-header i,
.timemachine .modal-body i {
    position: relative;
}

.timemachine .close i {
    top: 0.5px;
}

.timemachine .date i {
    font-size: 0.74rem;
    left: 1px;
}

.timemachine .time i {
    font-size: 0.82rem;
    left: 1px;
}

.timemachine .form-control {
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    border: none;
    box-shadow: none;
    line-height: 1.8;
    cursor: pointer;
}

.timemachine .form-control::-webkit-calendar-picker-indicator {
    font-size: 0.75rem;
    background-color: var(--background-secondary);
    border-radius: 1rem;
    padding: 0.3rem;
    position: relative;
    left: 7px;
    cursor: pointer;
}


.timemachine .time .form-control::-webkit-calendar-picker-indicator {
    font-size: 0.8rem;
    padding: 0.25rem;
}

.timemachine .form-control::-webkit-datetime-edit-year-field:focus,
.timemachine .form-control::-webkit-datetime-edit-month-field:focus,
.timemachine .form-control::-webkit-datetime-edit-day-field:focus,
.timemachine .form-control::-webkit-datetime-edit-hour-field:focus,
.timemachine .form-control::-webkit-datetime-edit-minute-field:focus {
    color: var(--bs-secondary);
    background-color: inherit;
}

.timemachine .form-control::-webkit-date-and-time-value {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
}

.timemachine .modal-footer button {
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
    cursor: pointer;
    background-color: var(--background-secondary);
}

.timemachine .modal-footer>div {
    display: flex;
    margin: 0;
}

.timemachine .modal-footer .save {
    background-color: var(--background-primary);
    color: var(--text-primary);
}

.timemachine .modal-footer .save:disabled {
    background-color: var(--bs-secondary-bg);
    color: inherit;
    cursor: inherit;
}

.timemachine .modal-footer .exit {
    margin-right: 0.5rem;
}
</style>