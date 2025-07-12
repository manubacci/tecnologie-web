<template>
        <div class="editor modal fade" id="modal-editor" :inert="inert">
            <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-activities"></button>

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-body-tertiary">
                        <h6 class="modal-title">
                            {{ !editor.event
                                ? !selection.activity
                                    ? italian ? "Nuovo Evento" : "New Event"
                                    : italian ? "Nuova Attività" : "New Activity"
                                : !editor.edit
                                    ? !selection.activity
                                        ? italian ? "Informazioni Evento" : "Event Informations"
                                        : italian ? "Informazioni Attività" : "Update Informations"
                                    : !selection.activity
                                        ? italian ? "Aggiorna Evento" : "Update Event"
                                        : italian ? "Aggiorna Attività" : "Update Activity"
                            }}
                        </h6>
                        <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="modal">
                            <i class="bi bi-x" @click="click"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-label">
                            {{ italian ? "Titolo e Calendario" : "Title & Calendar" }}
                        </div>
                        <div class="title input-group bg-body-tertiary">
                            <span class="input-group-text bg-body-secondary"><i class="bi bi-type"></i></span>
                            <input name="title" type="text" class="form-control bg-body-tertiary"
                                :placeholder="italian ? 'Nome dell\'Evento' : 'Event Name'" :value="selection.title"
                                @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                        </div>
                        <div class="calendar dropdown bg-body-tertiary">
                            <span class="bg-body-secondary"><i class="bi bi-bookmark"></i></span>
                            <button class="dropdown-toggle btn btn-sm bg-body-tertiary" data-bs-toggle="dropdown"
                                @mouseenter="enter" @mouseleave="leave">
                                {{ calendar }}
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <div class="dropdown-item" @click="choice('calendar', 'personal')">
                                        {{ italian ? 'Personale' : 'Personal' }}
                                    </div>
                                </li>
                                <hr v-show="list.length > 0">
                                <li v-for="calendar in list">
                                    <div class="dropdown-item" @click="choice('calendar', calendar)">
                                        <span class="title">{{ calendar.title }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div v-show="!editor.event" class="activity bg-body-tertiary">
                            <span class="bg-body-tertiary"><i class="bi bi-alarm"></i></span>
                            <div class="form-check form-switch bg-body-tertiary" @mouseenter="enter"
                                @mouseleave="leave">
                                <label class="form-check-label" for="editor-activity">
                                    {{ italian ? 'Attività' : 'Activity' }}
                                </label>
                                <input id="editor-activity" class="form-check-input" type="checkbox"
                                    :checked="selection.activity" @click="choice('activity')">
                            </div>
                        </div>

                        <div class="form-label">
                            {{ italian ? "Orario" : "Time" }}
                        </div>
                        <div v-show="!selection.activity" class="daily bg-body-tertiary">
                            <span class="bg-body-secondary"><i class="bi bi-pin-angle"></i></span>
                            <div class="form-check form-switch bg-body-tertiary" @mouseenter="enter"
                                @mouseleave="leave">
                                <label class="form-check-label" for="editor-daily">
                                    {{ italian ? 'Tutto il Giorno' : 'All Day' }}
                                </label>
                                <input id="editor-daily" class="form-check-input" type="checkbox"
                                    :checked="selection.daily" @click="choice('daily')">
                            </div>
                        </div>

                        <div v-show="!selection.activity && ((enable.start && enable.end) || selection.daily)">
                            <div class="repetition dropdown bg-body-tertiary">
                                <span class="bg-body-secondary"><i class="bi bi-arrow-repeat"></i></span>
                                <button class="dropdown-toggle btn btn-sm bg-body-tertiary" data-bs-toggle="dropdown"
                                    @mouseenter="enter" @mouseleave="leave">
                                    {{ repetition }}
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <div v-show="!submenu.repetition">
                                        <li>
                                            <div class="dropdown-item" @click="choice('repetition', 'no')">
                                                {{ italian ? "Nessuna Ripetizione" : "No Repetition" }}
                                            </div>
                                        </li>
                                        <li>
                                            <div class="dropdown-item" @click="choice('repetition', 'daily')">
                                                {{ italian ? "Ogni Giorno" : "Every Day" }}
                                            </div>
                                        </li>
                                        <li>
                                            <div class="dropdown-item" @click="choice('repetition', 'weekly')">
                                                {{ italian ? "Ogni Settimana" : "Every Week" }}
                                            </div>
                                        </li>
                                        <li>
                                            <div class="dropdown-item" @click="choice('repetition', 'monthly')">
                                                {{ italian ? "Ogni Mese" : "Every Month" }}
                                            </div>
                                        </li>
                                        <li>
                                            <div class="dropdown-item" @click="choice('repetition', 'yearly')">
                                                {{ italian ? "Ogni Anno" : "Every Year" }}
                                            </div>
                                        </li>
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                        <li>
                                            <div class="personalized dropdown-item"
                                                @click="choice('repetition', 'custom')">
                                                <i class="bi bi-pencil-fill"></i>
                                                {{ italian ? "Personalizzato" : "Custom" }}
                                            </div>
                                        </li>
                                    </div>
                                    <div v-show="submenu.repetition">
                                        <Custom type="repetition" :start="selection.start.date" />
                                        <hr>
                                        <div class="submenu">
                                            <button class="back" @click="choice('repetition', 'back')">
                                                {{ italian ? "Indietro" : "Back" }}
                                            </button>
                                            <button class="save">
                                                {{ italian ? "Salva" : "Save" }}
                                            </button>
                                        </div>
                                    </div>
                                </ul>
                            </div>

                            <div v-show="selection.repetition !== 'no'" class="recurrence dropdown bg-body-tertiary">
                                <span class="bg-body-secondary"><i class="bi bi-hourglass"></i></span>
                                <button class="dropdown-toggle btn btn-sm bg-body-tertiary" data-bs-toggle="dropdown"
                                    @mouseenter="enter" @mouseleave="leave">
                                    {{ recurrence }}
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <div v-show="!submenu.recurrence">
                                        <li>
                                            <div class="dropdown-item" @click="choice('recurrence', 'endless')">
                                                {{ italian ? "Ricorrenza Infinita" : "Endless Recurrence" }}
                                            </div>
                                        </li>

                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                        <li>
                                            <div class="personalized dropdown-item"
                                                @click="choice('recurrence', 'custom')">
                                                <i class="bi bi-pencil-fill"></i>
                                                {{ italian ? "Personalizzato" : "Custom" }}
                                            </div>
                                        </li>
                                    </div>
                                    <div v-show="submenu.recurrence">
                                        <Custom type="recurrence" :start="selection.start.date" />
                                        <hr>
                                        <div class="submenu">
                                            <button class="back" @click="choice('recurrence', 'back')">
                                                {{ italian ? "Indietro" : "Back" }}
                                            </button>
                                            <button class="save">
                                                {{ italian ? "Salva" : "Save" }}
                                            </button>
                                        </div>
                                    </div>
                                </ul>
                            </div>
                        </div>

                        <div class="start" v-show="(!editor.event || (editor.event && (editor.edit || (!editor.edit && enable.start))))">
                            <div v-show="!selection.daily || selection.activity"
                                class="input-group-label bg-body-tertiary">
                                {{ italian ? 'Inizio' : 'Start' }}
                            </div>
                            <div>
                                <div class="date input-group bg-body-tertiary">
                                    <span class="input-group-text bg-body-secondary"><i
                                            class="bi bi-calendar-event"></i></span>
                                    <input name="start-date" type="date" class="form-control bg-body-tertiary"
                                        :value="enable.start ? selection.start.date : null"
                                        :disabled="!enable.start && (!selection.daily || selection.activity)"
                                        @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                                </div>
                                <div v-show="selection.activity && enable.end && (!editor.event || (editor.event && editor.edit))" class="enable form-check form-switch bg-body-tertiary"
                                        @mouseenter="enter" @mouseleave="leave">
                                        <input name="start-enable" class="form-check-input" type="checkbox"
                                            :checked="enable.start" @click="choice('start')">
                                </div>
                            </div>
                            <div v-show="!selection.daily && !selection.activity">
                                <div class="time input-group bg-body-tertiary">
                                    <span class="input-group-text bg-body-secondary"><i class="bi bi-clock"></i></span>
                                    <input name="start-time" type="time" class="form-control bg-body-tertiary"
                                        :value="enable.start ? selection.start.time : null" :disabled="!enable.start" @mouseenter="enter"
                                        @mouseleave="leave" @keydown.enter="lose">
                                </div>
                                <div v-show="enable.end && (!editor.event || (editor.event && editor.edit))" class="enable form-check form-switch bg-body-tertiary"
                                    @mouseenter="enter" @mouseleave="leave">
                                    <input name="start-enable" class="form-check-input" type="checkbox"
                                        :checked="enable.start" @click="choice('start')">
                                </div>
                            </div>
                        </div>

                        <div v-show="(!selection.daily || selection.activity) && (!editor.event || (editor.event && (editor.edit || (!editor.edit && enable.end))))" class="end">
                            <div class="input-group-label bg-body-tertiary">
                                {{ italian ? 'Fine' : 'End' }}
                            </div>
                            <div>
                                <div class="date input-group bg-body-tertiary">
                                    <span class="input-group-text bg-body-secondary"><i
                                            class="bi bi-calendar-event"></i></span>
                                    <input name="end-date" type="date" class="form-control bg-body-tertiary"
                                        :value="enable.end ? selection.end.date : null" :disabled="!enable.end" @mouseenter="enter"
                                        @mouseleave="leave" @keydown.enter="lose">
                                </div>
                                <div v-show="selection.activity && enable.start && (!editor.event || (editor.event && editor.edit))" class="enable form-check form-switch bg-body-tertiary"
                                    @mouseenter="enter" @mouseleave="leave">
                                    <input name="end-enable" class="form-check-input" type="checkbox"
                                        :checked="enable.end" @click="choice('end')">
                                </div>
                            </div>
                            <div v-show="!selection.daily && !selection.activity">
                                <div class="time input-group bg-body-tertiary">
                                    <span class="input-group-text bg-body-secondary"><i class="bi bi-clock"></i></span>
                                    <input name="end-time" type="time" class="form-control bg-body-tertiary"
                                        :value="enable.end ? selection.end.time : null" :disabled="!enable.end" @mouseenter="enter"
                                        @mouseleave="leave" @keydown.enter="lose">
                                </div>
                                <div v-show="enable.start && (!editor.event || (editor.event && editor.edit))" class="enable form-check form-switch bg-body-tertiary"
                                    @mouseenter="enter" @mouseleave="leave">
                                    <input name="end-enable" class="form-check-input" type="checkbox"
                                        :checked="enable.end" @click="choice('end')">
                                </div>
                            </div>
                        </div>
                        <div v-show="alert.period" class="alert">
                            {{ italian
                                ? `La data di fine deve essere successiva alla data di inizio.${!this.selection.activity ? " L'intervallo tra la data di inizio e quella di fine, oppure tra la data di fine e le 00:00 dello stesso giorno, non può essere inferiore a 15 minuti." : ""}`
                                : `The end date must be later than the start date.${!this.selection.activity ? " The interval between the start date and the end date, or between the end date and the 00:00 of the same day, cannot be less than 15 minutes." : ""}` }}
                        </div>
                        <div v-show="alert.duration" class="alert">
                            {{ duration }}
                        </div>

                        <div  v-show="(!editor.event || (editor.event && (editor.edit || (!editor.edit && selection.notes))))">
                            <div class="form-label">
                                {{ italian ? "Informazioni" : "Informations" }}
                            </div>
                            <div class="notes input-group bg-body-tertiary">
                                <span class="input-group-text bg-body-secondary"><i class="bi bi-pencil"></i></span>
                                <textarea name="notes" class="form-control bg-body-tertiary"
                                    :placeholder="italian ? 'Note' : 'Notes'" :value="selection.notes" @mouseenter="enter"
                                    @mouseleave="leave"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div>
                            <button v-show="editor.event && !editor.edit" class="edit" @click="edit">
                                {{ italian ? "Modifica" : "Edit" }}
                            </button>
                            <button v-show="editor.event && editor.edit" class="delete" @click="drop">
                                {{ italian ? "Elimina" : "Delete" }}
                            </button>
                        </div>
                        <div>
                            <button class="exit" data-bs-dismiss="modal" @click="click">
                                {{ italian ? "Esci" : "Close" }}
                            </button>
                            <button  v-show="!editor.event || (editor.event && editor.edit)" class="save" @click="save">
                                {{ italian ? "Salva" : "Save" }}
                            </button>
                            <button v-show="editor.event && selection.activity && !editor.edit && active" :class="selection.repetition != 'complete' ? 'complete' : 'restore'" @click="complete">
                                {{ selection.repetition != 'complete' ? (italian ? "Completa" : "Complete") : (italian ? "Rispristina" : "Restore") }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>

<script>
import axios from 'axios';
import Custom from './Custom.vue';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { weekday } from '../utils/misc';
import { animations } from '../store/animations';

export default {
    components: {
        Custom
    },
    data() {
        return {
            selection: {
                title: null,
                calendar: null,
                activity: null,
                daily: null,
                start: {
                    date: null,
                    time: null
                },
                end: {
                    date: null,
                    time: null
                },
                repetition: null,
                recurrence: null,
                notes: null
            },
            delta: 0,
            alert: {
                title: null,
                period: null,
                duration: null,
            },
            enable: {
                start: null,
                end: null
            },
            submenu: {
                repetition: null,
                recurrence: null
            },
            hover: null,
            observer: null,
            mounted: null,
            inert: true,
            restore: null
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        editor() {
            return global.editor
        },
        repetition() {
            switch (this.selection.repetition) {
                case 'no':
                    return this.italian ? 'Nessuna Ripetizione' : 'No Repetition';
                case 'daily':
                    return this.italian ? 'Ogni Giorno' : 'Every Day';
                case 'weekly':
                    return this.italian ? 'Ogni Settimana' : 'Every Week';
                case 'monthly':
                    return this.italian ? 'Ogni Mese' : 'Every Month';
                case 'yearly':
                    return this.italian ? 'Ogni Anno' : 'Every Year';
                case 'custom':
                    this.alert.duration = false;
                    this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                        element.classList.remove('warning'));
                    return this.resume('repetition');
            }
        },
        recurrence() {
            switch (this.selection.recurrence) {
                case 'endless':
                    return this.italian ? 'Ricorrenza Infinita' : 'Endless Recurrence';
                case 'custom':
                    return this.resume('recurrence');
            }
        },
        duration() {
            const italian = this.italian;
            let duration = italian
                ? "Per questo tipo di ripetizione, l'intervallo tra la data di inizio e quella di fine deve essere inferiore a "
                : "For this type of repetition, the interval between the start and end date must be less than  ";

            switch (this.selection.repetition) {
                case 'daily':
                    duration += '1 ' + (italian ? 'giorno' : 'day');
                    break;
                case 'weekly':
                    duration += '7 ' + (italian ? 'giorni' : 'days');
                    break;
                case 'monthly':
                    duration += '28 ' + (italian ? 'giorni' : 'days');
                    break;
                case 'yearly':
                    duration += '365 ' + (italian ? 'giorni' : 'days');
                    break;
                case 'custom':
                    const date = this.selection.start.date?.split('-'),
                        time = this.selection.start.time?.split(':');
                    let start;
                    if (date && time)
                        start = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);

                    const map = this.italian
                        ? { 'Lun': 1, 'Mar': 2, 'Mer': 3, 'Gio': 4, 'Ven': 5, 'Sab': 6, 'Dom': 0 }
                        : { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 }
                    let weekdays = [...global.repetition.weekdays];
                    weekdays = weekdays.map(day => map[day]);

                    switch (global.repetition.frequency) {
                        case 'daily':
                            duration += '1 ' + (italian ? 'giorno' : 'day');
                            break;
                        case 'weekly':
                            if (weekdays.length === 1 && weekdays[0] === start.getDay())
                                duration += '7 ' + (italian ? 'giorni' : 'days');
                            else
                                duration += '1 ' + (italian ? 'giorno' : 'day');
                            break;
                        case 'monthly':
                            if (weekdays.length === 0)
                                duration += '28 ' + (italian ? 'giorni' : 'days');
                            else
                                duration += '1 ' + (italian ? 'giorno' : 'day');
                            break;
                        case 'yearly':
                            duration += '365 ' + (italian ? 'giorni' : 'days');
                            break;
                    }
                    break;
            }
            duration += '.';
            return duration;
        },
        list() {
            return global.calendars.filter(calendar => calendar.title !== 'Personal');
        },
        calendar() {
            if (!this.selection.calendar)
                return

            if (this.selection.calendar.title === 'Personal')
                return this.italian ? 'Personale' : 'Personal'
            else return this.selection.calendar.title;
        },
        active() {
            if (!this.editor.event)
                return;

            let today = global.today.day;
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return !this.editor.event.start || this.editor.event.start?.getTime() <= today.getTime();
        }
    },
    methods: {
        click() {
            if (global.activities)
                this.$el.querySelector('.toggler').click();

            global.activities = false;
        },
        enter(event) {
            if (event instanceof Event) {
                const target = event.target.closest('button, .form-control, .form-check');
                this.hover = target;
                if (!global.touch && !target.classList.contains('focus') && !target.disabled) {
                    if (!target.closest('.submenu'))
                        target.classList.remove('bg-body-tertiary');
                    target.classList.add('bg-body-secondary', 'text-body');
                }
            }
        },
        leave(event, mantain) {
            if (event instanceof Event) {
                const target = event.target.closest('button, .form-control, .form-check');
                if (!mantain)
                    this.hover = null;
                if (!global.touch && !target.classList.contains('focus') && !target.disabled) {
                    target.classList.remove('bg-body-secondary', 'text-body');
                    if (!target.closest('.submenu'))
                        target.classList.add('bg-body-tertiary');
                }
            }
        },
        complete(){
                const alert = confirm(this.italian
                    ? `Sei sicuro di voler ${this.selection.repetition != 'complete' ? 'completare' : 'ripristinare'} questa attività?`
                    : `Are you sure you want to  ${this.selection.repetition != 'complete' ? 'complete' : 'restore'} this activity?`);

                if (!alert)
                    return;

            if (this.selection.repetition != 'complete'){
                const date = new Date(global.today.day);
                this.selection.repetition = {
                    frequency: 'complete',
                    custom: new Date(date.getFullYear(), date.getMonth(), date.getDate())
                };
            } else {
                this.selection.repetition = {
                    frequency: 'incomplete',
                    custom: null
                };
            }
            this.save();
        },
        edit() {
            this.$el.classList.add('disappear');
            setTimeout(() => {
                this.$el.classList.remove('disappear');
                this.$el.classList.add('appear');
                setTimeout(() =>
                    this.$el.classList.remove('appear'),
                    animations.refresh);

                global.editor.edit = true;
                this.load();
            }, animations.refresh);
        },
        clear(type) {
            if (type === 'repetition') {
                global.repetition = {
                    frequency: 'daily',
                    interval: 1,
                    numbers: [],
                    weekdays: []
                };
                this.submenu.repetition = false;
                this.selection.repetition = 'no';
            } else if (type === 'recurrence') {
                global.recurrence = {
                    iteration: 'times',
                    times: 1,
                    deadline: 0
                };
                this.submenu.recurrence = false;
                this.selection.recurrence = 'endless';
                this.$el.querySelector('.deadline').classList.remove('warning');
            }
        },
        load() {
            this.inert = false;
            const editor = this.editor;

            this.$el.querySelectorAll('.form-control, .form-check, .dropdown button, span').forEach(item => {
                item.classList.remove('disable');
                item.parentNode.classList.remove('disable');
            });
            this.$el.querySelectorAll('span:not(.title)').forEach(item => {
                item.classList.remove('bg-body-tertiary');
                item.classList.add('bg-body-secondary');
            });

            if (!editor.event) {

                const target = new Date(parseInt(this.$route.params.target));

                if (editor.day) {
                    target.setDate(target.getDate() - weekday(target));
                    target.setDate(target.getDate() + editor.day - 1);
                }
                const date = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;

                const now = new Date(global.today.now);
                if (!editor.daily && editor.time !== null) {
                    now.setHours(editor.time);
                    now.setMinutes(0);
                }

                let time = now.toLocaleTimeString(settings.format, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23'
                });
                const personal = 'Personal';

                this.selection = {
                    title: null,
                    calendar: global.calendars.find(calendar => calendar.title === personal),
                    activity: false,
                    daily: editor.daily,
                    start: { date, time },
                    end: { date, time },
                    repetition: 'no',
                    recurrence: 'endless',
                    notes: null
                };

                this.enable = {
                    start: true,
                    end: true
                };

                this.clear('repetition');
                this.clear('recurrence');

                this.$el.querySelector('.modal-footer .save').disabled = true;

                if (now.getHours() >= 23 && now.getMinutes() >= 30) {
                    target.setDate(target.getDate() + 1);
                    this.selection.end.date =
                        `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
                }
                now.setMinutes(now.getMinutes() + 30);

                time = now.toLocaleTimeString(settings.format, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23'
                });
                this.selection.end.time = time;

                if (!global.touch)
                    setTimeout(() => {
                        const title = this.$el.querySelector('.title input');
                        title.focus();
                        title.classList.remove('bg-body-tertiary');
                        title.classList.add('bg-body-secondary');
                    }, 501);
                document.documentElement.style.setProperty('--editor-start-date-opacity', 1);
                document.documentElement.style.setProperty('--editor-start-time-opacity', 1);
                document.documentElement.style.setProperty('--editor-end-date-opacity', 1);
                document.documentElement.style.setProperty('--editor-end-time-opacity', 1);

                this.delta = 30 * 60 * 1000;
            }
            else {
                const event = editor.event;

                this.enable = {
                    start: Boolean(event.start),
                    end: Boolean(event.end) || event.daily
                };

                const repetition = JSON.parse(JSON.stringify(event.repetition))[0],
                    recurrence = JSON.parse(JSON.stringify(event.recurrence))[0];

                let sostitution;
                if (!event.start || !event.end) {
                    if (event.start) {
                        sostitution = new Date(event.start);
                        sostitution.setTime(sostitution.getTime() + 30 * 60 * 1000);
                    } else {
                        sostitution = new Date(event.end);
                        sostitution.setTime(sostitution.getTime() - 30 * 60 * 1000);
                    }
                }

                const start = event.start || sostitution,
                    end = event.end || sostitution;

                this.selection = {
                    title: event.title,
                    calendar: global.calendars.find(calendar => calendar._id === event.calendar),
                    activity: event.activity,
                    daily: event.daily,
                    start: {
                        date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
                        time: start.toLocaleTimeString(settings.format, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hourCycle: 'h23'
                        })
                    },
                    end: {
                        date: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`,
                        time: end.toLocaleTimeString(settings.format, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hourCycle: 'h23'
                        })
                    },
                    repetition: repetition.frequency,
                    recurrence: recurrence.frequency,
                    notes: event.notes
                };

                this.submenu = {
                    repetition: repetition.frequency === 'custom',
                    recurrence: recurrence.frequency === 'custom'
                };

                const map = this.italian
                    ? { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Gio', 5: 'Ven', 6: 'Sab', 0: 'Dom' }
                    : { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

                global.repetition = {
                    frequency: repetition.custom?.frequency || 'daily',
                    interval: repetition.custom?.interval || 1,
                    numbers: repetition.custom?.numbers?.map(number => number + (this.italian ? '°' : 'th')) || [],
                    weekdays: repetition.custom?.weekdays?.map(day => map[day]) || []
                };

                const deadline = recurrence.custom?.deadline ? new Date(recurrence.custom.deadline) : null;
                global.recurrence = {
                    iteration: recurrence.custom?.iteration || 'times',
                    times: recurrence.custom?.times || 1,
                    deadline: deadline ? `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}` : null
                };

                if (!editor.edit) {
                    this.$el.querySelectorAll('.form-control, .form-check, .dropdown button, span').forEach(item => {
                        item.classList.add('disable');
                        item.parentNode.classList.add('disable');
                    });
                    this.$el.querySelectorAll('span:not(.title)').forEach(item => {
                        item.classList.remove('bg-body-secondary');
                        item.classList.add('bg-body-tertiary');
                    });
                } else {
                    if (event.start && event.end)
                        self.delta = event.end.getTime() - event.start.getTime();
                    else
                        this.delta = 30 * 60 * 1000;
                }
                this.$el.querySelector('.modal-footer .save').disabled = false;
            }
            this.alert = {
                title: false,
                period: false,
                duration: false
            };
            this.hover = null;
            this.restore = false;

            this.$el.querySelector('.title').classList.remove('warning');
            this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                element.classList.remove('warning'));

            setTimeout(() => {
                this.mounted = true;
                this.hover = 'load';
                const notes = this.$el.querySelector('.notes .form-control');
                notes.style.height = '5rem';
                if (this.editor.event) {
                    if (notes.scrollHeight > notes.offsetHeight) {
                        notes.style.height = 'auto !important';
                        notes.style.height = `calc(0.36rem + ${notes.scrollHeight}px)`;
                    }
                }
            }, 201);

        },
        hide() {
            this.inert = true;
        },
        choice(type, selection) {
            switch (type) {
                case 'calendar':
                    if (selection === 'personal') {
                        const personal = 'Personal';
                        selection = global.calendars.find(calendar => calendar.title === personal);
                    }
                    this.selection.calendar = selection;
                    return;
                case 'activity':
                    this.selection.activity = !this.selection.activity;
                    this.alert.period = false;
                    this.alert.duration = false;
                    this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                        element.classList.remove('warning'));

                    if (this.selection.activity) {
                        if (this.selection.start.date == this.selection.end.date){
                            let end = this.selection.end.date.split('-');
                            end = new Date(end[0], end[1] - 1, end[2]);
                            end.setMonth(end.getMonth() + 1);
                            this.selection.end.date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
                        }
                    } else {
                        let end = this.selection.end.date.split('-');
                        end = new Date(end[0], end[1] - 1, end[2]);
                        end.setMonth(end.getMonth() - 1);
                        end = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

                        if (this.selection.start.date == end)
                            this.selection.end.date = end;
                    }

                    return;
                case 'daily':
                    this.selection.daily = !this.selection.daily;
                    if (this.selection.daily)
                        this.$el.querySelector('.editor .start').style.marginTop = '0.5rem';
                    else
                        this.$el.querySelector('.editor .start').style.marginTop = '0.7rem';
                    this.alert.period = false;
                    this.alert.duration = false;
                    this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                        element.classList.remove('warning'));
                    return
                case 'start':
                    this.enable.start = !this.enable.start;
                    this.alert.period = false;
                    this.alert.duration = false;
                    this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                        element.classList.remove('warning'));
                    return;
                case 'end':
                    this.enable.end = !this.enable.end;
                    this.alert.period = false;
                    this.alert.duration = false;
                    this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                        element.classList.remove('warning'));
                    return;
                case 'repetition':
                    if (selection === 'custom') {
                        this.submenu.repetition = true;
                        if (!global.touch)
                            requestAnimationFrame(() => {
                                const interval = this.$el.querySelector('.interval');
                                interval.focus();
                                interval.classList.remove('bg-body-tertiary');
                                interval.classList.add('bg-body-secondary');
                            });
                    } else if (selection === 'back') {
                        this.clear('repetition');
                        this.submenu.repetition = false;
                        selection = 'no';
                        requestAnimationFrame(() => this.$el.querySelector('.repetition button').click());
                    }
                    this.selection.repetition = selection;
                    return;
                case 'recurrence':
                    if (selection === 'custom') {
                        this.submenu.recurrence = true;
                        if (!global.touch)
                            requestAnimationFrame(() => {
                                const item = global.recurrence.iteration === 'times'
                                    ? this.$el.querySelectorAll('.times')[1]
                                    : this.$el.querySelectorAll('.deadline')[1];
                                item.focus();
                                item.classList.remove('bg-body-tertiary');
                                item.classList.add('bg-body-secondary');
                            });
                    } else if (selection === 'back') {
                        this.clear('recurrence');
                        this.submenu.recurrence = false;
                        selection = 'endless';
                        requestAnimationFrame(() => this.$el.querySelector('.recurrence button').click());
                    }
                    this.selection.recurrence = selection;
                    return;
            }
        },
        input(event) {
            this.$el.querySelectorAll('button, .form-control, .form-check').forEach(element =>
                this.leave({ target: element }, true));
            this.restore = true;

            const self = this;
            function delta(add) {
                if (self.selection.start.date && self.selection.start.time && self.selection.end.date && self.selection.end.time) {
                    let date = self.selection.start.date.split('-');
                    let time = self.selection.start.time.split(':');
                    const start = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);

                    date = self.selection.end.date.split('-');
                    time = self.selection.end.time.split(':');
                    const end = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);

                    if (add) {
                        end.setTime(start.getTime() + self.delta);
                        self.selection.end.date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
                        self.selection.end.time = end.toLocaleTimeString(settings.format, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hourCycle: 'h23'
                        })
                    } else
                        self.delta = end.getTime() - start.getTime();
                    if (self.delta < 0)
                        self.delta = ((end.getHours() - start.getHours()) * 60 + (end.getMinutes() - start.getMinutes())) * 60 * 1000;
                }
            }

            if (event.target.closest('.title')) {
                event.target.value = event.target.value.replace(/^\s+/, "");
                this.selection.title = event.target.value;

            } else if (event.target.closest('.date')) {
                this.alert.period = false;
                this.alert.duration = false;
                this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                    element.classList.remove('warning'));
                if (event.target.closest('.start')) {
                    this.selection.start.date = event.target.value;
                    delta(true);
                    if (!this.selection.start.date)
                        document.documentElement.style.setProperty('--editor-start-date-opacity', 0.75);
                    else document.documentElement.style.setProperty('--editor-start-date-opacity', 1);
                } else if (event.target.closest('.end')) {
                    this.selection.end.date = event.target.value;
                    delta();
                    if (!this.selection.end.date)
                        document.documentElement.style.setProperty('--editor-end-date-opacity', 0.75);
                    else document.documentElement.style.setProperty('--editor-end-date-opacity', 1);
                }

            } else if (event.target.closest('.time')) {
                this.alert.period = false;
                this.alert.duration = false;
                this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                    element.classList.remove('warning'));
                if (event.target.closest('.start')) {
                    this.selection.start.time = event.target.value;
                    delta(true);
                    if (!this.selection.start.time)
                        document.documentElement.style.setProperty('--editor-start-time-opacity', 0.75);
                    else document.documentElement.style.setProperty('--editor-start-time-opacity', 1);
                } else if (event.target.closest('.end')) {
                    this.selection.end.time = event.target.value;
                    delta();
                    if (!this.selection.end.time)
                        document.documentElement.style.setProperty('--editor-end-time-opacity', 0.75);
                    else document.documentElement.style.setProperty('--editor-end-time-opacity', 1);
                }

            } else if (event.target.closest('.notes')) {
                this.selection.notes = event.target.value;
                if (event.target.scrollHeight > event.target.offsetHeight) {
                    event.target.style.height = 'auto !important';
                    event.target.style.height = `calc(0.36rem + ${event.target.scrollHeight}px)`;
                }
            }
            if (event.target.closest('.title') || event.target.closest('.date') || event.target.closest('.time')) {
                if (!(this.selection.title && this.selection.start.date && this.selection.start.time && this.selection.end.date && this.selection.end.time))
                    this.$el.querySelector('.modal-footer .save').disabled = true;
                else
                    this.$el.querySelector('.modal-footer .save').disabled = false;
            }
        },
        focus(event, element) {
            let target = !element
                ? event.target.closest('.form-control')
                : element.querySelector('.dropdown-toggle');

            if (target.closest('.repetition') && this.selection.repetition === 'custom') {
                if (!global.touch)
                    requestAnimationFrame(() => {
                        const interval = this.$el.querySelector('.interval');
                        interval.focus();
                        interval.classList.remove('bg-body-tertiary');
                        interval.classList.add('bg-body-secondary');
                    });
            }
            else if (target.closest('.recurrence') && this.selection.recurrence === 'custom') {
                if (!global.touch)
                    requestAnimationFrame(() => {
                        const item = global.recurrence.iteration === 'times'
                            ? this.$el.querySelectorAll('.times')[1]
                            : this.$el.querySelectorAll('.deadline')[1];
                        item.focus();
                        item.classList.remove('bg-body-tertiary');
                        item.classList.add('bg-body-secondary');
                    });
            }
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
        blur(event) {
            event.target.blur();
        },
        lose(event) {
            const target = event.target.closest('.form-control');
            target.blur();
            if (!global.touch) {
                this.$el.querySelectorAll('button, .form-control, .form-check').forEach(element =>
                    this.leave({ target: element }, true));

                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');

                let siblings = Array.from(this.$el.querySelectorAll('.form-control[type="text"], .form-control[type="date"], .form-control[type="time"]'));
                siblings = siblings.filter(element =>
                    !['deadline', 'interval', 'times'].some(name => element.classList.contains(name)) && (element.type === 'date' || element.type === 'time' || element === target || !element.value));
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
        deadline() {
            let placeholder = this.selection.start.date;
            if (placeholder) {
                placeholder = placeholder.split('-');
                placeholder = new Date(placeholder[0], placeholder[1] - 1, placeholder[2])
            } else {
                placeholder = new Date(parseInt(this.$route.params.target));
            }

            let deadline = global.recurrence.deadline;
            if (deadline) {
                deadline = deadline.split('-');
                deadline = new Date(deadline[0], deadline[1] - 1, deadline[2])
            } else {
                deadline = new Date(placeholder);
            }
            if (deadline.getTime() < placeholder.getTime())
                deadline = new Date(placeholder);
            return deadline;
        },
        resume(type) {
            let string = '';
            if (type === 'repetition') {
                string += this.italian ? 'Ogni ' : 'Every ';
                if (global.repetition.interval > 1)
                    string += global.repetition.interval + ' ';

                switch (global.repetition.frequency) {
                    case 'daily':
                        string += this.italian ? 'Giorn' : 'Day';
                        break;
                    case 'weekly':
                        string += this.italian ? 'Settiman' : 'Week';
                        break;
                    case 'monthly':
                        string += this.italian ? 'Mes' : 'Month';
                        break;
                    case 'yearly':
                        string += this.italian ? 'Ann' : 'Year';
                        break;
                }

                if (settings.format !== 'it-IT')
                    string += global.repetition.interval > 1 ? 's' : '';
                else {
                    switch (global.repetition.frequency) {
                        case 'daily': case 'yearly':
                            string += global.repetition.interval > 1 ? 'i' : 'o';
                            break;
                        case 'weekly':
                            string += global.repetition.interval > 1 ? 'e' : 'a';
                            break;
                        case 'monthly':
                            string += global.repetition.interval > 1 ? 'i' : 'e';
                            break;
                    }
                }
                if (global.repetition.numbers.length > 0) {
                    const order = this.italian
                        ? ['1°', '2°', '3°', '4°', '5°']
                        : ['1th', '2th', '3th', '4th', '5th'];

                    global.repetition.numbers = global.repetition.numbers.sort((a, b) => {
                        return order.indexOf(a) - order.indexOf(b);
                    });
                    string += this.italian
                        ? (global.repetition.weekdays.length == 1 && global.repetition.weekdays.includes('Dom')) ? ' la ' : ' il '
                        : ' the ';
                    for (let i in global.repetition.numbers) {
                        string += global.repetition.numbers[i];
                        if (i < global.repetition.numbers.length - 2)
                            string += ', ';
                        else if (i == global.repetition.numbers.length - 2)
                            string += this.italian ? ' e ' : ' & ';
                    }
                }
                if (global.repetition.weekdays.length > 0) {
                    const order = this.italian
                        ? ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
                        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                    global.repetition.weekdays = global.repetition.weekdays.sort((a, b) => {
                        return order.indexOf(a) - order.indexOf(b);
                    });

                    if (global.repetition.numbers.length === 0)
                        string += this.italian ? ' di' : ' on';
                    string += ' ';

                    for (let i in global.repetition.weekdays) {
                        string += global.repetition.weekdays[i];
                        if (i < global.repetition.weekdays.length - 2)
                            string += ', ';
                        else if (i == global.repetition.weekdays.length - 2)
                            string += this.italian ? ' e ' : ' & ';
                    }
                }
                return string;
            }
            else if (type === 'recurrence') {
                if (global.recurrence.iteration === 'times') {
                    if (global.recurrence.times)
                        string += global.recurrence.times;
                    else
                        string += '1';
                    string += this.italian ? ' Volt' : ' Time';
                    string += this.italian ? global.recurrence.times > 1 ? 'e' : 'a' : 's';
                } else if (global.recurrence.iteration === 'deadline') {
                    string += this.italian ? 'Fino al ' : 'Since ';

                    const deadline = this.deadline();
                    string += `${String(deadline.getDate()).padStart(2, '0')}/${String(deadline.getMonth() + 1).padStart(2, '0')}/${deadline.getFullYear()}`;
                }
            }
            return string;
        },
        async drop() {
            const alert = confirm(this.italian
                ? 'Sei sicuro di voler eliminare questo evento? Questa operazione è irreversibile e non potrà essere annullata!'
                : 'Are you sure you want to delete this event? This action is irreversible and cannot be undone!');

            if (!alert)
                return;

            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            this.$el.querySelector('.close').click();
            try {
                Array.from(document.querySelectorAll('.event'))
                    .filter(item => item.getAttribute('data-event') === this.editor.event._id)
                    .forEach(element =>
                        element.classList.add('disappear'));
                await delay(animations.refresh);

                await axios.get('/api/events/drop', { params: { id: this.editor.event._id } });
                global.events = global.events.filter(event => event._id != this.editor.event._id);
                
            } catch (error) {
                console.error('Error while deleting events:', error);
            }
        },
        async save() {
            if (this.$el.querySelector('.modal-footer .save').disabled)
                return;

            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            const data = {};
            data.title = this.selection.title

            let date = this.selection.start.date.split('-');
            let time = this.selection.start.time.split(':');
            data.start = (this.enable.start)
                ? new Date(date[0], date[1] - 1, date[2], time[0], time[1])
                : null;

            date = this.selection.end.date.split('-');
            time = this.selection.end.time.split(':');
            data.end = (this.enable.end && (!this.selection.daily || this.selection.activity))
                ? new Date(date[0], date[1] - 1, date[2], time[0], time[1])
                : null;

            if (data.start && data.end) {
                const midnight = new Date(data.end.getFullYear(), data.end.getMonth(), data.end.getDate());
                this.alert.period =
                    (data.start.getTime() >= data.end.getTime() ||
                        ((data.end - data.start) / 60000) < 15 ||
                        (((data.end - midnight) / 60000) != 0 && ((data.end - midnight) / 60000) < 15));

                if (this.alert.period) {
                    this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                        element.classList.add('warning'));
                    const end = this.$el.querySelector('.end .date input');
                    end.focus();
                    end.classList.remove('bg-body-tertiary');
                    end.classList.add('bg-body-secondary');
                    return;
                }
            }

            data.notes = this.selection.notes?.trimEnd();
            data.activity = this.selection.activity;

            data.daily = !this.selection.activity ? this.selection.daily : null;

            if (!this.selection.activity){
                data.repetition = {
                    frequency: this.selection.repetition,
                    custom: null
                }

                if (data.repetition.frequency === 'custom') {
                    const repetition = {};
                    Object.assign(repetition, global.repetition);

                    const map = this.italian
                        ? { 'Lun': 1, 'Mar': 2, 'Mer': 3, 'Gio': 4, 'Ven': 5, 'Sab': 6, 'Dom': 0 }
                        : { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 }

                    repetition.weekdays = repetition.weekdays.map(day => map[day]);
                    repetition.weekdays.sort((a, b) => a - b);

                    repetition.numbers = repetition.numbers.map(number => parseInt(number));

                    repetition.interval = parseInt(repetition.interval);
                    if (!repetition.interval || repetition.interval < 1 || repetition.interval > 999)
                        repetition.interval = 1;

                    data.repetition.custom = repetition;
                }

                if (!this.selection.daily && data.start && data.end) {
                    this.alert.duration = false;
                    const duration = Math.round((
                        new Date(data.end.getFullYear(), data.end.getMonth(), data.end.getDate()) -
                        new Date(data.start.getFullYear(), data.start.getMonth(), data.start.getDate())) /
                        (1000 * 60 * 60 * 24));

                    switch (data.repetition.frequency) {
                        case 'daily':
                            this.alert.duration = duration >= 1;
                            break;
                        case 'weekly':
                            this.alert.duration = duration >= 7;
                            break;
                        case 'monthly':
                            this.alert.duration = duration >= 28;
                            break;
                        case 'yearly':
                            this.alert.duration = duration >= 365;
                            break;
                        case 'custom':
                            switch (data.repetition.custom.frequency) {
                                case 'daily':
                                    this.alert.duration = duration >= 1;
                                    break;
                                case 'weekly':
                                    if (data.repetition.custom.weekdays.length === 1 && data.repetition.custom.weekdays[0] === data.start.getDay())
                                        this.alert.duration = duration >= 7;
                                    else
                                        this.alert.duration = duration >= 1;
                                    break;
                                case 'monthly':
                                    if (data.repetition.custom.weekdays.length === 0)
                                        this.alert.duration = duration >= 28;
                                    else
                                        this.alert.duration = duration >= 1;
                                    break;
                                case 'yearly':
                                    this.alert.duration = duration >= 365;
                                    break;
                            }
                            break;
                    }

                    if (this.alert.duration) {
                        this.$el.querySelectorAll('.end .time, .end .date').forEach(element =>
                            element.classList.add('warning'));
                        const end = this.$el.querySelector('.end .date input');
                        end.focus();
                        end.classList.remove('bg-body-tertiary');
                        end.classList.add('bg-body-secondary');
                        return;
                    }
                }

                data.recurrence = {
                    frequency: this.selection.recurrence,
                    custom: null
                }

                if (data.recurrence.frequency === 'custom') {
                    const recurrence = {};
                    Object.assign(recurrence, global.recurrence);

                    if (recurrence.iteration === 'times') {
                        recurrence.times = parseInt(recurrence.times);
                        if (!recurrence.times || recurrence.times < 1 || recurrence.times > 999)
                            recurrence.times = 1;
                        recurrence.times -= 1;
                        recurrence.deadline = null;
                    } else {
                        recurrence.times = null;
                        recurrence.deadline = this.deadline(recurrence.deadline);
                    }
                    data.recurrence.custom = recurrence;
                }
            }

            data.calendar = this.selection.calendar._id;
            data.user = global.user;

            const edit = this.editor.edit || (this.selection.activity && this.selection.repetition.frequency)
            if (edit)
                data._id = this.editor.event._id;

            if (data.activity) {
                data.start = data.start ? new Date(data.start.getFullYear(), data.start.getMonth(), data.start.getDate()) : null;
                data.end = data.end ? new Date(data.end.getFullYear(), data.end.getMonth(), data.end.getDate()) : null;
                if (data.start && data.end && data.start.getTime() >= data.end.getTime()) {
                    this.alert.period = true;
                    return;
                }

                data.recurrence = {
                    frequency: 'endless',
                    custom: null
                }

                if (!this.selection.repetition.frequency)
                    data.repetition = {
                        frequency: 'incomplete',
                        custom: null
                    }
                else
                    data.repetition = this.selection.repetition;
            }
            this.$el.querySelector('.close').click();

            try {
                if (edit) {
                    Array.from(document.querySelectorAll('.event'))
                        .filter(item => item.getAttribute('data-event') === data._id)
                        .forEach(element =>
                            element.classList.add('disappear'));
                    await delay(animations.refresh);
                }
                var response = await axios.put('/api/events/update', data);

                response.data.event.start = response.data.event.start ? new Date(response.data.event.start) : null;
                response.data.event.end = response.data.event.end ? new Date(response.data.event.end) : null;

                if (!edit)
                    global.events.push(response.data.event);
                else {
                    const index = global.events.indexOf(global.events.find(event => event._id === response.data.event._id));
                    global.events[index] = response.data.event;
                }
            } catch (error) {
                console.error('Error while updating event:', error);
            }

            requestAnimationFrame(() =>
                Array.from(document.querySelectorAll('.event'))
                    .filter(item => item.getAttribute('data-event') === response.data.event._id)
                    .forEach(element => {
                        element.classList.remove('disappear');
                        element.classList.add('appear');
                        setTimeout(() =>
                            element.classList.remove('appear'),
                            animations.refresh)
                    })
            );
        }
    },
    mounted() {
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);

        this.$el.stop = (event) => event.stopPropagation();
        this.$el.querySelectorAll('.editor .personalized, .editor .number, .editor .deadline').forEach(element =>
            element.addEventListener('click', this.$el.stop));

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.addEventListener('input', this.input));

        let timeout;
        this.observer = new ResizeObserver(() => {
            if (this.mounted) {
                const target = this.$el.querySelector('.notes .form-control');
                this.$el.querySelector('.notes .input-group-text').style.height = `${target.offsetHeight}px`;
                if (!global.touch && this.hover !== 'load') {
                    target.classList.remove('bg-body-tertiary');
                    target.classList.add('bg-body-secondary');
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        if (this.hover !== target) {
                            target.classList.remove('bg-body-secondary');
                            target.classList.add('bg-body-tertiary');
                        }
                        timeout = null;
                    }, 101)
                }
            }
        })
        this.observer.observe(this.$el.querySelector('.notes .form-control'));

        if (!global.touch) {
            this.$el.addEventListener('pointermove', this.recover);

            this.$el.querySelectorAll('.form-check-input').forEach(element =>
                element.addEventListener('focus', this.blur));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('blur', this.release));

            this.$el.querySelectorAll('.dropdown').forEach(element => {
                element.focus = (event) => this.focus(event, element);
                element.release = (event) => this.release(event, element);
                element.addEventListener('show.bs.dropdown', element.focus);
                element.addEventListener('hidden.bs.dropdown', element.release);
            });
        }
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.editor .personalized, .editor .number, .editor .deadline').forEach(element =>
            element.removeEventListener('click', this.$el.stop));

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.removeEventListener('input', this.input));

        if (!global.touch) {
            this.$el.removeEventListener('pointermove', this.recover);

            this.$el.querySelectorAll('.form-check-input').forEach(element =>
                element.removeEventListener('focus', this.blur));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('blur', this.release));

            this.$el.querySelectorAll('.dropdown').forEach(element => {
                element.removeEventListener('show.bs.dropdown', element.focus);
                element.removeEventListener('hidden.bs.dropdown', element.release);
            });
        }
        this.observer.disconnect();
        this.observer = null;

        this.selection = {
            title: null,
            calendar: null,
            activity: null,
            daily: null,
            start: { date: null, time: null },
            end: { date: null, time: null },
            repetition: null,
            recurrence: null,
            notes: null
        };
        this.enable = {
            start: null,
            end: null
        };
        this.delta = 0;
        this.alert = {
            title: null,
            period: null,
            duration: null
        };
        this.submenu = {
            repetition: null,
            reurrence: null
        };
        this.hover = null;
        this.mounted = null;
        this.inert = true;
        this.restore = null;
    }
}
</script>

