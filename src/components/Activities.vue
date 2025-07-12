<template>
    <div class="activities modal fade" id="modal-activities" :inert="inert">
        <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-editor"></button>

        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-body-tertiary">
                    <h6 class="modal-title">
                        {{ italian ? "Attività" : "Activities" }}
                    </h6>
                    <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="modal">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="empty" v-show="activities.length == 0">
                        <span>{{ italian
                            ? "Nessuna attività presente!\nPer aggiungere una nuova attività, creala\nnel calendario tramite il pulsante "
                            : "No activity available!\nTo add a new activity, create one\n in calendar view using the button "
                            }}</span>
                        <i class="bi bi-plus"></i>
                        <span>.</span>
                    </div>
                    <div class="list">
                        <button class="activity bg-body-tertiary" v-for="event in activities"
                            @mousedown="(e) => click(e, event)" @touchstart="(e) => click(e, event)">
                            <div class="informations">
                                <div class="title">
                                    <div class="dot" :style="{ backgroundColor: color(event) }"></div>
                                    <span>{{ event.title }}</span>
                                </div>
                                <div v-show="event.repetition[0].frequency == 'complete'" class="completed">
                                    {{ completed(event) }}</div>
                            </div>
                            <div class="headings">
                                <div v-if="event.start">
                                    <div class="heading">{{ italian ? "Inizio" : "Start" }}</div>
                                    <div class="start">{{ event.start.toLocaleDateString(format, {
                                        day: '2-digit', month: '2-digit', year:
                                            '2-digit'
                                    }) }}</div>
                                </div>
                                <div v-if="event.end">
                                    <div class="heading">{{ italian ? "Fine" : "End" }}</div>
                                    <div class="due">{{ event.end.toLocaleDateString(format, {
                                        day: '2-digit', month: '2-digit', year:
                                            '2-digit'
                                    }) }}</div>
                                </div>
                            </div>
                            <div class="progress"
                                :style="{ width: progress(event).value, backgroundColor: progress(event).color }">
                            </div>
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

export default {
    data() {
        return {
            inert: true,
            top: null
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        activities() {
            const activities = global.events.filter(event => event.activity);

            activities.sort((a, b) => {
                const start = {
                    a: a.start ? new Date(a.start).getTime() : Infinity,
                    b: b.start ? new Date(b.start).getTime() : Infinity
                }

                if (start.a !== start.b) return start.a - start.b;

                const end = {
                    a: a.end ? new Date(a.end).getTime() : Infinity,
                    b: b.end ? new Date(b.end).getTime() : Infinity
                }
                return end.a - end.b;
            });
            return activities;
        },
        format() {
            return settings.format;
        }
    },
    methods: {
        load() {
            this.inert = false;
        },
        hide() {
            this.inert = true;
        },
        click(event, activity) {
            const $el = this.$el,
                element = activity;

            const id = event.touches?.[0].identifier;

            const startX = global.touch
                ? event.touches[0].clientX
                : event.clientX,
                startY = global.touch
                    ? event.touches[0].clientY
                    : event.clientY;
            let deltaX = 0,
                deltaY = 0;

            let timer = 0;

            const hold = setInterval(() => {
                timer++;
                if (timer >= 5)
                    up(true);
            }, 100);

            var delta = false;
            function move(event) {
                const currentX = global.touch
                    ? Array.from(event.touches).find(touch => touch.identifier === id).clientX
                    : event.clientX,
                    currentY = global.touch
                        ? Array.from(event.touches).find(touch => touch.identifier === id).clientY
                        : event.clientY;
                deltaX = currentX - startX;
                deltaY = currentY - startY;

                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)
                    delta = true;
            }
            function up(forced) {
                clearInterval(hold);
                if (!delta) {
                    if (timer < 5) {
                        global.editor = {
                            event: element,
                            edit: false,
                            time: null,
                            day: null
                        };
                        global.activities = true;
                        $el.querySelector('.toggler').click();
                    } else if (forced === true) {
                        global.editor = {
                            event: element,
                            edit: true,
                            time: null,
                            day: null,
                            daily: false
                        };
                        global.activities = true;
                        $el.querySelector('.toggler').click();
                    }
                }
                if (forced !== true) {
                    timer = 0;
                    window.removeEventListener(global.touch ? 'touchmove' : 'mousemove', move);
                    window.removeEventListener(global.touch ? 'touchend' : 'mouseup', up);
                }
            }
            window.addEventListener(global.touch ? 'touchmove' : 'mousemove', move);
            window.addEventListener(global.touch ? 'touchend' : 'mouseup', up);
        },
        color(event) {
            const color = global.calendars.find(calendar => calendar._id === event.calendar).color
            return color === '' ? settings.color : color;
        },
        progress(event) {
            if (event.repetition[0].frequency == 'complete') {
                return {
                    value: '100%',
                    color: settings.theme == 'dark' ? '#666666' : '#888888'
                }
            } else if (event.start && event.end) {
                let today = global.today.day;
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                let value = ((today.getTime() - event.start.getTime()) / (event.end.getTime() - event.start.getTime())) * 100;
                if (value > 100) value = 100;
                else if (value < 0) value = 0;

                let color;
                if (value <= 25)
                    color = 'green';
                else if (value <= 50)
                    color = 'yellow';
                else if (value <= 75)
                    color = 'orange'
                else
                    color = 'red'

                return {
                    value: `${value}%`,
                    color
                }
            } else {
                return {
                    value: '0',
                    color: ''
                }
            }
        },
        completed(event) {
            const date = new Date(event.repetition[0].custom);
            return `${this.italian ? 'Completato il' : 'Completed at'} ${date.toLocaleDateString(this.format, {
                day: '2-digit', month: '2-digit', year: '2-digit'
            })}`;
        },
        scroll() {
            this.top = this.$el.querySelector('.list').scrollTop;
        }
    },
    mounted() {
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);

        const el = this.$el.querySelector('.list');
        this.$el.observer = new IntersectionObserver(() => {

            this.top = JSON.parse(sessionStorage.getItem("activities"));

            if (this.top == null) {

                let today = global.today.day;
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                const activities = this.activities;

                let focus = activities.reduce((closest, current) => {
                    const date = {
                        current: current?.start || current?.end,
                        closest: closest?.start || closest?.end
                    }

                    if (!date.current) return closest;
                    if (!date.closest) return current;

                    const difference = {
                        current: Math.abs(date.current.getTime() - today.getTime()),
                        closest: Math.abs(date.closest.getTime() - today.getTime()),
                    }
                    return difference.current < difference.closest ? current : closest;
                }, null);

                if (this.$el && focus) {
                    const index = activities.findIndex(activity => activity._id === focus._id);
                    focus = Array.from(this.$el.querySelectorAll('.activity'))[index];
                    focus.scrollIntoView();
                }
            } else
                this.$el.querySelector('.list').scrollTop = this.top;
        });
        this.$el.observer.observe(el);

        this.$el.querySelector('.list').addEventListener('scroll', this.scroll);
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);
        this.$el.observer.disconnect();
        this.$el.querySelector('.list').removeEventListener('scroll', this.scroll);
        this.inert = true;
        this.top = null;
    },
    watch: {
        "top"(value) {
            sessionStorage.setItem("activities", JSON.stringify(value))
        }
    }
}
</script>

