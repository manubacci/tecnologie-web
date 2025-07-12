import axios from 'axios';
import router from '../store/router';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';

export function luminance(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    return luminance > 0.5;
}

export function distance(first, second) {
    first = first.replace('#', '');
    second = second.replace('#', '');
    const r = parseInt(first.substring(0, 2), 16) - parseInt(second.substring(0, 2), 16);
    const g = parseInt(first.substring(2, 4), 16) - parseInt(second.substring(2, 4), 16);
    const b = parseInt(first.substring(4, 6), 16) - parseInt(second.substring(4, 6), 16);

    return Math.sqrt(r ** 2 + g ** 2 + b ** 2) < 150;
}

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function weekday(day) {
    return settings.format === 'it-IT' ? ((day.getDay() + 6) % 7) : day.getDay();
}

export function month(day, amount) {
    const month = day.getMonth();
    day.setMonth(day.getMonth() + amount);
    if (amount < 0)
        while ((day.getMonth() === month) && ((day.getMonth() - amount + 12) % 12 !== month))
            day.setDate(day.getDate() - 1);
    else
        while ((day.getMonth() !== month) && ((day.getMonth() - amount + 12) % 12 !== month))
            day.setDate(day.getDate() - 1);
}

export function appearance() {
    const preset = JSON.parse(sessionStorage.getItem('preset'));
    if (preset)
        Object.assign(settings, preset);

    document.body.setAttribute('data-bs-theme', settings.theme);
    document.documentElement.style.setProperty('--background-primary', settings.color);
    document.documentElement.style.setProperty('--text-primary',
        luminance(settings.color) ? '#000000' : '#FFFFFF');

    document.documentElement.style.setProperty('--background-secondary', settings.theme === 'dark'
        ? '#424649' : '#D3D4D5');
    document.documentElement.style.setProperty('--background-tertiary', settings.theme === 'dark'
        ? '#2B3036' : '#F2F2F2');
    document.documentElement.style.setProperty('--text-secondary', settings.theme === 'dark'
        ? '#FFFFFF' : '#000000');
}

export function compare(first, second, type = 'day') {
    let compare = false;
    if (!first || !second)
        return;
    if (type === 'day') {
        compare = first.getDate() === second.getDate() &&
            first.getMonth() === second.getMonth() &&
            first.getFullYear() === second.getFullYear();
    } else if (type === 'week') {
        const start = (date) => {
            date.setDate(date.getDate() - weekday(date));
            return date;
        };
        compare = start(new Date(first)).getDate() === start(new Date(second)).getDate() &&
            start(new Date(first)).getMonth() === start(new Date(second)).getMonth() &&
            start(new Date(first)).getFullYear() === start(new Date(second)).getFullYear();
    }
    return compare;
}

export async function profile() {
    try {
        const response = await axios.get('/api/user/profile');
        if (response.data.user) {
            global.user = response.data.user._id;
            Object.assign(global.profile, response.data.user);
            await find();
        } else {
            if (router.currentRoute.value.name === 'notes') {
                router.push({ name: 'home' });
            }
            appearance();
        }
    } catch (error) {
        console.error('Error while loading profile:', error);
    }
};

export async function find() {
    try {
        const response = await axios.get('/api/settings/find', { params: { user: global.user } });
        if (response.data.settings && typeof response.data.settings === 'object') {
            settings.theme = response.data.settings.theme;
            settings.color = response.data.settings.color;
            settings.format = response.data.settings.format;
            settings.seconds = response.data.settings.seconds;
            settings.invasive = response.data.settings.invasive;
            settings.order = response.data.settings.order;

            sessionStorage.setItem('preset', 'null');
            appearance();
        } else await update()
    } catch (error) {
        console.error('Error while searching settings:', error);
    }

    try {
        const response = await axios.get('/api/calendars/find', { params: { user: global.user } });
        if (response.data.calendars && typeof response.data.calendars === 'object') {
            global.calendars = response.data.calendars.sort((a, b) => a.title.localeCompare(b.title));
        }
    } catch (error) {
        console.error('Error while searching calendars:', error);
    }

    try {
        const response = await axios.get('/api/events/find', { params: { user: global.user } });
        if (response.data.events && typeof response.data.events === 'object') {
            response.data.events.forEach(event => {
                event.start = event.start ? new Date(event.start) : null;
                event.end = event.end ? new Date(event.end) : null;
            })
            global.events = response.data.events;
        }
    } catch (error) {
        console.error('Error while searching events:', error);
    }

    try {
        const response = await axios.get('/api/notes/find', { params: { user: global.user } });
        if (response.data.notes && typeof response.data.notes === 'object') {
            response.data.notes.forEach(note => {
                note.date = new Date(note.date);
                note.update = new Date(note.update);
            })
            global.notes = response.data.notes;

            global.preview = sessionStorage.getItem("preview") || global.notes[0]?._id;

            if (!global.notes.find(note => note._id == global.preview))
                global.preview = global.notes[0]?._id;
            sort();
        }
    } catch (error) {
        console.error('Error while searching events:', error);
    }
};

