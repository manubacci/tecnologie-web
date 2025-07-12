import router from '../store/router';
import { global } from '../store/global';
import { compare, weekday, month } from './misc';
import { animations } from '../store/animations';

var block = null;

export function swipe(event, type) {

    if (global.swipe.transition) return
    global.swipe.transition = true;

    block = setTimeout(() =>
        window.dispatchEvent(global.touch
            ? new TouchEvent('touchend', event)
            : new MouseEvent('mouseup', event)),
        animations.block);

    if (global.swipe.component !== 'point')
        global.swipe.component = type || 'schedule';

    const period = document.querySelector('.wrapper:has(.period)');
    const week = document.querySelector('.wrapper:has(.week)');
    const schedule = document.querySelector('.wrapper:has(.schedule)');

    const special = document.querySelector('.wrapper:has(.yearly)') ||
        document.querySelector('.wrapper:has(.monthly)');

    let current = new Date(parseInt(router.currentRoute.value.params.target || router.currentRoute.value.params.scroll));
    let target = new Date(special
        ? parseInt(router.currentRoute.value.params.scroll)
        : parseInt(router.currentRoute.value.params.target) ?? JSON.parse(sessionStorage.getItem('target')));
    
    const width = global.size.width;
    let swipe = [];

    if (event) {
        const id = event.touches?.[0].identifier;

        const startX = global.touch
            ? event.touches[0].clientX
            : event.clientX,
            startY = global.touch
                ? event.touches[0].clientY
                : event.clientY;
        let deltaX = 0,
            deltaY = 0;

        var delta = false;

        let blockX;
        const threshold = width / 3;

        function move(event) {
            if (swipe.length === 0)
                clearTimeout(block);

            const currentX = global.touch
                ? Array.from(event.touches).find(touch => touch.identifier === id).clientX
                : event.clientX,
                currentY = global.touch
                    ? Array.from(event.touches).find(touch => touch.identifier === id).clientY
                    : event.clientY;
            deltaX = currentX - startX;
            deltaY = currentY - startY;

            if (global.touch && (type === 'schedule' ||
                (special && (event.target.closest('.summary') || special.querySelector('.yearly'))))
                && global.touch) {

                global.swipe.transition = true;
                if (Math.abs(deltaY) > Math.abs(deltaX))
                    blockX = true;

            } else if (global.touch)
                global.swipe.transition = false;

            if (global.swipe.component === 'point' && Math.abs(deltaX) >= 5)
                global.swipe.component = type;

            if (Math.abs(deltaX) >= 5 || Math.abs(deltaY) >= 5)
                delta = true;

            if (Math.abs(deltaX) >= 5)
                document.querySelector('#selfie').style.pointerEvents = 'none';

            const date = new Date(target);
            swipe = [];
            switch (type) {
                case 'period':
                    swipe.push(...[period, week, schedule]);
                    break;
                case 'week':
                    date.setDate(date.getDate() - 7 * Math.sign(deltaX));
                    if (date.getMonth() != target.getMonth()) swipe.push(period);
                    swipe.push(...[week, schedule]);
                    break;
                case 'schedule':
                    date.setDate(date.getDate() - (width <= 575 ? 1 : 7) * Math.sign(deltaX));
                    if (date.getMonth() != target.getMonth()) swipe.push(period);
                    if (!compare(date, target, 'week')) swipe.push(week);
                    swipe.push(schedule);
                    break;
                case 'yearly': case 'monthly':
                    swipe.push(special);
                    break;
            }
            if (!special)
                [period, week].forEach(component => {
                    if (!swipe.includes(component))
                        component.style.transform = `translateX(${-width}px)`;
                });

            if (!blockX) {
                if (!special)
                    schedule.querySelectorAll('.hourly').forEach(hourly => {
                        hourly.style.overflow = 'hidden';
                        hourly.scrollTop = document.querySelector('.focus .hourly').scrollTop;
                    });
                else {
                    special.querySelectorAll('.yearly').forEach(yearly => {
                        yearly.style.overflow = 'hidden';
                        yearly.scrollTop = document.querySelector('.focus.yearly').scrollTop;
                    });

                    special.querySelectorAll('.resume').forEach(resume =>
                        resume.style.overflow = 'hidden');
                }
                swipe.forEach(component => {
                    component.style.transform =
                        `translateX(${deltaX - width}px)`;
                })
            }
        }

        function up() {
            function assest(free) {
                swipe.forEach(component => {
                    component.style.transition = `transform ${animations.swipe / 1000}s ease-in-out`;
                    component.style.transform = `translateX(${-width}px)`;
                });
                update(free);
            }
            if (!blockX) {
                if (Math.abs(deltaX) > 5) {
                    swipe.forEach(component =>
                        component.style.transition = `transform ${animations.swipe / 1000}s ease-in-out`);

                    if (deltaX + global.swipe.delta < -threshold) {
                        swipe.forEach(component =>
                            component.style.transform = `translateX(${-2 * width}px)`);
                        switch (type) {
                            case 'period':
                                month(target, 1);
                                break;
                            case 'week':
                                target.setDate(target.getDate() + 7);
                                break;
                            case 'schedule':
                                target.setDate(target.getDate() + (width <= 575 ? 1 : 7));
                                break;
                            case 'monthly':
                                month(target, global.swipe.displayed);
                                break;
                            case 'yearly':
                                month(target, 12);
                                break;
                        }
                        if (!special)
                            animation();
                        update();

                    } else if (deltaX + global.swipe.delta > threshold) {
                        swipe.forEach(component =>
                            component.style.transform = 'translateX(0)');
                        switch (type) {
                            case 'period':
                                month(target, -1);
                                break;
                            case 'week':
                                target.setDate(target.getDate() - 7);
                                break;
                            case 'schedule':
                                target.setDate(target.getDate() - (width <= 575 ? 1 : 7));
                                break;
                            case 'monthly':
                                month(target, -global.swipe.displayed);
                                break;
                            case 'yearly':
                                month(target, -12);
                                break;
                        }
                        if (!special)
                            animation();
                        update();
                    } else
                        assest();
                } else if (!delta && global.swipe.point.getTime() !== 0 && !special)
                    point();
                else
                    assest(true);
            } else
                assest();

            window.removeEventListener(global.touch ? 'touchmove' : 'mousemove', move);
            window.removeEventListener(global.touch ? 'touchend' : 'mouseup', up);
        }
        window.addEventListener(global.touch ? 'touchmove' : 'mousemove', move);
        window.addEventListener(global.touch ? 'touchend' : 'mouseup', up);

    } else point();

    function animation() {
        if (width <= 575 && !compare(current, target, 'day')) {
            const weekdays = document.querySelectorAll('.focus .day');

            if (compare(current, target, 'week')) {
                const start = weekdays[weekday(current)].querySelector('.numeric');
                start.classList.remove('primary');
                start.querySelector('.selection').classList.add('pulse-out');

                if (start.closest('.today.target'))
                    start.style.color = 'var(--background-primary)';

                setTimeout(() => {
                    start.style.color = '';
                    start.querySelector('.selection').classList.remove('pulse-out');
                    start.classList.remove('focus', 'target');
                }, animations.pulse);
            }

            let end = weekdays[weekday(target)].querySelector('.numeric');
            const selection = end.querySelector('.selection');
            selection.style.opacity = 0;

            end.style.cursor = 'default';
            selection.style.opacity = '';
            end.classList.remove('focus');
            end.classList.add(compare(target, global.today.day) ? 'target' : 'focus');

            selection.classList.add('pulse-in');
            setTimeout(() => {
                selection.classList.remove('pulse-in')
                end.style.cursor = '';
            }, animations.pulse);
        }
    };

    function point() {
        global.swipe.transition = true;
        target = new Date(global.swipe.point);

        swipe = [];
        if (router.currentRoute.value.name === 'weekly') {
            if (target.getMonth() != current.getMonth() || target.getFullYear() != current.getFullYear())
                swipe.push(period);
            if (!compare(target, current, 'week')) swipe.push(week);
            swipe.push(schedule);

            schedule.querySelectorAll('.hourly').forEach(hourly => {
                hourly.style.overflow = 'hidden';
                hourly.scrollTop = schedule.querySelector('.focus .hourly').scrollTop;
            });
        } else {
            swipe.push(special);
            special.querySelectorAll('.yearly').forEach(yearly => {
                yearly.style.overflow = 'hidden';
                yearly.scrollTop = document.querySelector('.focus.yearly').scrollTop;
            });
        }

        swipe.forEach(component =>
            component.style.transition = `transform ${animations.swipe / 1000}s ease-in-out`);

        setTimeout(() => {
            if (target.getTime() > current.getTime())
                swipe.forEach(component =>
                    component.style.transform = `translateX(${-2 * width}px)`);
            else if (target.getTime() < current.getTime())
                swipe.forEach(component =>
                    component.style.transform = 'translateX(0px)');
            animation();
            update();
        }, animations.refresh);
    };

    function update(free) {
        global.swipe.transition = !free;
        setTimeout(() => {
            swipe.forEach(component =>
                component.style.transition = '');
            if (!special)
                router.push({
                    name: router.currentRoute.value.name,
                    params: { target: target.getTime() }
                });
            else
                router.push({
                    name: router.currentRoute.value.name,
                    params: {
                        scroll: target.getTime()
                    }
                });
            if (global.swipe.point.getTime() !== 0) {
                global.swipe.component = 'event'
                global.swipe.point = new Date(0);
            }
            if (!special) {
                schedule.querySelectorAll('.hourly').forEach(hourly =>
                    hourly.style.overflow = 'auto');
                global.swipe.transition = false;
            } else {
                special.querySelectorAll('.yearly').forEach(yearly => {
                    yearly.style.overflow = 'auto';
                    const top = yearly.scrollTop;
                    requestAnimationFrame(() => {
                        yearly.scrollTop = top;
                    })
                });
                special.querySelectorAll('.resume').forEach(resume =>
                    resume.style.overflow = 'auto');
                requestAnimationFrame(() =>
                    global.swipe.transition = false);
            }
            global.swipe.delta = 0;
            document.querySelector('#selfie').style.pointerEvents = 'auto';

        }, (!free ? animations.swipe : 0));
    };
}