<style>
.activities .modal-header {
    height: 3rem;
    padding: 0.5rem;
    padding-left: 0.9rem;
}

.activities .close {
    border-radius: 50%;
    border: none;
    transition: transform 0.1s ease-out;
    cursor: pointer;
    z-index: 2;
}

@media (hover: none) and (pointer: coarse) {
    .activities .close {
        background-color: var(--bs-body-bg) !important;
    }
}

@media (hover: hover) and (pointer: fine) {
    .activities .close:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

}

.activities .close:active {
    transform: scale(var(--pop-md));
}

.activities .close i {
    position: relative;
    top: 0.5px;
}

.activities .modal-body {
    max-height: calc(100vh - 10rem);
    padding: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.activities .list {
    max-height: calc(100vh - 11rem);
    overflow: auto;
}

.activities .dot {
    border-radius: 50%;
    width: 0.65rem;
    height: 0.65rem;
}

.activities .activity {
    all: unset;
    height: 2rem;
    width: calc(100% - 3rem);
    border-radius: 0.55rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.65rem;
    padding-bottom: 0.75rem;
    gap: 2rem;

    position: relative;
    overflow: hidden;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

.activities .activity:nth-last-of-type(1) {
    margin-bottom: 0;
}

.activities .informations {
    flex: 1;
    min-width: 0;
}

.activities .headings {
    flex-shrink: 0;
}

.activities .title {
    font-size: 0.9rem;
    display: flex;
    height: 1rem;
    gap: 0.75rem;
    align-items: center;
}

.activities .title>span {
    width: 100% !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.activities .headings>div {
    display: flex;
    justify-content: end;
    gap: 0.5rem;
}

.activities .completed {
    font-size: 0.75rem;
    font-weight: 300;
    margin-left: 1.4rem;
}

.activities .heading {
    text-align: end;
    font-size: 0.7rem;
    font-weight: 300;
}

.activities .start,
.activities .due {
    font-size: 0.75rem;
    font-weight: 400;
    width: 3.5rem;
    text-align: end;
}

.activities .progress {
    position: absolute;
    background-color: red;
    height: 0.2rem;
    left: 0;
    bottom: 0;
}

@media (hover: hover) and (pointer: fine) {
    .activities .activity:hover {
        color: var(--text-primary) !important;
        background-color: var(--background-secondary) !important;
    }
}

.activities .activity:active {
    transform: scale(var(--pop-xxl));
}


@media (hover: none) and (pointer: coarse) {

    .activities .close {
        background-color: var(--background-secondary) !important;
    }
}

@media (hover: hover) and (pointer: fine) {

    .activities .close:hover {
        background-color: var(--bs-tertiary-bg) !important;
    }
}

.activities .close:active {
    transform: scale(var(--pop-md));
}

.activities .empty {
    font-weight: 300;
    font-size: 0.75rem;
    line-height: 1.1rem;
    text-align: center;
    white-space: pre;
    margin-top: 1rem;
    margin-bottom: 1rem;
    width: 100%;
}
</style>