export async function update() {
    try {
        const data = {}
        Object.assign(data, settings);
        data.user = global.user;
        await axios.put('/api/settings/update', data);
    } catch (error) {
        console.error('Error while updating settings:', error);
    }
};

export function last(target, start, steps) {
    let matching, i = 0;
    while (target > start) {
        const point = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        month(point, i);
        i += steps;
        if (point <= target)
            matching = new Date(point);
        else break;
    }
    return matching;
}

export function closest(days, target) {
    days.sort((a, b) => b - a);
    for (let day of days)
        if (day <= target)
            return day;
    return days[0];
}

export function show(event, target) {
    if (!event.daily && !event.end && !event.activity)
        return {
            show: target >= new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()),
            alpha: 0
        };
    else if (!event.daily && !event.start && !event.activity)
        return {
            show: target <= new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()),
            alpha: 0
        };
    else {
        const repetition = JSON.parse(JSON.stringify(event.repetition))[0];
        const recurrence = JSON.parse(JSON.stringify(event.recurrence))[0];

        let frequency, alpha = 0;

        if (!event.activity) {

            let weekdays;
            frequency = true;

            const date = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
            const milliseconds = 1000 * 60 * 60 * 24;
            const duration = !event.daily ? Math.round((
                new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()) -
                new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())) /
                milliseconds) : 0;

            const times = recurrence.frequency === 'custom' && recurrence.custom.iteration === 'times',
                deadline = recurrence.frequency === 'custom' && recurrence.custom.iteration === 'deadline';

            switch (repetition.frequency) {
                case 'daily':
                    if (times) {
                        frequency = Math.round((target - date) / milliseconds) - duration <= recurrence.custom.times;
                    } else if (deadline) {
                        const deadline = new Date(recurrence.custom.deadline);
                        frequency = target.getTime() - duration * milliseconds <= deadline.getTime();
                    }
                    break;
                case 'weekly':
                    if (times) {
                        frequency = Math.round((target - date) / milliseconds) - duration <= 7 * recurrence.custom.times;
                    } else if (deadline) {
                        const deadline = new Date(recurrence.custom.deadline);
                        frequency = target.getTime() - duration * milliseconds <= deadline.getTime();
                    }
                    alpha = Math.round((target - date) / milliseconds) % 7;
                    break;
                case 'monthly': case 'yearly':
                    if (times) {
                        const deadline = new Date(date);
                        month(deadline, (repetition.frequency === 'monthly' ? 1 : 12) * recurrence.custom.times);
                        frequency = target.getTime() - duration * milliseconds <= deadline.getTime();
                    } else if (deadline) {
                        const deadline = new Date(recurrence.custom.deadline);
                        frequency = target.getTime() - duration * milliseconds <= deadline.getTime();
                    }
                    alpha = Math.round((target - last(target, event.start, repetition.frequency === 'monthly' ? 1 : 12)) / milliseconds);
                    break;
                case 'custom':
                    switch (repetition.custom.frequency) {
                        case 'daily':
                            alpha = Math.round((target - date) / milliseconds) % repetition.custom.interval;
                            break;
                        case 'weekly': case 'monthly':
                            if (repetition.custom.frequency === 'weekly' && repetition.custom.weekdays.length === 1 && repetition.custom.weekdays[0] == event.start.getDay())
                                alpha = Math.round((target - date) / milliseconds) % (7 * repetition.custom.interval);
                            else if (repetition.custom.frequency === 'monthly' && repetition.custom.weekdays.length === 0)
                                alpha = Math.round((target - last(target, event.start, repetition.custom.interval)) / milliseconds);
                            else {
                                weekdays = [...repetition.custom.weekdays];
                                if (compare(event.end, target, 'week')) {
                                    weekdays.push(event.start.getDay());
                                    weekdays.sort((a, b) => a - b);
                                }
                                let day = closest([...weekdays], target.getDay());

                                const matching = new Date(date);
                                matching.setDate(matching.getDate() - weekday(matching));
                                while (matching.getDay() !== day)
                                    matching.setDate(matching.getDate() + 1);

                                alpha = Math.round((target - matching) / milliseconds) % (7 * repetition.custom.interval);
                            }
                            break;
                        case 'yearly':
                            alpha = Math.round((target - last(target, event.start, 12 * repetition.custom.interval)) / milliseconds);
                            break;
                    }
                    break;
            }
            frequency = frequency &&
                (repetition.frequency !== 'no' && repetition.frequency !== 'incomplete' && repetition.frequency !== 'complete' && target > event.start && alpha >= 0 && alpha <= duration);

            if (repetition.frequency === 'custom' &&
                repetition.custom.frequency === 'monthly' &&
                repetition.custom.weekdays.length > 0) {

                frequency = frequency &&
                    repetition.custom.numbers.some(number => {
                        return weekdays.some(day => {
                            const first = new Date(target.getFullYear(), target.getMonth(), 1);
                            while (first.getDay() !== day)
                                first.setDate(first.getDate() + 1);
                            first.setDate(first.getDate() + 7 * (number - 1));

                            const start = new Date(first);
                            start.setDate(start.getDate() - weekday(start));
                            while (start.getDay() !== day)
                                start.setDate(start.getDate() + 1);

                            return (target.getMonth() - start.getMonth()) % repetition.custom.interval === 0 &&
                                target.getTime() === start.getTime();
                        });
                    });
            }
        }
        let today = global.today.day;
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        let end = event.end;

        if (event.activity && repetition.frequency == 'complete') {
            repetition.custom = new Date(repetition.custom);
            if (!event.end || end.getTime() < repetition.custom.getTime())
                end = repetition.custom;
        } else if (event.activity && repetition.frequency == 'incomplete') {
            if (!event.end || end.getTime() < today.getTime()) {
                end = today;
                if (!event.end && today < event.start )
                    end = event.start;
                    
            }
        }

        const focus = (event.daily && compare(event.start, target)) ||
            (!event.daily && ((compare(event.start, target) && compare(end, target)) ||
                (compare(event.start, target) && target <= end) ||
                (compare(end, target) && target >= event.start) ||
                (target >= event.start && target <= end)));

        return { show: (focus || frequency), alpha };
    }
}