export function toggle(type) {
    (document.querySelector(`.radio-${type}`)?.previousElementSibling).checked = true;

    const view = document.querySelector('.view');
    const previous = router.currentRoute.value.name;
    const target = new Date(parseInt(router.currentRoute.value.params.target) ||
        JSON.parse(sessionStorage.getItem('target')));

    global.swipe.component = 'schedule';
    if (type === 'weekly') {
        if (compare(target, global.today.day, 'day') ||
            (compare(target, global.today.day, 'week') && global.size.width > 575))
            document.querySelector('.navbar .today').classList.add('disappear');
        document.querySelector('.navbar .close').classList.add('disappear');
    } else
        document.querySelector('.navbar .edit').classList.add('disappear');

    view.classList.add('disappear');
    setTimeout(() => {
        view.classList.remove('disappear');
        if (type === 'weekly') {
            if (compare(target, global.today.day, 'day') ||
                (compare(target, global.today.day, 'week') && global.size.width > 575))
                document.querySelector('.navbar .today').classList.remove('disappear');
            document.querySelector('.navbar .close').classList.remove('disappear');
        } else
            document.querySelector('.navbar .edit').classList.remove('disappear');

        global.swipe.point = new Date(0);
        if (previous === 'weekly') {
            global.swipe.top = document.querySelector('.focus .hourly')?.scrollTop;
            sessionStorage.setItem('target', router.currentRoute.value.params.target);
        }

        if (type === 'weekly' && !JSON.parse(sessionStorage.getItem('target'))) {
            const now = new Date(Date.now());
            sessionStorage.setItem('target', now.getTime());
        }

        router.push({
            name: type,
            params: {
                target: type === 'weekly' ? sessionStorage.getItem('target') : undefined,
                scroll: type === 'weekly' ? undefined :
                    router.currentRoute.value.params.scroll ?? router.currentRoute.value.params.target
            }
        })

        if (type === 'weekly')
            sessionStorage.setItem('target', null);

        requestAnimationFrame(() => {
            if (type === 'weekly') {
                document.querySelector('.navbar .edit').classList.add('appear');
                document.querySelector('.focus .hourly').scrollTop = global.swipe.top;
            } else if (previous === 'weekly') {
                if (compare(target, global.today.day, 'day') ||
                    (compare(target, global.today.day, 'week') && global.size.width > 575))
                    document.querySelector('.navbar .today').classList.add('appear');
                document.querySelector('.navbar .close').classList.add('appear');
            }
        })
        view.classList.add('appear');
        setTimeout(() => {
            if (previous === 'weekly') {
                if (compare(target, global.today.day, 'day') ||
                    (compare(target, global.today.day, 'week') && global.size.width > 575))
                    document.querySelector('.navbar .today').classList.remove('appear');
                document.querySelector('.navbar .close').classList.remove('appear');
            } else
                document.querySelector('.navbar .edit').classList.remove('appear');
            view.classList.remove('appear');
            global.swipe.transition = false;
        }, animations.refresh);
    }, animations.refresh);
}