import { reactive } from 'vue';
export const global = reactive({

    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    size: {
        height: window.innerHeight,
        width: window.innerWidth,
        window: window.innerWidth
    },
    today: {
        day: new Date(),
        now: new Date(),
        alpha: 0,
    },
    swipe: {
        transition: false,
        component: 'schedule',
        point: new Date(0),
        delta: 0,
        top: 0,
        displayed: 1
    },
    editor: {
        event: null,
        edit: false,
        time: null,
        day: null,
        daily: false
    },
    repetition: {
        frequency: 'daily',
        interval: 1,
        numbers: [],
        weekdays: []
    },
    recurrence: {
        iteration: 'times',
        times: 1,
        deadline: null
    },
    user: null,
    profile: {
        username: null,
        email: null,
        password: null,
        name: null,
        birth: null,
        propic: null
    },
    events: [],
    calendars: [],
    notes: [],
    preview: null,
    activities: null,

    development: false
});