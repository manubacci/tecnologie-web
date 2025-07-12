<template>
    <div class="resume">
        <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-editor"></button>
        <div v-if="length === 0" class="none">{{ italian ? "Nessun Evento" : "No Events" }}</div>
        <ul>
            <div v-for="event in events">
                <li :event="event.data._id">
                    <div class="summary">
                        <div class="calendar" :style="{ backgroundColor: color(event.data) }"></div>
                        <div class="title">{{ event.data.title }}</div>
                        <div class="time"> {{ time(event.start, event.end) }} </div>
                        <div class="date">{{ String(event.day).padStart(2, '0') }}</div>
                        <div v-if="large || yearly" class="month">{{ "/" + String(event.month + 1).padStart(2, '0') }}
                        </div>
                    </div>
                </li>
                <hr>
            </div>
        </ul>
    </div>
</template>

<script>
import { settings } from '../store/settings';
import { global } from '../store/global';
import { show, start, end, scroll } from '../utils/misc';

export default {
    name: 'resume',
    props: {
        date: {
            type: Date
        }
    },
    data() {
        return {
            length: null,
            top: null,
            yearly: null
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        target() {
            return new Date(parseInt(this.$route.params.scroll))
        },
        large() {
            return global.size.width > 768;
        },
        events() {
            const target = new Date(this.date),
                month = target.getMonth(),
                year = target.getFullYear();
            const events = [];

            while ((!this.yearly && target.getMonth() === month) || (this.yearly && target.getFullYear() === year)) {
                events.push(...
                    global.events
                        .filter(event => {
                            return !event.activity && show(event, target).show && this.calendar(event).show;
                        })
                        .map(event => (
                            {
                                data: event,
                                day: target.getDate(),
                                month: target.getMonth(),
                                start: start(event, target),
                                end: end(event, target),
                            }
                        ))
                );
                target.setDate(target.getDate() + 1);
            }
            this.length = events.length;
            setTimeout(() =>
                scroll(this.$el, this.date));
            return events;
        }
    },
    methods: {
        calendar(event) {
            return global.calendars.find(calendar => calendar._id === event.calendar);
        },
        color(event) {
            const calendar = this.calendar(event);
            if (calendar.title === 'Personale' || calendar.title === 'Personal')
                return 'var(--background-primary)';
            return `#${this.calendar(event).color}`;
        },
        time(start, end) {
            if (start.getHours() === 0 && start.getMinutes() === 0 &&
                end.getHours() === 23 && end.getMinutes() === 59)
                return this.italian ? 'Tutto il Giorno' : 'All Day';
            else if (start.getHours() === 0 && start.getMinutes() === 0)
                return (this.italian ? 'Fino alle' : 'Until') + ` ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
            else if (end.getHours() === 23 && end.getMinutes() === 59)
                return (this.italian ? 'Dalle' : 'From') + ` ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
            else
                return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} - ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        },
        scroll() {
            if (!global.swipe.transition)
                this.top = this.$el.scrollTop;
        },
        click(event) {
            const $el = event.target.closest('li');

            if (!$el || !this.length)
                return;

            const resume = this.$el,
                element = global.events
                    .find(element => element._id === $el.getAttribute("event"))

            if (!$el)
                return

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

            let delta = false;
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
                        resume.querySelector('.toggler').click();
                    } else if (forced === true) {
                        global.editor = {
                            event: element,
                            edit: true,
                            time: null,
                            day: null,
                            daily: false
                        };
                        resume.querySelector('.toggler').click();
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
        }
    },
    mounted() {
        if (this.$el.closest('.focus'))
            this.$el.addEventListener('scroll', this.scroll);
        this.$el.addEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);

        this.yearly = this.$el.closest('.yearly');
    },
    unmounted() {
        if (this.$el.closest('.focus'))
            this.$el.removeEventListener('scroll', this.scroll);
        this.$el.removeEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);

        this.length = null;
        this.top = null;
        this.yearly = null;
    },
    watch: {
        top(value) {
            const target = this.target;
            const yearly = this.yearly ? true : false;

            let top = JSON.parse(sessionStorage.getItem('resume')) || [];

            const element = top.find(element => element.yearly === yearly &&
                (yearly || element.month === target.getMonth()) &&
                element.year === target.getFullYear());
            const index = top.indexOf(element);

            if (index === -1)
                top.push({
                    yearly,
                    month: !yearly ? target.getMonth() : null,
                    year: target.getFullYear(),
                    scroll: value
                });
            else
                top[index].scroll = value;

            sessionStorage.setItem('resume', JSON.stringify(top));
        }
    }
}
</script>

<style>
.resume {
    overflow: auto;
}

@media (hover: hover) and (pointer: fine) {
    .resume li:hover {
        background-color: var(--bs-secondary-bg);
    }
}

.resume .summary {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

.resume .summary:active {
    transform: scale(var(--pop-xxl));
}

.resume .none {
    display: flex;
    justify-content: center;
    padding-top: 2.3rem;
    width: 100%;
    font-size: 0.9rem;
}

.resume ul {
    list-style: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
}

.resume .calendar {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 1rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 1.15rem;
}

.resume .title {
    font-size: 0.85rem;
    margin-right: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.resume .date {
    font-size: 1rem;
    font-weight: 500;
    color: var(--background-primary);
}

.resume .month {
    font-size: 0.8rem;
    font-weight: 500;
    height: 1.3rem;
    display: flex;
    align-items: flex-end;
    color: var(--background-primary);
}

.resume .time {
    font-size: 0.7rem;
    font-weight: 500;
    white-space: pre-line;
    text-align: center;
    margin-right: 1.5rem;
    margin-left: 1.5rem;
    flex-shrink: 0;
}

.resume hr {
    margin-left: 1rem !important;
    margin-right: 1rem !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    width: auto !important;
}
</style>