<template>
    <div class="custom" @keydown.enter="save">
        <div v-show="type === 'repetition'">
            <div class="form-label">
                {{ italian ? "Frequenza" : "Frequency" }}
            </div>
            <li class="dropdown-submenu">
                <button class="frequency dropdown-item dropdown-toggle btn btn-sm bg-body-tertiary"
                    data-bs-toggle="dropdown" @mouseenter="enter" @mouseleave="leave">
                    {{ frequency }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <div class="dropdown-item" @click="choice('frequency', 'daily')">
                            {{ italian ? "Giornaliera" : "Daily" }}
                        </div>
                    </li>
                    <li>
                        <div class="dropdown-item" @click="choice('frequency', 'weekly')">
                            {{ italian ? "Settimanale" : "Weekly" }}
                        </div>
                    </li>
                    <li>
                        <div class="dropdown-item" @click="choice('frequency', 'monthly')">
                            {{ italian ? "Mensile" : "Monthly" }}
                        </div>
                    </li>
                    <li>
                        <div class="dropdown-item" @click="choice('frequency', 'yearly')">
                            {{ italian ? "Annuale" : "Yearly" }}
                        </div>
                    </li>
                </ul>
            </li>
            <div class="form-label">
                {{ italian ? "Intervallo" : "Interval" }}
            </div>
            <input name="interval" type="text" class="interval form-control bg-body-tertiary"
                :placeholder="(italian ? 'Numero di ' : 'Number of ') + placeholder" :value="custom.repetition.interval"
                @mouseenter="enter" @mouseleave="leave" @keydown.enter="lost">
            <div v-show="custom.repetition.frequency === 'weekly' || custom.repetition.frequency === 'monthly'">
                <div class="form-label">
                    {{ italian ? "Ricorrenza" : "Recurrence" }}
                </div>
                <div v-show="custom.repetition.frequency === 'monthly'" class="numbers">
                    <button v-for="number in numbers" :number="number" class="btn btn-sm bg-body-tertiary"
                        @click="choice('numbers', number)" @mouseenter="enter" @mouseleave="leave">{{ number }}</button>
                </div>
                <div class="weekdays">
                    <button v-for="day in weekdays" :day="day" class="btn btn-sm bg-body-tertiary"
                        @click="choice('weekdays', day)" @mouseenter="enter" @mouseleave="leave">{{ day[0] }}</button>
                </div>
            </div>
        </div>

        <div v-show="type === 'recurrence'">
            <div class="form-label">
                {{ italian ? "Ricorrenza" : "Recurrence" }}
            </div>
            <li class="dropdown-submenu">
                <button class="iteration dropdown-item dropdown-toggle btn btn-sm bg-body-tertiary"
                    data-bs-toggle="dropdown" @mouseenter="enter" @mouseleave="leave">
                    {{ iteration }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <div class="dropdown-item" @click="choice('iteration', 'times')">
                            {{ italian ? "Numero di Volte" : "Number of Times" }}
                        </div>
                    </li>
                    <li>
                        <div class="dropdown-item" @click="choice('iteration', 'deadline')">
                            {{ italian ? "Data di Scadenza" : "Endline Date" }}
                        </div>
                    </li>
                </ul>
            </li>
            <input v-show="custom.recurrence.iteration === 'times'" name="times" type="text"
                class="times form-control bg-body-tertiary" placeholder="1" :value="custom.recurrence.times"
                @mouseenter="enter" @mouseleave="leave" @keydown.enter="lost">
            <input v-show="custom.recurrence.iteration === 'deadline'" name="deadline" type="date"
                class="deadline form-control bg-body-tertiary" :value="deadline" @mouseenter="enter" @mouseleave="leave"
                @keydown.enter="lost">
        </div>
    </div>
</template>

<script>
import { settings } from '../store/settings';
import { global } from '../store/global';
import { weekday, capitalize } from '../utils/misc';

export default {
    props: {
        type: {
            type: String
        },
        start: {
            type: String
        }
    },
    data() {
        return {
            hover: null
        }
    },
    computed: {
        target() {
            let target = this.start;
            if (target) {
                target = target.split('-');
                target = new Date(target[0], target[1] - 1, target[2]);
            } else
                target = new Date(parseInt(this.$route.params.target));
            return target;
        },
        italian() {
            return settings.format === 'it-IT';
        },
        custom() {
            return {
                repetition: global.repetition,
                recurrence: global.recurrence
            };
        },
        frequency() {
            switch (global.repetition.frequency) {
                case 'daily':
                    return this.italian ? 'Giornaliera' : 'Daily';
                case 'weekly':
                    return this.italian ? 'Settimanale' : 'Weekly';
                case 'monthly':
                    return this.italian ? 'Mensile' : 'Monthly';
                case 'yearly':
                    return this.italian ? 'Annuale' : 'Yearly';
            }
        },
        iteration() {
            switch (global.recurrence.iteration) {
                case 'times':
                    return this.italian ? 'Numero di Volte' : 'Number of Times';
                case 'deadline':
                    return this.italian ? 'Data di Scadenza' : 'Deadline Date';
            }
        },
        placeholder() {
            switch (global.repetition.frequency) {
                case 'daily':
                    return this.italian ? 'Giorni' : 'Days';
                case 'weekly':
                    return this.italian ? 'Settimane' : 'Weeks';
                case 'monthly':
                    return this.italian ? 'Mesi' : 'Months';
                case 'yearly':
                    return this.italian ? 'Anni' : 'Years';
            }
        },
        weekdays() {
            const target = new Date(this.target);
            target.setDate(target.getDate() - (weekday(target) + 1));

            return Array.from({ length: 7 }).map((_, i) => {
                target.setDate(target.getDate() + 1);
                return this.locale(target);
            });
        },
        numbers() {
            return Array.from({ length: 5 }).map((_, i) => {
                return (i + 1) + (this.italian ? '°' : 'th');
            });
        },
        deadline() {
            if (global.recurrence.deadline === 0) {
                if (this.start)
                    global.recurrence.deadline = this.start;
                else {
                    const target = new Date(parseInt(this.$route.params.target));
                    global.recurrence.deadline = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
                }
            }
            return global.recurrence.deadline;
        },
        watchers() {
            return {
                weekdays: global.repetition.weekdays,
                numbers: global.repetition.numbers
            };
        },
    },
    methods: {
        enter(event) {
            const target = event.target.closest('button, .form-control');
            this.hover = target;
            if (!global.touch && !target.classList.contains('focus') && !target.classList.contains('text-white')) {
                target.style.backgroundColor = 'red !important';
                target.classList.remove('bg-body-tertiary');
                target.classList.add('bg-body-secondary');
            }
        },
        leave(event) {
            const target = event.target.closest('button, .form-control');
            this.hover = null;
            if (!global.touch && !target.classList.contains('focus') && !target.classList.contains('text-white')) {
                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');
            }
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
        lost(event) {
            const target = event.target.closest('.form-control');
            target.blur();
            if (!global.touch && this.hover === target) {
                target.classList.remove('bg-body-tertiary');
                target.classList.add('bg-body-secondary');
            }
        },
        choice(type, selection) {
            switch (type) {
                case 'frequency':
                    global.repetition = {
                        frequency: selection,
                        interval: null,
                        numbers: [],
                        weekdays: []
                    };
                    if (global.repetition.frequency === 'weekly') {
                        global.repetition.weekdays = [this.locale(this.target)];
                    }
                    if (!global.touch)
                        requestAnimationFrame(() => {
                            const interval = this.$el.querySelector('.interval');
                            interval.focus();
                            interval.classList.remove('bg-body-tertiary');
                            interval.classList.add('bg-body-secondary');
                        });
                    this.$el.querySelector('.frequency').click();
                    break;
                case 'weekdays':
                    if (!global.repetition.weekdays.includes(selection)) {
                        if (global.repetition.frequency === 'monthly' && global.repetition.weekdays.length == 0)
                            global.repetition.numbers = ['1' + (this.italian ? '°' : 'th')];

                        global.repetition.weekdays = [...global.repetition.weekdays, selection];
                    } else {
                        if (global.repetition.frequency !== 'weekly' || global.repetition.weekdays.length > 1)
                            global.repetition.weekdays = global.repetition.weekdays.filter(item => item !== selection);

                        if (global.repetition.frequency === 'monthly' && global.repetition.weekdays.length == 0)
                            global.repetition.numbers = [];
                    };
                    break;
                case 'numbers':
                    if (!global.repetition.numbers.includes(selection)) {
                        if (global.repetition.numbers.length == 0)
                            global.repetition.weekdays = [this.locale(this.target)];
                        global.repetition.numbers = [...global.repetition.numbers, selection];
                    } else {
                        global.repetition.numbers = global.repetition.numbers.filter(item => item !== selection);
                        if (global.repetition.numbers.length == 0)
                            global.repetition.weekdays = [];
                    };
                    break;
                case 'iteration':
                    if (global.recurrence.iteration !== selection) {
                        global.recurrence = {
                            iteration: selection,
                            times: 1,
                            deadline: 0
                        };
                        this.$el.querySelector('.deadline').classList.remove('warning');
                    }
                    if (!global.touch)
                        requestAnimationFrame(() => {
                            const item = global.recurrence.iteration === 'times'
                                ? this.$el.querySelector('.times')
                                : this.$el.querySelector('.deadline');
                            item.focus();
                            item.classList.remove('bg-body-tertiary');
                            item.classList.add('bg-body-secondary');
                        });
                    this.$el.querySelector('.iteration').click();
                    break;
            }
        },
        locale(target) {
            return capitalize(target
                .toLocaleDateString(settings.format, { weekday: 'short' }));
        },
        save() {
            document.querySelector('.update').click();
        },
        input(event) {
            if (event.target.closest('.interval')) {
                const regex = /^\d+$/;

                if (!regex.test(event.target.value))
                    event.target.value = event.target.value.replace(/[^0-9]/g, '');

                if (event.target.value && (event.target.value < 1 || event.target.value > 999))
                    event.target.value = global.repetition.interval;
                global.repetition.interval = event.target.value;

            } else if (event.target.closest('.times')) {
                const regex = /^\d+$/;

                if (!regex.test(event.target.value))
                    event.target.value = event.target.value.replace(/[^0-9]/g, '');

                if (event.target.value && (event.target.value < 1 || event.target.value > 999))
                    event.target.value = global.recurrence.times;
                global.recurrence.times = event.target.value;
            } else if (event.target.closest('.deadline')) {
                global.recurrence.deadline = event.target.value;

                if (event.target.value) {
                    let date = event.target.value.split('-');
                    date = new Date(date[0], date[1] - 1, date[2]);

                    let start = this.start;
                    if (!start)
                        start = new Date(parseInt(this.$route.params.target));
                    else {
                        start = start.split('-');
                        start = new Date(start[0], start[1] - 1, start[2]);
                    }
                    if (date.getTime() < start.getTime())
                        this.$el.querySelector('.deadline').classList.add('warning');
                    else
                        this.$el.querySelector('.deadline').classList.remove('warning');
                } else
                    this.$el.querySelector('.deadline').classList.add('warning');
            }
        }
    },
    mounted() {
        this.$el.querySelectorAll('.custom .dropdown-submenu, .custom button').forEach(item =>
            item.addEventListener('click', (event) =>
                event.stopPropagation()));

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.addEventListener('input', this.input));

        if (!global.touch) {
            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('blur', this.release));

            this.$el.querySelectorAll('.dropdown-submenu').forEach(element => {
                element.focus = (event) => this.focus(event, element);
                element.release = (event) => this.release(event, element);
                element.addEventListener('show.bs.dropdown', element.focus);
                element.addEventListener('hidden.bs.dropdown', element.release);
            });
        };
    },
    unmounted() {
        this.$el.querySelectorAll('.custom .dropdown-submenu, .custom button').forEach(item =>
            item.removeEventListener('click', (event) =>
                event.stopPropagation()));

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.removeEventListener('input', this.input));

        if (!global.touch) {
            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('blur', this.release));

            this.$el.querySelectorAll('.dropdown-submenu').forEach(element => {
                element.removeEventListener('show.bs.dropdown', element.focus);
                element.removeEventListener('hidden.bs.dropdown', element.release);
            });
        };
    },
    watch: {
        watchers() {
            this.$el.querySelectorAll('.weekdays button').forEach(item => {
                if (this.watchers.weekdays.includes(item.getAttribute('day'))) {
                    item.classList.remove('bg-body-secondary', 'bg-body-tertiary');
                    item.classList.add('text-white', 'background-secondary');
                } else {
                    item.classList.remove('text-white', 'background-secondary');
                    if (!global.touch && this.hover === item) item.classList.add('bg-body-secondary');
                    else item.classList.add('bg-body-tertiary')
                }
            });

            this.$el.querySelectorAll('.numbers button').forEach(item => {
                if (this.watchers.numbers.includes(item.getAttribute('number'))) {
                    item.classList.remove('bg-body-secondary', 'bg-body-tertiary');
                    item.classList.add('text-white', 'background-secondary');
                } else {
                    item.classList.remove('text-white', 'background-secondary');
                    if (!global.touch && this.hover === item) item.classList.add('bg-body-secondary');
                    else item.classList.add('bg-body-tertiary')
                }
            });
        }
    }
}
</script>