<style>
.editor .modal-header {
    height: 3rem;
    padding: 0.5rem;
    padding-left: 0.9rem;
}

@media (hover: none) and (pointer: coarse) {
    .editor .modal-header .close {
        background-color: var(--bs-body-bg) !important;
    }
}

@media (hover: hover) and (pointer: fine) {
    .editor .modal-header button:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .editor .submenu button:hover,
    .editor .modal-footer button:hover:not(:disabled) {
        background-color: var(--bs-secondary-bg) !important;
        color: var(--bs-body-color) !important;
    }
}

.editor .input-group,
.editor .dropdown,
.editor .daily,
.editor .enable {
    transition: transform 0.1s ease-out;
    cursor: pointer;
    z-index: 3;
}

.editor .recurrence {
    z-index: 2;
}

.editor .start .enable,
.editor .start .input-group,
.editor .end .enable,
.editor .end .input-group,
.editor .notes {
    z-index: 1;
}

.editor .enable:active,
.editor .modal-footer button:active:not(:disabled) {
    transform: scale(var(--pop-lg));
}

.editor .input-group:active:not(.disable),
.editor .dropdown:active:not(.disable),
.editor .daily:active:not(.disable){
    transform: scale(var(--pop-xxl));
}

.editor .start .input-group:active,
.editor .end .input-group:active {
    transform: scale(calc(var(--pop-xxl) - 0.02));
}

