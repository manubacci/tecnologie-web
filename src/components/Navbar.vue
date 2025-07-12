<template>
    <nav class="navbar bg-body-tertiary">
        <button v-show="false" class="toggler" data-bs-toggle="modal" data-bs-target="#modal-editor"></button>
        <button v-show="false" class="writer" data-bs-toggle="modal" data-bs-target="#modal-writer"></button>

        <button class="options btn btn-sm bg-body" data-bs-toggle="offcanvas" data-bs-target="#menu" @click="menu">
            <i class="bi bi-list"></i>
        </button>
        <div v-show="view != 'notes' && view != 'home' && view != 'activities'">
            <div class="toggle btn-group bg-body">
                <div>
                    <div class="selection"></div>
                    <div v-if="!touch" class="hover bg-body-secondary"></div>

                    <input type="radio" class="btn-check" name="toggle-radio">
                    <div class="radio-weekly btn btn-sm" @mouseenter="enter" @mouseleave="leave"
                        @click="(event) => radio(event, 'weekly')">
                        {{ italian ? 'Giorno' : 'Week' }}
                    </div>

                    <input type="radio" class="btn-check" name="toggle-radio">
                    <div class="radio-monthly btn btn-sm" @mouseenter="enter" @mouseleave="leave"
                        @click="(event) => radio(event, 'monthly')">
                        {{ italian ? 'Mese' : 'Month' }}
                    </div>

                    <input type="radio" class="btn-check" name="toggle-radio">
                    <div class="radio-yearly btn btn-sm" @mouseenter="enter" @mouseleave="leave"
                        @click="(event) => radio(event, 'yearly')">
                        {{ italian ? 'Anno' : 'Year' }}
                    </div>
                </div>
            </div>

            <div>
                <button v-show="view !== 'weekly' || other" class="today" @click="today">
                    {{ italian ? 'Oggi' : 'Today' }}
                </button>
                <div v-show="!small && !touch">
                    <button class="previous btn btn-sm bg-body" @click="navigation">
                        <i class="bi bi-caret-left-fill"></i>
                    </button>
                    <button class="next btn btn-sm bg-body" @click="navigation">
                        <i class="bi bi-caret-right-fill"></i>
                    </button>
                </div>

                <button v-show="view !== 'weekly'" class="close btn btn-sm bg-body" @click="close">
                    <i class="bi bi-x"></i>
                </button>
                <button v-show="user && view === 'weekly'" class="edit btn btn-sm bg-body" @click="add">
                    <i class="bi bi-plus"></i>
                </button>
            </div>
        </div>
        <div v-show="view == 'notes'">
            <div v-show="!small && notes.length > 0">
                <button class="copy btn btn-sm bg-body" @click="copy">
                    <i class="bi bi-copy"></i>
                </button>
                <button class="delete btn btn-sm bg-body" @click="remove">
                    <i class="bi bi-trash3"></i>
                </button>
                <div class="divider"></div>
            </div>
            <button class="order dropdown-toggle btn btn-sm bg-body" data-bs-toggle="dropdown">
                <i class="bi bi-filter"></i>
            </button>

            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <div class="dropdown-item" @click="order('title-ascending')">
                        <div>
                            <i v-show="check == 'title-ascending'" class="check bi bi-check"></i>
                            {{ italian ? "Titolo" : "Title" }}
                        </div>
                        <i class="bi bi-sort-up"></i>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item" @click="order('update-ascending')">
                        <div>
                            <i v-show="check == 'update-ascending'" class="check bi bi-check"></i>
                            {{ italian ? "Data di Modifica" : "Update Date" }}
                        </div>
                        <i class="bi bi-sort-up"></i>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item" @click="order('date-ascending')">
                        <div>
                            <i v-show="check == 'date-ascending'" class="check bi bi-check"></i>
                            {{ italian ? "Data di Creazione" : "Creation Date" }}
                        </div>
                        <i class="bi bi-sort-up"></i>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item" @click="order('dimension-ascending')">
                        <div>
                            <i v-show="check == 'dimension-ascending'" class="check bi bi-check"></i>
                            {{ italian ? "Dimensione" : "Dimension" }}
                        </div>
                        <i class="bi bi-sort-up"></i>
                    </div>
                </li>
                <hr>
                <hr>
                <li>
                    <div class="dropdown-item" @click="order('title-descending')">
                        <div>
                            <i v-show="check == 'title-descending'" class="check bi bi-check"></i>
                            {{ italian ? "Titolo" : "Title" }}
                        </div>
                        <i class="bi bi-sort-down"></i>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item" @click="order('update-descending')">
                        <div>
                            <i v-show="check == 'update-descending'" class="check bi bi-check"></i>
                            {{ italian ? "Data di Modifica" : "Update Date" }}
                        </div>
                        <i class="bi bi-sort-down"></i>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item" @click="order('date-descending')">
                        <div>
                            <i v-show="check == 'date-descending'" class="check bi bi-check"></i>
                            {{ italian ? "Data di Creazione" : "Creation Date" }}
                        </div>
                        <i class="bi bi-sort-down"></i>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item" @click="order('dimension-descending')">
                        <div>
                            <i v-show="check == 'dimension-descending'" class="check bi bi-check"></i>
                            {{ italian ? "Dimensione" : "Dimension" }}
                        </div>
                        <i class="bi bi-sort-down"></i>
                    </div>
                </li>
            </ul>

            <button class="write btn btn-sm bg-body" @click="add">
                <i class="bi bi-pencil-square"></i>
            </button>
        </div>
    </nav>