export function start(event, target) {
    let start;

    if (!event.end) {
        if (!compare(event.start, target))
            start = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        else
            start = event.start;
    } else if (!event.start)
        start = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    else {

        if (!compare(event.start, target))
            start = new Date(target);
        else
            start = event.start;

        const repetition = JSON.parse(JSON.stringify(event.repetition))[0];
        const date = {
            start: new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()),
            end: new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())
        };

        let alpha = 0;
        const milliseconds = 1000 * 60 * 60 * 24;
        const duration = Math.round((
            new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()) -
            new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())) /
            milliseconds);

        switch (repetition.frequency) {
            case 'weekly':
                alpha = Math.round((target - date.start) / milliseconds) % 7;
                break;
            case 'monthly': case 'yearly':
                alpha = Math.round((target - last(target, event.start, repetition.frequency === 'monthly' ? 1 : 12)) / milliseconds);
                break;
            case 'custom':
                switch (repetition.custom.frequency) {
                    case 'daily':
                        alpha = Math.round((target - date.start) / milliseconds) % repetition.custom.interval;
                        break;
                    case 'weekly': case 'monthly':
                        if (repetition.custom.frequency === 'weekly' && repetition.custom.weekdays.length === 1 && repetition.custom.weekdays[0] == event.start.getDay())
                            alpha = Math.round((target - date.start) / milliseconds) % (7 * repetition.custom.interval);
                        else if (repetition.custom.frequency === 'monthly' && repetition.custom.weekdays.length === 0)
                            alpha = Math.round((target - last(target, event.start, repetition.custom.interval)) / milliseconds);
                        else {
                            const weekdays = [...repetition.custom.weekdays];
                            if (compare(event.end, target, 'week')) {
                                weekdays.push(event.start.getDay());
                                weekdays.sort((a, b) => a - b);
                            }

                            let matching = new Date(date.start);
                            const day = closest([...weekdays], target.getDay());

                            matching.setDate(matching.getDate() - weekday(matching));
                            while (matching.getDay() !== day)
                                matching.setDate(matching.getDate() + 1);

                            alpha = Math.round((target - matching) / milliseconds) % (7 * repetition.custom.interval);
                        }
                        break;
                    case 'yearly':
                        alpha = Math.round((target - last(target, event.start, 12 * repetition.custom.interval)) / milliseconds);
                        break;
                }
                break;
        }

        let period;
        function evaluate() {
            const matching = new Date(target);
            matching.setDate(matching.getDate() - alpha);

            if (!compare(matching, target) || event.end.getTime() >= period.getTime())
                start = new Date(target.getFullYear(), target.getMonth(), target.getDate());
            else
                start = event.start;
        }

        if (repetition.frequency === 'daily' && target > event.start) {
            if (!compare(event.start, event.end)) {

                const next = new Date(event.start);
                next.setDate(next.getDate() + 1);
                if (event.end >= next)
                    start = new Date(target.getFullYear(), target.getMonth(), target.getDate());
                else
                    start = event.start;
            } else
                start = event.start;
        }
        else if ((repetition.frequency === 'weekly' ||
            (repetition.frequency === 'custom' && repetition.custom.frequency === 'daily')) &&
            target > event.start && alpha >= 0 && alpha <= duration) {

            period = new Date(event.start);
            period.setDate(period.getDate() + (repetition.frequency === 'weekly' ? 7 : repetition.custom.interval));
            evaluate();
        }
        else if (repetition.frequency === 'monthly' &&
            target > event.start && alpha >= 0 && alpha <= duration) {

            period = new Date(event.start);
            month(period, 1);
            evaluate();
        }
        else if (repetition.frequency === 'yearly' &&
            target > event.start && alpha >= 0 && alpha <= duration) {

            period = new Date(event.start);
            month(period, 12);
            evaluate();
        }
        else if (repetition.frequency === 'custom' &&
            (repetition.custom.frequency === 'weekly' || repetition.custom.frequency === 'monthly') &&
            target > event.start && alpha >= 0 && alpha <= duration) {

            if (repetition.custom.frequency === 'weekly' && repetition.custom.weekdays.length === 1 && repetition.custom.weekdays[0] == event.start.getDay()) {
                period = new Date(event.start);
                period.setDate(period.getDate() + 7 * repetition.custom.interval);
                evaluate();
            } else if (repetition.custom.frequency === 'monthly' && repetition.custom.weekdays.length === 0) {
                period = new Date(event.start);
                month(period, repetition.custom.interval);
                evaluate();
            } else
                start = event.start;
        }
        else if (repetition.frequency === 'custom' &&
            repetition.custom.frequency === 'yearly' &&
            target > event.start && alpha >= 0 && alpha <= duration) {

            period = new Date(event.start);
            month(period, 12 * repetition.custom.interval);
            evaluate();
        }
        start = new Date(target.getFullYear(), target.getMonth(), target.getDate(), start.getHours(), start.getMinutes(), start.getSeconds());
    }
    return start;
}

