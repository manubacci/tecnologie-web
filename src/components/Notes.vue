<template>
    <div class="notes" :style="{ height: height }">
        <button v-show="false" class="writer" data-bs-toggle="modal" data-bs-target="#modal-writer"></button>

        <div class="header"> {{ italian ? "Note" : "Notes" }}</div>
        <div class="empty" v-show="notes.length == 0">
            <span>{{ italian
                ? "Nessuna nota presente!\nPer aggiungere una nuova nota,\ncreala tramite il pulsante "
                : "No notes available!\nTo add a new note, create\none using the button "
                }}</span>
            <i class="bi bi-pencil-square"></i>
            <span>.</span>
        </div>
        <div :style="{ height: content }">
            <div class="list" :style="{ width: small ? '100%' : '18rem' }">
                <div>
                    <button class="preview" v-for="note in notes" :class="{
                        'bg-body-secondary': preview == note._id,
                        'bg-body-tertiary': preview != note._id
                    }" :note="note._id" @click="click" @mousedown="start"
                        @touchstart="start" @mouseup="cancel" @mouseleave="cancel" @touchend="cancel">

                        <div class="informations">
                            <div class="title">
                                {{ note.title.trim() == '' ? (italian ? 'Nota Senza Titolo' : 'Untitled Note') :
                                    note.title }}
                            </div>
                            <div class="date">
                                {{ note.date.toLocaleDateString(format, {
                                    day: '2-digit', month: '2-digit', year:
                                        '2-digit'
                                }) }}
                            </div>
                        </div>
                        <div class="summary">
                            {{note.text.trim() == '' ? (italian ? 'Nessun Contenuto' : 'No Content') :
                                note.text.split('\n')
                                    .filter(line => line.trim() !== '')
                                    .join('\n')
                                    .replace(/\n/g, ' ')}}
                        </div>
                    </button>
                </div>
            </div>
            <div v-if="!small && notes.length > 0">
                <div class="divider"></div>
                <Note />
            </div>
        </div>
    </div>
</template>

<script>
import { animations } from '../store/animations';
import { global } from '../store/global';
import { settings } from '../store/settings';
import Note from './Note.vue';

export default {
    components: {
        Note
    },
    data() {
        return {
            mounted: false,
            timer: null,
            top: null
        };
    },
    computed: {
        small() {
            return global.size.width <= 575;
        },
        touch() {
            return global.touch;
        },
        format() {
            return settings.format;
        },
        italian() {
            return this.format === 'it-IT';
        },
        preview() {
            return global.preview;
        },
        height() {
            const height =
                (global.size.height >= 500 ? global.size.height : 700) - (
                    document.querySelector('.navbar').offsetHeight);
            return `${height}px`;
        },
        content() {
            if (!this.mounted)
                return;

            const content = parseFloat(this.height) - (
                this.$el.querySelector('.header').offsetHeight);
            return `${content}px`;
        },
        notes() {
            return global.notes;
        }
    },
    methods: {
        click(event) {
            const preview = event.target.closest('.preview').getAttribute('note');
            if (global.preview == preview)
                this.$el.querySelector('.writer').click();
            else {
                const elements = global.notes.filter(note => note.title.trim() == '' && note.text.trim() == '');
                elements.forEach(element =>
                    Array.from(document.querySelectorAll('.preview'))
                        .find(note => note.getAttribute('note') == element._id)
                        .classList.add('disappear'));
                setTimeout(() => {
                    elements.forEach(element =>
                        Array.from(document.querySelectorAll('.preview'))
                            .find(note => note.getAttribute('note') == element._id)
                            .classList.remove('disappear'));
                    requestAnimationFrame(() =>
                        global.notes = global.notes.filter(note => note.title.trim() != '' || note.text.trim() != ''));
                }, animations.refresh);
            }

            if (this.small) {
                this.$el.querySelector('.writer').click();
                global.preview = preview;
            }
            else {
                this.$el.querySelector('.note').classList.add('disappear');
                setTimeout(() => {
                    this.$el.querySelector('.note').classList.remove('disappear');
                    this.$el.querySelector('.note').classList.add('appear');

                    global.preview = preview;

                    setTimeout(() =>
                        this.$el.querySelector('.note').classList.remove('appear'),
                        animations.refresh);
                }, animations.refresh);
            }
        },
        start(event) {
            this.timer = setTimeout(() => {
                global.preview = event.target.closest('.preview').getAttribute('note');
                this.$el.querySelector('.writer').click();
            }, 500);
        },
        cancel() {
            clearTimeout(this.timer);
            this.timer = null;
        },
        scroll() {
            this.top = this.$el.querySelector('.list').scrollTop;
        }
    },
    mounted() {
        this.mounted = true;
        this.top = JSON.parse(sessionStorage.getItem("notes")) || 0;

        this.$el.querySelector('.list').addEventListener('scroll', this.scroll);
    },
    unmounted() {
        this.mounted = false;
        this.timer = null;
        this.$el.querySelector('.list').removeEventListener('scroll', this.scroll);
        this.top = null;
    },
    watch: {
        top(value) {
            sessionStorage.setItem("notes", JSON.stringify(value));
        },
        notes: {
            handler() {
                if (this.notes.length === 0) return;

                this.$nextTick(() => {
                    setTimeout(() => {
                        const list = this.$el.querySelector('.list');
                        if (list) list.scrollTop = this.top;
                    }, 0);
                });
            },
            immediate: true
        }
    }
}
</script>

<style>
.notes div:has(>.list) {
    display: flex;
}

.notes .header {
    font-size: 2.2rem;
    font-weight: 400;
    padding-top: 0.5rem;
    padding-left: 1rem;
    padding-bottom: 0.3rem;
}

.notes .divider {
    width: 1px;
    background-color: var(--background-secondary);
}

.notes .list {
    overflow: auto;
    flex-shrink: 0;
}

.notes div:has(> .preview) {
    height: 100%;
}

.notes .preview {
    all: unset;
    height: auto;
    width: calc(100% - 3rem);
    border-radius: 0.55rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.65rem;
    padding-bottom: 0.75rem;
}

@media (hover: hover) and (pointer: fine) {
    .notes .preview:hover {
        color: var(--text-primary) !important;
        background-color: var(--background-secondary) !important;
    }
}

.notes .preview:active {
    transform: scale(var(--pop-xxl));
}

.notes .informations {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.2rem;
}

.notes .informations .title {
    font-weight: 400;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 1rem;
}

.notes .informations .date {
    font-weight: 300;
    font-size: 0.8rem;
    margin-top: 1.5px;
}

.notes .summary {
    font-weight: 300;
    font-size: 0.8rem;
    line-height: 0.95rem;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 5;

    hyphens: auto;
}

.notes .empty {
    font-weight: 300;
    font-size: 0.75rem;
    line-height: 1.1rem;
    text-align: center;
    white-space: pre;
    margin-top: 1rem;
    width: 100%;
}

.notes div:has(>.note) {
    display: flex;
    width: 100%;
    height: 100%;
}

.notes .note .text {
    padding-bottom: 0.5rem !important;
}
</style>