<style>
.custom {
    width: 15rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-top: 0.25rem;
}

.custom .dropdown-item {
    height: 2rem;
    padding-left: 0.8rem;
    display: flex;
    align-items: center;
    border-radius: 0 !important;
}

.custom .dropdown-menu li:nth-of-type(1) .dropdown-item {
    border-top-left-radius: 5px !important;
    border-top-right-radius: 5px !important;
}

.custom .dropdown-menu li:nth-last-of-type(1) .dropdown-item {
    border-bottom-left-radius: 5px !important;
    border-bottom-right-radius: 5px !important;
}

.custom .dropdown-menu li:nth-of-type(even) .dropdown-item {
    background-color: var(--bs-tertiary-bg);
}

.custom .frequency,
.custom .interval,
.custom .iteration,
.custom .times,
.custom .deadline {
    border-radius: 1rem !important;
    height: 1.75rem !important;
    padding-left: 1rem !important;
    font-size: 0.7rem !important;
    margin-bottom: 0.5rem !important;
}

.custom .deadline::-webkit-calendar-picker-indicator {
    font-size: 0.65rem !important;
    padding: 0.3rem !important;
    left: 0.4rem !important;
}

.custom .numbers,
.custom .weekdays {
    display: flex;
    gap: 0.15rem;
}

.custom .numbers {
    margin-bottom: 0.25rem;
}

.custom .weekdays {
    margin-bottom: 0.5rem;
}

.custom .numbers button,
.custom .weekdays button {
    display: flex !important;
    justify-content: center !important;
    border-radius: 1rem !important;
    font-size: 0.6rem !important;
    width: 100% !important;
    overflow: hidden;
    height: 1.75rem !important;
}

.custom .form-label {
    font-size: 0.7rem !important;
    margin-bottom: 0.35rem !important;
}

.custom .warning {
    border: 0.05rem solid red !important;
}
</style>