.editor .start .input-group:has(>input:disabled),
.editor .end .input-group:has(>input:disabled) {
    transform: none !important;
}

.editor .modal-header button:active{
    transform: scale(var(--pop-md));
}

.editor .modal-body {
    padding: 0.9rem;
    padding-top: 0.75rem;
    padding-bottom: 0.7rem;
}

.editor .form-label {
    font-size: 0.8rem;
    padding-top: 0.2rem;
}

.editor .modal-footer {
    height: 3rem;
    padding: 0.5rem;
    justify-content: space-between;
}

.editor .modal-header .close {
    border-radius: 50%;
    border: none;
}

.editor .dropdown-menu {
    font-size: 0.7rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
}

.editor .dropdown-menu hr {
    margin-top: 0.2rem;
    margin-bottom: 0.15rem;
}

.editor .dropdown-item {
    height: 1.8rem;
    display: flex;
    align-items: center;
}

.editor .dropdown-item span {
    width: 7.75rem;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.editor .dropdown-menu li:has(>.personalized) {
    height: 1.9rem;
    display: flex;
    align-items: center;
}

.editor .dropdown-menu>div:first-of-type>li:nth-of-type(even) .dropdown-item {
    background-color: var(--bs-tertiary-bg);
}

.editor .input-group,
.editor .activity,
.editor .calendar,
.editor .repetition,
.editor .recurrence,
.editor .daily {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}

.editor .start {
    margin-top: 0.7rem;
}

.editor .modal-body span:has(>i) {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0 0 1rem;
    height: 2rem;
    width: 2rem;
    border: none;
}

.editor .modal-body .input-group-text {
    width: 2.05rem;
}

.editor .notes .input-group-text {
    display: flex;
    align-items: start;
    height: 4rem;
    padding-top: 0.46rem;
}

.editor .notes {
    margin-bottom: 0.5rem;
}

.editor .input-group-label {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    height: 2rem;
    width: 2.7rem;
    flex-shrink: 0;
    border: none;
    font-size: 0.65rem;
}

.editor .start,
.editor .end {
    display: flex;
    gap: 0.5rem;
}

.editor .start .date .form-control::-webkit-datetime-edit {
    opacity: var(--editor-start-date-opacity);
}

.editor .end .date .form-control::-webkit-datetime-edit {
    opacity: var(--editor-end-date-opacity);
}

.editor .start .time .form-control::-webkit-datetime-edit {
    opacity: var(--editor-start-time-opacity);
}

.editor .end .time .form-control::-webkit-datetime-edit {
    opacity: var(--editor-end-time-opacity);
}

.editor .modal-header i,
.editor .modal-body i {
    position: relative;
}

.editor .close i {
    top: 0.5px;
}

.editor .title i {
    font-size: 0.88rem;
    left: 0.5px;
}

.editor .calendar i {
    font-size: 0.7rem;
    left: 1.5px;
    top: 0.5px;
}

.editor .activity i {
    font-size: 0.79rem;
    left: 1.5px;
    top: 0.5px;
}

.editor .daily i {
    font-size: 0.82rem;
    left: 1.5px;
}

.editor .repetition i {
    font-size: 0.88rem;
    left: 1.5px;
    top: 0.5px
}

.editor .recurrence i {
    font-size: 0.8rem;
    left: 2px;
}

.editor .date i {
    font-size: 0.72rem;
    left: 1px;
}

.editor .time i {
    font-size: 0.77rem;
    left: 1px;
}

.editor .notes i {
    font-size: 0.75rem;
    bottom: 1px;
    left: 1px;
}

.editor .form-control,
.editor .dropdown button,
.editor .form-check {
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    border: none;
    box-shadow: none;
    line-height: 1.8;
    cursor: pointer;
}

.editor .title .form-control,
.editor .notes .form-control {
    cursor: inherit;
}

.editor .notes .form-control {
    height: 4rem;
    min-height: 2rem;
    scrollbar-width: none;
    line-height: 1.5;
    padding-top: 0.46rem;
}

.editor .dropdown button,
.editor .form-check {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    padding-left: 0.3rem;
    padding-right: 0.5rem;
    border: none;
}

.editor .dropdown button {
    padding-left: 0.85rem;
    padding-right: 0.8rem;
}

.editor .dropdown-menu {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.7rem;
}

.editor .dropdown-item {
    height: 2rem;
    padding-left: 0.8rem;
    display: flex;
    align-items: center;
}

.editor .dropdown-menu li:nth-of-type(1) .dropdown-item {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.editor .dropdown-menu li:nth-last-of-type(1) .dropdown-item {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.editor .dropdown-menu li:nth-of-type(even) .dropdown-item {
    background-color: var(--bs-tertiary-bg);
}

.editor .dropdown-menu hr {
    margin: 0;
}

.editor .dropdown-menu .dropdown-item:not(.frequency):not(.iteration):hover,
.editor .dropdown-menu .dropdown-item:not(.frequency):not(.iteration):active {
    background-color: var(--background-secondary) !important;
    color: white !important;
}

.editor .personalized.dropdown-item i {
    font-size: 0.7rem !important;
    margin-right: 0.8rem;
}

.editor .personalized.dropdown-item {
    height: 2.4rem !important;
}

.editor li:has(.personalized) {
    height: 2.4rem !important;
}

.editor .form-check-label {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    margin: 0;
    padding-left: 0.5rem;
    cursor: pointer;
}

.editor .form-check-input {
    height: 1rem;
    width: 1.75rem;
    border: none;
    z-index: 1;
    cursor: pointer;
    margin: 0;
}

.editor .enable .form-check-input {
    height: 1rem;
    width: 1.75rem;
    border: none;
    z-index: 1;
    cursor: pointer;
}

.editor .enable {
    width: auto;
    border-radius: 1rem;
    margin: 0;
    padding: 0.5rem;
}

.editor div:has(> .date),
.editor div:has(> .time) {
    display: flex;
    gap: 0.5rem;
    width: 102%;
    overflow: hidden;
}

.editor div .time {
    min-width: 0;
}

.editor .start:has([type="date"]:disabled) .input-group-label,
.editor .start:has([type="date"]:disabled) .input-group-text,
.editor .start:has([type="date"]:disabled) .form-control {
    opacity: 0.4;
}

.editor .end:has([type="date"]:disabled) .input-group-label,
.editor .end:has([type="date"]:disabled) .input-group-text,
.editor .end:has([type="date"]:disabled) .form-control {
    opacity: 0.4;
}

.editor .form-check-input:checked {
    background-color: var(--background-secondary);
}

.editor .form-check-input:focus {
    outline: none;
    box-shadow: none;
}

.editor .form-control::-webkit-calendar-picker-indicator {
    font-size: 0.7rem;
    background-color: var(--background-secondary);
    border-radius: 1rem;
    padding: 0.35rem;
    position: relative;
    left: 0.35rem;
    cursor: pointer;
}

.editor .form-control::-webkit-datetime-edit-year-field:focus,
.editor .form-control::-webkit-datetime-edit-month-field:focus,
.editor .form-control::-webkit-datetime-edit-day-field:focus,
.editor .form-control::-webkit-datetime-edit-hour-field:focus,
.editor .form-control::-webkit-datetime-edit-minute-field:focus {
    color: var(--bs-secondary);
    background-color: inherit;
}

.editor .form-control::-webkit-date-and-time-value {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
}

.editor .modal-footer button {
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

.editor .modal-footer .save {
    color: var(--text-primary);
    background-color: var(--background-primary);
}

.editor .modal-footer .delete {
    color: white;
    background-color: red;
}

.editor .modal-footer .save:disabled {
    background-color: var(--bs-secondary-bg);
    color: inherit;
    cursor: inherit;
}

.editor .modal-footer .exit {
    background-color: var(--background-secondary);
    margin-right: 0.5rem;
}

.editor .modal-footer>div {
    display: flex;
    margin: 0;
}

.editor .submenu {
    width: 15rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    margin-top: 0.5rem;
    padding-bottom: 0.5rem;
}

.editor div:has(>.save).submenu {
    display: flex;
    justify-content: space-between;
    padding-top: 0 !important;
}

.editor .submenu .back,
.editor .submenu .save {
    display: flex !important;
    justify-content: center !important;
    border-radius: 1rem !important;
    font-size: 0.6rem !important;
    font-weight: 500 !important;
    height: 1.7rem !important;
    width: auto !important;
    padding-left: 0.8rem !important;
    padding-right: 0.8rem !important;
    cursor: pointer;
    color: var(--text-secondary);
    background-color: var(--background-secondary);
}

.editor .disable {
    pointer-events: none;
    opacity: 0.8;
}

.editor .form-control.disable::-webkit-calendar-picker-indicator {
    display: none;
}

.editor .dropdown-toggle.disable::after {
    display: none !important;
}

.editor .alert {
    margin-bottom: 0.5rem;
    padding: 0;
    font-size: 0.7rem;
    color: red;
}

.editor .warning {
    border: 0.11rem solid red !important;
}

.editor .complete {
    color: var(--text-primary) !important;
    background-color: var(--background-primary) !important;
}
</style>