<template>
    <div v-if="period.start && period.end" v-show="calendar.show" class="event" :data-event="event._id"
        :style="{ height: height, width: width, top: top, left: left, backgroundColor: color(0.3) }">
        <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-editor"></button>

        <div v-show="parseInt(height) >= 30 && parseInt(width) >= 38" class="highlight"
            :style="{ backgroundColor: color() }"></div>
        <div class="text" :style="{ color: color(0.75) }">
            <div v-show="parseInt(height) >= 30" class="title" :style="{ color: color() }">
                {{ event.title }}
            </div>
            <div v-show="!period.daily && parseInt(height) >= 46 && time" class="time">
                <i v-show="small" class="bi bi-clock-fill"></i>
                {{ time }}
            </div>
        </div>
    </div>
</template>

<script>
import { global } from '../store/global';
import { settings } from '../store/settings';
import { weekday, compare, start, end, show } from '../utils/misc';

export default {
    props: {
        event: {
            type: Object
        },
        day: {
            type: Date
        }
    },
    data() {
        return {
            period: {
                start: null,
                end: null,
                target: null,
                daily: null
            },

            hourly: document.querySelector('.hourly')?.scrollHeight -
                document.querySelector('.spacer-top')?.offsetHeight -
                document.querySelector('.spacer-bottom')?.offsetHeight,

            margin: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--clock-width').trim()) *
                parseFloat(getComputedStyle(document.documentElement).fontSize)
        }
    },
    computed: {
        target() {
            return this.day ?? new Date(parseInt(this.$route.params.target));
        },
        start() {
            return this.event.start;
        },
        end() {
            return this.event.end;
        },
        small() {
            return global.size.width <= 575;
        },
        time() {
            if (!this.event.daily && !this.event.activity) {
                const target = this.period.target;
                const start = this.period.start,
                    end = this.period.end;

                const repetition = JSON.parse(JSON.stringify(this.event.repetition))[0];
                const top = (compare(this.event.start, target) || repetition.frequency !== 'no') && (start.getHours() !== 0 || start.getMinutes() !== 0),
                    bottom = (compare(this.event.end, target) || repetition.frequency !== 'no') && (end.getHours() !== 23 || end.getMinutes() !== 59);

                if (top && bottom)
                    return `${this.period.start.toLocaleTimeString(settings.format, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23'
                    })} - ${end.toLocaleTimeString(settings.format, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23'
                    })}`;
                else if (top)
                    return `${start.toLocaleTimeString(settings.format, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23'
                    })}`;
                else if (bottom)
                    return `${end.toLocaleTimeString(settings.format, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23'
                    })}`;
                else return;
            }
        },
        height() {
            let height;
            if (!this.period.daily) {
                const start = this.period.start,
                    end = this.period.end;
                const offset = (-end.getTimezoneOffset() / 60) - (-start.getTimezoneOffset() / 60);

                if (end.getHours() !== this.event.end?.getHours() + offset)
                    end.setHours(end.getHours() + offset);

                height = ((this.hourly *
                    (end.getTime() - start.getTime())) /
                    (60 * 60 * 24 * 1000));
            } else
                height = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
            return `${height - (height > 2 ? 2 : 0)}px`;
        },
        width() {
            this.calendar.show;
            let width = (global.size.width - this.margin) / (this.small ? 1 : 7);

            if (!this.period.daily) {
                const overlapped = this.overlapping();
                width /= overlapped.number;
                if (overlapped.number > overlapped.direct)
                    width += width * (overlapped.number - overlapped.direct);
            }
            return `${width - 3}px`;
        },
        top() {
            let top;
            if (!this.period.daily) {
                const start = this.period.start,
                    end = this.period.end;
                const midnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());

                start.setHours(start.getHours() + ((-start.getTimezoneOffset() / 60) - (-midnight.getTimezoneOffset() / 60)));
                top = ((this.hourly *
                    (start.getTime() - midnight.getTime())) /
                    (60 * 60 * 24 * 1000)) +
                    document.querySelector('.spacer-top').offsetHeight;
            } else
                top = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize) * this.overflowing().length + 1;

            return `${top + 1}px`;
        },
        left() {
            this.calendar.show;
            let width = (global.size.width - this.margin) / (this.small ? 1 : 7);
            let left = this.margin + width * (this.small ? 0 : weekday(this.period.target));

            if (!this.period.daily) {
                const overlapped = this.overlapping();
                width /= overlapped.number;
                left += width * overlapped.position;
            }

            return `${left + 1.5}px`;
        },
        calendar() {
            return global.calendars.find(calendar => calendar._id === this.event.calendar);
        }
    },
    methods: {
        click(event) {
            const $el = this.$el,
                element = this.event;

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
                        $el.querySelector('.toggler').click();
                    } else if (forced === true) {
                        global.editor = {
                            event: element,
                            edit: true,
                            time: null,
                            day: null,
                            daily: false
                        };
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
        color(alpha) {
            let today = global.today.day;
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const incomplete = this.event.activity && this.event.repetition[0].frequency == 'incomplete' &&
                this.target.getTime() > this.event.end?.getTime() && this.target.getTime() <= today.getTime();

            let complete = this.event.activity && this.event.repetition[0].frequency == 'complete';
            if (complete) {
                const completion = new Date(this.event.repetition[0].custom);
                complete = complete &&
                    ((this.target.getTime() > completion.getTime() && this.target.getTime() <= this.event.end?.getTime()) ||
                        (this.target.getTime() > this.event.end?.getTime() && this.target.getTime() <= completion.getTime()))
            }

            const color = incomplete || complete ? settings.theme == 'dark' ? '#666666' : '#888888' : this.calendar.color;
            let hex = color === '' ? settings.color : color;
            hex = hex.replace('#', '');
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);

            return `rgba(${r}, ${g}, ${b}, ${alpha ?? 1})`;
        },
        arrange(overlapping) {
            overlapping = overlapping.sort((a, b) => {
                const start = a.start - b.start;
                if (start !== 0) {
                    return start;
                }
                return a.end - b.end;
            });

            overlapping = overlapping.map(event => ({
                event,
                position: -1,
            }));

            overlapping.forEach(element => {
                let position = 0;

                while (true) {
                    if (overlapping.every(item => {
                        if (item.position !== position) {
                            return true;
                        }
                        return !(start(element.event, this.period.target) < end(item.event, this.period.target) &&
                            end(element.event, this.period.target) > start(item.event, this.period.target));
                    })) {
                        element.position = position;
                        break;
                    }
                    position++;
                }
            });
            return overlapping;
        },

        overlapping() {
            const filter = () => {
                overlapping = overlapping.filter(event => {
                    const target = this.period.target;
                    const daily = {
                        start: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
                        end: new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59)
                    };

                    return !(!settings.invasive && start(event, target).getTime() === daily.start.getTime() &&
                        end(event, target).getTime() === daily.end.getTime())
                });
            }


            let overlapping = global.events.filter(event => {
                const calendar = global.calendars.find(calendar => calendar._id === event.calendar);
                return !event.activity && !event.daily && show(event, this.period.target).show && calendar.show &&
                    this.period.start < end(event, this.period.target)
                    && this.period.end > start(event, this.period.target);
            });
            filter();

            const direct = overlapping.length;

            let length = 0
            while (overlapping.length !== length) {
                length = overlapping.length;
                overlapping.forEach(target => {
                    overlapping = overlapping
                        .concat(global.events.filter(event => {
                            const calendar = global.calendars.find(calendar => calendar._id === event.calendar);
                            return !event.activity && !event.daily && show(event, this.period.target).show && calendar.show &&
                                compare(start(target, this.period.target), start(event, this.period.target)) &&
                                start(target, this.period.target) < end(event, this.period.target) && end(target, this.period.target) > start(event, this.period.target);
                        }))
                    overlapping = overlapping
                        .filter((event, index) => {
                            return overlapping.indexOf(event) === index;
                        });
                });
            }
            filter();

            overlapping = this.arrange(overlapping);

            let number = 1;
            let position = 0;

            overlapping.forEach(element => {
                if (element.event._id === this.event._id)
                    position = element.position;
                number = Math.max(number, element.position + 1);
            })

            return { number, direct, position }
        },

        overflowing() {
            const index = global.events.indexOf(this.event);
            const overflowing = global.events.filter((event, i) => {

                const target = this.period.target;
                const daily = {
                    start: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
                    end: new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59)
                };
                const calendar = global.calendars.find(calendar => calendar._id === event.calendar);
                return i < index && this.period.daily &&
                    show(event, target).show && calendar.show &&

                    (event.daily || event.activity || (!settings.invasive && start(event, target).getTime() === daily.start.getTime() &&
                        end(event, target).getTime() === daily.end.getTime()));
            });

            return overflowing;
        },

        load() {
            this.period.target = this.target;
            this.period.start = start(this.event, this.period.target);
            this.period.end = end(this.event, this.period.target);

            const daily = {
                start: new Date(this.period.target.getFullYear(), this.period.target.getMonth(), this.period.target.getDate()),
                end: new Date(this.period.target.getFullYear(), this.period.target.getMonth(), this.period.target.getDate(), 23, 59)
            };
            this.period.daily = (this.event.daily || this.event.activity || (!settings.invasive && this.period.start.getTime() === daily.start.getTime() &&
                this.period.end.getTime() === daily.end.getTime()));

            const min = !this.small ? 0.960 : 0.980;
            const max = 0.998;
            const height = this.hourly - 2
            const normalized = min + (parseInt(this.height) / height) * (max - min);

            requestAnimationFrame(() => {
                if (this.$el?.style)
                    this.$el.style.setProperty('--pop-custom', normalized)
            });
        }
    },
    mounted() {
        this.load();
        requestAnimationFrame(() =>
            this.$el.addEventListener(global.touch ? 'touchstart' : 'mousedown', this.click));
    },
    unmounted() {
        this.$el.removeEventListener(global.touch ? 'touchstart' : 'mousedown', this.click);
        this.period = {
            start: null,
            end: null,
            target: null,
            daily: null
        };
    },
    watch: {
        target() {
            this.load();
        },
        start() {
            this.load();
        },
        end() {
            this.load();
        }
    }
};
</script>

<style>
.event {
    all: unset;
    position: absolute;
    display: flex;
    border-radius: 0.5rem;
    overflow-y: visible;
    z-index: 2;
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

@media (hover: hover) and (pointer: fine) {
    .event:hover {
        opacity: 0.8;
    }
}

.event:active {
    transform: scale(var(--pop-custom));
}

.event .highlight {
    flex-shrink: 0;
    margin-top: 0.4rem;
    margin-left: 0.4rem;
    width: 0.2rem;
    height: calc(100% - 0.8rem);
    border-radius: 0.5rem;
}

.event .text {
    font-size: 0.8rem;
    margin-top: 0.4rem;
    margin-left: 0.5rem;
    padding-right: 0.5rem;
    overflow: hidden;
}

.event .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}

.event .time i {
    font-size: 0.65rem;
    margin-right: 0.2rem;
}

.event .time {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
}
</style>