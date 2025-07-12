<template>
    <div class="writer modal fade" id="modal-writer" :inert="inert">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body">
                    <button class="close btn btn-sm background-secondary text-body" data-bs-dismiss="modal">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <div>
                        <button class="copy btn btn-sm background-secondary text-body" @click="copy">
                            <i class="bi bi-copy"></i>
                        </button>
                        <button class="delete btn btn-sm background-secondary text-body" @click="remove">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                    <Note v-if="notes.length > 0" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
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
            inert: true
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        notes() {
            return global.notes;
        },
        width() {
            return global.size.window;
        },
        small() {
            return global.size.width <= 575;
        }
    },
    methods: {
        load() {
            this.inert = false;
            ['.navbar', '.view', '.menu'].forEach(item => {
                if (document.querySelector(item).style.opacity !== 0)
                    document.querySelector(item).classList.add('disappear')
            });
        },
        hide() {
            this.inert = true;
            setTimeout(() =>
                ['.navbar', '.view', '.menu'].forEach(item => {
                    document.querySelector(item).classList.remove('disappear');
                    document.querySelector(item).classList.add('appear');
                    setTimeout(() => {
                        document.querySelector(item).classList.remove('appear');
                        document.querySelector(item).style.opacity = 1;
                    }, animations.refresh);
                }),
                animations.close);
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
            this.$el.querySelector('.close').click();

            setTimeout(async () => {
                if (note.title.trim() !== '' || note.text.trim() != '') try {
                    await axios.get('/api/notes/drop', { params: { id: global.preview } });
                } catch (error) {
                    console.error('Error while deleting notes:', error);
                }
                global.notes = global.notes.filter(note => note._id != global.preview);
                global.preview = global.notes[0]?._id;

            }, animations.close);
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

            this.$el.querySelector('.close').click();

            try {
                var response = await axios.put('/api/notes/update', data);
                response.data.note.date = new Date(response.data.note.date);
                response.data.note.update = new Date(response.data.note.update);

                global.notes.splice(index + 1, 0, response.data.note);
                global.preview = response.data.note._id;

            } catch (error) {
                console.error('Error while updating note:', error);
            }
        },
    },
    mounted() {
        this.mounted = true;
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);
        this.mounted = false;
        this.inert = true;
    },
    watch: {
        width() {
            if (!this.inert)
                document.querySelector('.menu')?.classList.add('blurred');
        }
    }
}
</script>

<style>
.writer .note {
    max-height: calc(100vh - 10rem);
    padding: 0.5rem;
    padding-bottom: 0;
}

.writer .close,
.writer .copy,
.writer .delete {
    border-radius: 50%;
    border: none;
    top: 0.5rem;
    cursor: pointer;
    z-index: 2;
    width: 1.85rem;
    height: 1.85rem;
}

.writer .close {
    position: absolute;
    left: 0.5rem;
}

.writer div:has(>.delete) {
    display: flex;
    right: 0.5rem;
    top: 0.5rem;
    gap: 0.25rem;
    position: absolute;
}

.writer .close i {
    font-size: 0.8rem;
    position: relative;
    right: 1px;
    top: 0.5px;
}

.writer .delete i {
    font-size: 0.75rem;
}

.writer .copy i {
    font-size: 0.73rem;
}

@media (hover: none) and (pointer: coarse) {

    .writer .close,
    .writer .copy,
    .writer .delete {
        background-color: var(--background-secondary) !important;
    }
}

@media (hover: hover) and (pointer: fine) {

    .writer .close:hover,
    .writer .copy:hover,
    .writer .delete:hover {
        background-color: var(--bs-tertiary-bg) !important;
    }
}

.writer .close:active,
.writer .copy:active,
.writer .delete:active {
    transform: scale(var(--pop-md));
}
</style>