export function end(event, target) {
    let end;

    if (!event.start) {
        if (!compare(event.end, target))
            end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59);
        else
            end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), event.end.getHours(), event.end.getMinutes());
    } else if (!event.end)
        end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59);
    else {

        if (!compare(event.end, target)) {
            const point = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59);
            if (point >= event.start && point <= event.end)
                end = point;
        } else
            end = event.end;

        const repetition = JSON.parse(JSON.stringify(event.repetition))[0];

        const alpha = show(event, target).alpha;
        const duration = Math.round((
            new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()) -
            new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())) /
            1000 * 60 * 60 * 24);

        function evaluate(period) {
            const next = new Date(target);
            next.setDate(next.getDate() + 1);

            if (!compare(period, target) && show(event, next).show) {
                end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59);
            } else
                end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), event.end.getHours(), event.end.getMinutes());
        }

        if (repetition.frequency === 'daily' && target > event.start) {
            const next = new Date(target);
            next.setDate(next.getDate() + 1);

            if (!compare(event.start, event.end) && show(event, next).show)
                end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59);
            else {
                end = new Date(target);
                end.setHours(event.end.getHours())
                end.setMinutes(event.end.getMinutes())
            }
        }
        else if (
            (repetition.frequency !== 'no' && repetition.frequency !== 'daily')
            && (compare(target, event.start) || target > event.start) && alpha >= 0 && alpha <= duration
        ) {
            const period = new Date(target);
            period.setDate(period.getDate() - alpha + duration);
            evaluate(period);
        }
    }
    return end;
}