</template>

<script>
import axios from 'axios';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';
import { compare, month, sort } from '../utils/misc';
import { swipe, toggle } from '../utils/swipe';

export default {
    data() {
        return {
            mounted: false
        };
    },
    computed: {
        target() {
            return new Date(parseInt(this.$route.params.target) || parseInt(this.$route.params.scroll));
        },
        view() {
            return this.$route.name;
        },
        touch() {
            return global.touch;
        },
        italian() {
            return settings.format === 'it-IT';
        },
        user() {
            return global.user;
        },
        width() {
            return global.size.window;
        },
        small() {
            return global.size.width <= 575;
        },
        other() {
            const other = !(compare(this.target, global.today.day, 'day') ||
                (compare(this.target, global.today.day, 'week') && !this.small));

            if (other) {
                const button = this.$el?.querySelector('.today');
                if (button)
                    button.style.opacity = 1;
            }

            return other
        },
        notes() {
            return global.notes;
        },
        preview() {
            return global.preview;
        },
        check() {
            return settings.order;
        }
    },
    methods: {
        enter(event) {
            if (!global.touch && event.target.closest('[class*="radio-"]')) {
                const toggle = Array.from(document.querySelectorAll('[class*="radio-"]'));
                const checked = toggle.indexOf(toggle.find(element => element.previousElementSibling.checked));
                const focus = toggle.indexOf(event.target.closest('[class*="radio-"]'));
                const hover = this.$el.querySelector('.hover');

                if (focus > checked) {
                    hover.style.left = `${checked * 3.4}rem`;
                    hover.style.right = '';
                    hover.style.width = `${(focus - checked + 1) * 3.4}rem`;
                } else if (focus < checked) {
                    hover.style.right = `${6.8 - (checked * 3.4)}rem`;
                    hover.style.left = '';
                    hover.style.width = `${(checked - focus + 1) * 3.4}rem`;
                }
            }
        },
        leave(event) {
            if (!global.touch && event.target.closest('[class*="radio-"]'))
                this.$el.querySelector('.hover').style.width = '3.4rem';
        },
        menu() {
            const tollerance = document.querySelector('.menu').offsetWidth;
            if (global.size.width > 575 + tollerance) {
                document.querySelector('.spacer').style.width = `${tollerance}px`;
                sessionStorage.setItem('menu', JSON.stringify(true));
            }
        },
        add() {
            if (this.view != "notes") {
                global.editor = {
                    event: null,
                    edit: null,
                    time: null,
                    day: null,
                    daily: false
                };
                this.$el.querySelector('.toggler').click();
            } else {
                if (this.small) {
                    if (!global.notes.some(note =>
                        note.title.trim() == '' && note.text.trim() == ''))
                        ['.navbar', '.view', '.menu'].forEach(item =>
                            document.querySelector(item).style.opacity = 0);
                    this.$el.querySelector('.writer').click();
                }

                if (!this.small || !global.notes.some(note =>
                    note.title.trim() == '' && note.text.trim() == '')) {

                    global.notes.unshift({
                        _id: -1,
                        title: "",
                        text: "",
                        date: new Date(global.today.now),
                        update: new Date(global.today.now),
                        tags: []
                    });
                    global.preview = global.notes[0]._id;

                    document.querySelector('.notes .note')?.classList.add('disappear');
                    requestAnimationFrame(() => {
                        document.querySelector('.notes .note')?.classList.remove('disappear');
                        document.querySelector('.notes .note')?.classList.add('appear');

                        const element = Array.from(document.querySelectorAll('.preview'))[0];
                        element.classList.add('appear');

                        if (global.notes.length == 0)
                            ['.notes .list', '.notes .divider'].forEach(element =>
                                document.querySelector(element).classList.add('appear'));

                        setTimeout(() => {
                            document.querySelector('.notes .note')?.classList.remove('appear');
                            element.classList.remove('appear');

                            if (global.notes.length == 0)
                                ['.notes .list', '.notes .divider'].forEach(element =>
                                    document.querySelector(element).classList.remove('appear'));
                        }, animations.refresh);
                    });
                }
            }
        },
        async order(type) {
            settings.order = type;
            sort();
            try {
                const data = {}
                Object.assign(data, settings);
                data.user = global.user;
                const response = await axios.put('/api/settings/update', data);
            } catch (error) {
                console.error('Error while updating settings:', error);
            }
        },
        async remove() {
            const note = global.notes.find(note => note._id == global.preview);
            if (note.title.trim() !== '' || note.text.trim() != '') {
                const alert = confirm(this.italian
                    ? 'Sei sicuro di voler eliminare la nota selezionata? Questa operazione è irreversibile e non potrà essere annullata!'
                    : 'Are you sure you want to delete the selected note? This action is irreversible and cannot be undone!');
                if (!alert)
                    return;
            }

            const element = Array.from(document.querySelectorAll('.preview')).find(note => note.getAttribute('note') === String(global.preview));

            element.classList.add('disappear');
            document.querySelector('.notes .note').classList.add('disappear');

            setTimeout(async () => {
                if (note.title.trim() !== '' || note.text.trim() != '') {
                    try {
                        await axios.get('/api/notes/drop', { params: { id: global.preview } });
                    } catch (error) {
                        console.error('Error while deleting notes:', error);
                    }
                }
                element.classList.remove('disappear');
                document.querySelector('.notes .note')?.classList.remove('disappear');

                global.notes = global.notes.filter(note => note._id !== global.preview);
                global.preview = global.notes[0]?._id;

                document.querySelector('.notes .note')?.classList.add('appear');

                setTimeout(() =>
                    document.querySelector('.notes .note').classList?.remove('appear'),
                    animations.refresh);
            }, animations.refresh);
        },
        async copy() {
            const index = global.notes.findIndex(item => item._id == global.preview);
            const note = global.notes[index];

            let data = {
                user: global.user,
                title: note.title,
                text: note.text,
                date: Date(),
                update: Date(),
                tags: note.tags
            };

            try {
                var response = await axios.put('/api/notes/update', data);
                response.data.note.date = new Date(response.data.note.date);
                response.data.note.update = new Date(response.data.note.update);

                global.notes.splice(index + 1, 0, response.data.note);

                document.querySelector('.notes .note')?.classList.add('disappear');
                requestAnimationFrame(() => {
                    document.querySelector('.notes .note')?.classList.remove('disappear');

                    const element = Array.from(document.querySelectorAll('.preview')).find(note => note.getAttribute('note') == response.data.note._id);

                    element.classList.add('appear');
                    document.querySelector('.notes .note')?.classList.add('appear');
                    global.preview = response.data.note._id;

                    setTimeout(() => {
                        element.classList.remove('appear');
                        document.querySelector('.notes .note')?.classList.remove('appear');
                    }, animations.refresh);
                });
            } catch (error) {
                console.error('Error while updating note:', error);
            }
        },
        close() {
            this.$el.querySelector('.radio-weekly').previousElementSibling.checked = true;
            this.$el.querySelector('.selection').style.transform = 'translateX(0)';

            const button = this.$el.querySelector('.close');
            button.style.cursor = 'default';

            if (!global.touch) {
                var hover = this.$el.querySelector('.hover');
                hover.style.opacity = 0;
            }
            setTimeout(() => {
                if (!global.touch) {
                    hover.style.left = 0;
                    hover.style.opacity = 1;
                }
                toggle('weekly');
            }, animations.transition);

            setTimeout(() =>
                button.style.cursor = '',
                (animations.refresh + animations.swipe + 1));
        },
        today(event) {
            const button = this.$el.querySelector('.today');
            button.style.cursor = 'default';
            if (this.view !== 'weekly') {
                this.close(event);
                const target = new Date(global.today.now.getFullYear(),
                    global.today.now.getMonth(),
                    global.today.now.getDate());
                setTimeout(() =>
                    sessionStorage.setItem('target', target.getTime()),
                    animations.refresh);

                setTimeout(() =>
                    button.style.cursor = '',
                    (animations.refresh + animations.swipe + 1));
            } else {
                button.classList.add('disappear');
                setTimeout(() => {
                    button.classList.remove('disappear');
                    button.style.opacity = 0;
                    button.style.cursor = '';
                }, (animations.refresh + animations.swipe + 1));

                global.swipe.component = 'point';
                const today = global.today.day;
                global.swipe.point = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                swipe();
            }
        },
        navigation(event) {
            let target = event.target.closest('.next, .previous');

            global.swipe.component = 'point';
            global.swipe.point = new Date(this.target);

            switch (target.classList[0]) {
                case 'previous':
                    switch (this.view) {
                        case 'weekly':
                            global.swipe.point.setDate(global.swipe.point.getDate() - 7);
                            break;
                        case 'monthly':
                            month(global.swipe.point, -1 * global.swipe.displayed);
                            break;
                        case 'yearly':
                            month(global.swipe.point, -12);
                            break;
                    }
                    break;
                case 'next':
                    switch (this.view) {
                        case 'weekly':
                            global.swipe.point.setDate(global.swipe.point.getDate() + 7);
                            break;
                        case 'monthly':
                            month(global.swipe.point, 1 * global.swipe.displayed);
                            break;
                        case 'yearly':
                            month(global.swipe.point, 12);
                            break;
                    }
                    break;
            }
            swipe();
        },
        radio(event, type) {
            if (!event.target.closest(`.radio-${type}`)?.previousElementSibling.checked) {
                const elements = Array.from(document.querySelectorAll('[class*="radio-"]'));
                const previous = elements.indexOf(elements.find(element => element.previousElementSibling.checked));

                switch (type) {
                    case 'weekly':
                        toggle('weekly');
                        break;
                    case 'monthly':
                        toggle('monthly');
                        break;
                    case 'yearly':
                        toggle('yearly');
                        break;
                }

                setTimeout(() => {
                    let checked = this.$el.querySelector(`.radio-${type}`);
                    checked.previousElementSibling.checked = true;
                    checked = elements.indexOf(checked);

                    if (!global.touch) {
                        const hover = this.$el.querySelector('.hover');
                        if (checked > previous) {
                            hover.style.right = `${6.8 - (checked * 3.4)}rem`;
                            hover.style.left = '';
                        } else {
                            hover.style.left = `${checked * 3.4}rem`;
                            hover.style.right = '';
                        }
                        hover.style.width = '3.4rem';
                    }
                    this.$el.querySelector('.selection').style.transform = `translateX(${checked * 3.4}rem)`;
                }, animations.refresh)
            }
        },
        initialize() {
            if (this.view != "notes" && this.view != "activities") {
                let checked = this.$el.querySelector(`.radio-${this.$route.name}`);
                if (checked) {
                    checked.previousElementSibling.checked = true;
                    checked = Array.from(document.querySelectorAll('[class*="radio-"]')).indexOf(checked);

                    const selection = this.$el.querySelector('.selection');
                    selection.style.transform = `translateX(${checked * 3.4}rem)`;
                    requestAnimationFrame(() =>
                        selection.style.transition = 'transform 0.2s ease-in-out');

                    if (!global.touch) {
                        const hover = this.$el.querySelector('.hover');
                        hover.style.left = `${checked * 3.4}rem`;
                        requestAnimationFrame(() =>
                            hover.style.transition = 'width 0.2s ease-in-out');
                    }
                }
            }
        },
        enable() {
            const empty = global.notes.some(note =>
                note.title.trim() == '' && note.text.trim() == '');
            const written = global.notes.filter(note =>
                note.title.trim() != '' || note.text.trim() != '');

            if (this.mounted) {
                this.$el.querySelector('.write').disabled = empty && !(this.small || this.touch);
                this.$el.querySelector('.order').disabled = written.length < 1;
                this.$el.querySelector('.copy').disabled = empty && !(this.small || this.touch);
            }
        }
    },
    mounted() {
        this.mounted = true;
        this.$el.querySelector('.order').disabled = true;

        if (JSON.parse(sessionStorage.getItem('menu')) !== false)
            requestAnimationFrame(() => {
                if (global.size.width > 575 + document.querySelector('.menu')?.offsetWidth) {
                    const spacer = document.querySelector('.spacer');
                    const menu = document.querySelector('.menu');
                    spacer.style.transition = 'none';
                    menu.style.transition = 'none';
                    requestAnimationFrame(() => {
                        spacer.style.transition = 'width 0.3s ease-in-out';
                        menu.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
                    });
                    this.$el.querySelector('.options').click();
                }
            });

        requestAnimationFrame(() =>
            this.initialize());
    },
    unmounted() {
        this.mounted = false;
    },
    watch: {
        width() {
            const menu = document.querySelector('.menu');
            if (menu.classList.contains("show") && menu.getAttribute("data-bs-backdrop") === "true") {
                menu.style.transition = 'none';
                document.querySelector('.menu .close').click();
                requestAnimationFrame(() =>
                    menu.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out');
            }

            if (JSON.parse(sessionStorage.getItem('menu')) &&
                window.innerWidth >= 575 + menu.offsetWidth &&
                !menu.classList.contains("show") && menu.getAttribute("data-bs-backdrop") === "false") {

                const spacer = document.querySelector('.spacer');
                spacer.style.transition = 'none';
                menu.style.transition = 'none';
                requestAnimationFrame(() => {
                    spacer.style.transition = 'width 0.3s ease-in-out';
                    menu.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
                });
                this.$el.querySelector('.options').click();
                document.querySelector('.spacer').style.width = `${menu.offsetWidth}px`;
            }

            const empty = global.notes.some(note =>
                note.title.trim() == '' && note.text.trim() == '');
            const written = global.notes.filter(note =>
                note.title.trim() != '' || note.text.trim() != '');

            if (this.mounted) {
                this.$el.querySelector('.write').disabled = empty && !(this.small || this.touch);
                this.$el.querySelector('.order').disabled = written.length < 1;
                this.$el.querySelector('.copy').disabled = empty && !(this.small || this.touch);
            }
        },
        preview() {
            this.enable();
        },
        notes() {
            this.enable();
        },
        $route: {
            handler(to, from) {
                if (this.mounted)
                    this.initialize();
            }
        }

    },
};
</script>

<style>
.navbar {
    padding: 0.5rem;
    align-items: center;
}

@media (hover: hover) and (pointer: fine) {
    .navbar button:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .navbar .today:hover {
        color: var(--bs-body-color) !important;
    }
}

.navbar button {
    border-radius: 50%;
    width: 1.8rem;
    height: 1.8rem;
    border: none;
    box-shadow: none !important;
    transition: transform 0.1s ease-out;
    cursor: pointer;
}

.navbar button:active {
    transform: scale(var(--pop-md)) !important;
}

.navbar .today:active {
    transform: scale(var(--pop-lg));
}

@media (hover: none) and (pointer: coarse) {
    .navbar button:not(.today) {
        background-color: var(--bs-body-bg) !important;
    }
}

.navbar .toggle {
    border-radius: 1rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.navbar .toggle .selection,
.navbar .toggle .hover,
.navbar .toggle [class*="radio-"] {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 500;
    width: 3.4rem;
    height: 1.8rem;
    border: none;
    border-radius: 1rem;
    z-index: 3;
}

.navbar .btn-check:checked+[class*="radio-"] {
    cursor: default;
}

.navbar .radio-weekly {
    border-radius: 1rem 0 0 1rem !important;
}

.navbar .radio-monthly {
    border-radius: 0 !important;
}

.navbar .radio-yearly {
    border-radius: 0 1rem 1rem 0 !important;
}

.navbar .toggle>div {
    display: flex;
    position: relative;
    width: 100%;
}

.navbar .toggle .selection {
    background-color: var(--background-secondary);
    position: absolute;
    z-index: 2;
}

.navbar .toggle .hover {
    position: absolute;
    z-index: 1;
}

.navbar .today {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.8rem;
    width: auto;
    padding-left: 0.85rem;
    padding-right: 0.85rem;
    border-radius: 1rem;
    font-size: 0.7rem;

    background-color: var(--background-primary);
    color: var(--text-primary);
    font-weight: 500;
}

.navbar .edit,
.navbar .close {
    margin-left: 0.5rem;
}

.navbar div:has(.today) {
    display: flex;
    align-items: center;
}

.navbar .previous,
.navbar .next {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.8rem;
    width: auto;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    border-radius: 1rem;
}

.navbar .previous i,
.navbar .next i {
    display: flex;
    align-items: center;
    justify-content: center;
}

.navbar .previous {
    border-radius: 1rem 0 0 1rem;
    margin-right: 1px;
}

.navbar i {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navbar .previous i {
    font-size: 0.65rem;
    padding-left: 0.15rem;
}

.navbar .next {
    border-radius: 0 1rem 1rem 0;
}

.navbar .next i {
    font-size: 0.65rem;
    padding-right: 0.15rem;
}

.navbar .options i {
    padding-bottom: 0.05rem;
}

.navbar .edit i {
    font-size: 1rem;
    padding-bottom: 0.05rem;
}

.navbar div:has(> .write) {
    display: flex;
    gap: 0.25rem;
}

.navbar .write i {
    font-size: 0.73rem;
}

.navbar .write i {
    font-size: 0.73rem;
}

.navbar .copy i {
    font-size: 0.75rem;
}

.navbar .order i {
    position: relative;
    font-size: 0.95rem;
    top: 1px;
}

.navbar .delete i {
    font-size: 0.75rem;
    padding-bottom: 0.05rem;
}

.navbar .divider {
    width: 1px;
    background-color: var(--background-secondary);
    margin-left: 0.1rem;
    margin-right: 0.1rem;
}

.navbar div:has(> .divider) {
    display: flex;
    gap: 0.25rem;
}

.navbar div:has(> .previous) {
    display: flex;
    margin-left: 0.5rem;
}

.navbar .order::after {
    display: none;
}

.navbar .dropdown-menu {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.7rem;
    min-width: auto;
    right: 0.15rem;
}

.navbar .dropdown-item {
    height: 2rem;
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
}

.navbar .dropdown-item i {
    height: auto;
    width: auto;
    font-size: 0.89rem;
}

.navbar .dropdown-menu hr {
    margin: 0;
}

.navbar .dropdown-menu hr:nth-of-type(2) {
    margin-top: 0.25rem;
}

.navbar .dropdown-menu li:nth-of-type(1) .dropdown-item {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.navbar .dropdown-menu li:nth-last-of-type(1) .dropdown-item {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.navbar .dropdown-menu li:nth-of-type(even) .dropdown-item {
    background-color: var(--bs-tertiary-bg);
}

.navbar .dropdown-menu .dropdown-item:hover,
.navbar .dropdown-menu .dropdown-item:active {
    background-color: var(--background-secondary) !important;
    color: white !important;
}

.navbar div:has(>.check) {
    display: flex;
    gap: 0.3rem;
}
</style>