export function scroll(resume, date) {
    const target = new Date(parseInt(sessionStorage.getItem('target')));

    const yearly = resume.closest('.yearly') ? true : false;
    let top = JSON.parse(sessionStorage.getItem('resume')) || [];

    top = top.find(element => element.yearly === yearly &&
        (yearly || element.month === target.getMonth()) &&
        element.year === target.getFullYear())?.scroll;

    if (top || top === 0)
        resume.scrollTop = top;
    else {
        const dates = [];
        resume.querySelectorAll('.summary').forEach(element =>
            dates.push({
                day: parseInt(element.querySelector('.date').textContent),
                month: yearly && parseInt(element.querySelector('.month').textContent.replace(/^\/*/, ''))
            }));

        if (dates.length === 0)
            return

        let focus;
        if ((yearly || target.getMonth() === date.getMonth()) && target.getFullYear() === date.getFullYear()) {
            for (const date of dates) {
                if (date.day <= target.getDate() || yearly && date.month <= target.getMonth())
                    focus = date;
                else break;
            }
        }
        else if ((yearly || (target.getMonth() > date.getMonth() && target.getFullYear() === date.getFullYear())) ||
            target.getFullYear() > date.getFullYear())

            focus = dates[dates.length - 1];
        else
            focus = dates[0];

        const element = Array.from(resume.querySelectorAll('.summary'))
            .find(element =>
                element.querySelector('.date').textContent.trim() === String(focus.day).padStart(2, '0') &&
                (!yearly || element.querySelector('.month').textContent.trim() === '/' + String(focus.month).padStart(2, '0')));

        resume.scrollTo({
            top: element.offsetTop - resume.offsetTop
        })
    }
}

export function sort(editing) {

    let notes = [...global.notes];
    if (!editing)
        notes = notes.filter(note => note.title.trim() != '' || note.text.trim() != '');

    if (global.preview == -1)
        global.preview = notes[0]?._id;

    switch (settings.order) {
        case "title-ascending":
            notes.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "update-ascending":
            notes.sort((a, b) => b.update - a.update);
            break;
        case "creation-ascending":
            notes.sort((a, b) => b.date - a.date);
            break;
        case "dimension-ascending":
            notes.sort((a, b) => {
                const lenght = note =>
                    (note.title + note.text).replace(/\s+/g, "").length;
                return lenght(a) - lenght(b);
            });
            break;
        case "title-descending":
            notes.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "update-descending":
            notes.sort((a, b) => a.update - b.update);
            break;
        case "creation-descending":
            notes.sort((a, b) => a.date - b.date);
            break;
        case "dimension-descending":
            notes.sort((a, b) => {
                const lenght = note =>
                    (note.title + note.text).replace(/\s+/g, "").length;
                return lenght(b) - lenght(a);
            });
            break;
    };

    if (JSON.stringify(global.notes) !== JSON.stringify(notes)) {
        document.querySelector('.notes .list').classList.add('disappear');
        setTimeout(() => {
            document.querySelector('.notes .list').classList.remove('disappear');
            document.querySelector('.notes .list').classList.add('appear');

            global.notes = [...notes];

            setTimeout(() =>
                document.querySelector('.notes .list').classList.remove('appear'),
                animations.refresh);
        }, animations.refresh);
    }
}