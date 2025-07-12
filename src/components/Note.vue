<template>
    <div class="note" @click="focus">
        <div v-show="note._id != -1" class="date" @click.stop="false">{{ date }}</div>
        <div class="update" @click.stop="false">{{ update }}</div>
        <div class="tags">
            <div v-for="(tag, index) in note.tags?.filter(tag => tag.trim() != '')">
                #
                <textarea class="tag" :index="index" :id="'note-' + id + index + '-tag'" :style="{ maxWidth: max }"
                    @click.stop="false" @input="input">{{ tag }}</textarea>
            </div>
            <div>
                <textarea class="hash" disabled :id="'note-' + id + '#'" placeholder="#"></textarea>
                <textarea class="new" :id="'note-' + id + '-new'" :placeholder="italian ? 'Categoria' : 'Tag'"
                    :style="{ maxWidth: max }" @click.stop="false" @input="input"></textarea>
            </div>
        </div>
        <textarea :id="'note-' + id + '-title'" class="title"
            :placeholder="italian ? 'Nota Senza Titolo' : 'Untitled Note'" v-model="note.title" @input="input"
            @keydown.enter="focus" @click.stop="false"></textarea>
        <textarea :id="'note-' + id + '-text'" class="text" :placeholder="italian ? 'Nessun Contenuto' : 'No Content'"
            v-model="note.text" @input="input"></textarea>
    </div>
</template>

<script>
import axios from 'axios';
import { sort } from '../utils/misc';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';

export default {
    data() {
        return {
            mounted: false,
            save: null,
            max: null,
            top: null
        };
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        note() {
            return global.notes.find(item => item._id == global.preview);
        },
        date() {
            const note = this.note;
            return `${note.date.toLocaleDateString(settings.format, {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })}`;
        },
        update() {
            const note = this.note;
            return `${ note._id != -1 ? (this.italian ? 'Modificato il' : 'Modified on') : ''} ${note.update.toLocaleDateString(settings.format, {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })} ${this.italian ? 'alle' : 'at'} ${note.update.toLocaleTimeString(settings.format, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })}`;
        },
        preview() {
            return global.preview;
        },
        width() {
            return global.size.window;
        },
        id() {
            return Math.floor(Math.random() * 1e9);
        }
    },
    methods: {
        async input(event) {
            const target = event.target;
            const index = global.notes.findIndex(item => item._id == this.note._id);
            const note = global.notes[index];

            if (target.closest('.title')) {
                target.value = target.value.replace(/[\r\n]+/g, '');
                note.title = target.value;
            } else if (target.closest('.text'))
                note.text = target.value;
            else if (target.closest('.new')) {
                if (target.value.trim() == '')
                    target.value = target.value.replace(/\s+/g, '');
                else {
                    note.tags.push(target.value);
                    target.value = '';
                    requestAnimationFrame(() => {
                        const tags = this.$el.querySelectorAll('.tag');
                        const focus = tags[tags.length - 1];
                        focus.addEventListener('keydown', this.$el.prevent);
                        this.adjust({ target: focus });
                        focus.focus();
                        const length = focus.value.length;
                        focus.setSelectionRange(length, length);
                    });
                }
            } else if (target.closest('.tag')) {
                target.value = target.value.replace(/\s+/g, '');
                if (target.value == '') {
                    note.tags.splice(target.getAttribute('index'), 1);
                    this.$el.querySelector('.new').focus();
                } else {
                    note.tags[target.getAttribute('index')] = target.value;
                    this.adjust({ target });
                }
            }
            note.update = new Date(global.today.now);
            global.notes = global.notes.map((n, i) => i === index ? note : n);

            clearTimeout(this.save);
            this.save = setTimeout(async () => {
                this.save = null;

                let data = {
                    _id: note._id != -1 ? note._id : null,
                    user: global.user,
                    title: note.title,
                    text: note.text,
                    date: note.date,
                    update: note.update,
                    tags: note.tags
                };

                if (data.title.trim() == '' && data.text.trim() == '') {
                    if (note._id != -1)
                        await axios.get('/api/notes/drop', { params: { id: global.preview } });
                } else try {
                    var response = await axios.put('/api/notes/update', data);
                    global.notes[index]._id = response.data.note._id;
                    if (global.preview == -1)
                        global.preview = response.data.note._id;
                } catch (error) {
                    console.error('Error while updating note:', error);
                }
                sort(true);
            }, 501);
        },
        resize(event) {
            const target = event.target;

            target.style.height = '0px';
            target.style.height = `${target.scrollHeight}px`;

            if (target.closest('.text')) {
                const bookmarks = JSON.parse(sessionStorage.getItem("bookmarks")) || [];
                const index = bookmarks.findIndex(item => item._id == this.note._id);
                this.$el.scrollTop = bookmarks[index]?.value || 0;
            }
        },
        adjust(event) {
            const target = event.target;

            target.style.width = '0px';

            const ctx = document.createElement('canvas').getContext('2d');
            const computed = getComputedStyle(target);
            const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
            ctx.font = font;

            const text = target.value || target.placeholder || '';
            const width = ctx.measureText(text).width;

            const padding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);

            target.style.width = `${width + padding + 4}px`;

            target.style.height = '0px';
            target.style.height = `${target.scrollHeight}px`;

        },
        focus() {
            this.$el.querySelector('.text').focus();
        },
        scroll() {
            document.querySelectorAll('.note').forEach(element =>
                element.scrollTop = this.$el.scrollTop);
            this.top = this.$el.scrollTop;
        }
    },
    mounted() {
        this.mounted = true;

        const load = () => {
            this.resize({ target: this.$el.querySelector('.title') });
            this.resize({ target: this.$el.querySelector('.text') });
            requestAnimationFrame(() =>
                this.$el.querySelectorAll('.tag, .new').forEach(tag => this.adjust({ target: tag })));
        }

        if (!this.$el.closest('.modal'))
            load();

        const el = this.$el;
        this.$el.observer = new IntersectionObserver(([entry]) => {
            this.max = `${this.$el.querySelector('.title').offsetWidth}px`;
            if (entry.isIntersecting)
                load();
        });
        this.$el.observer.observe(el);

        this.$el.tab = function (event) {
            if (event.key === 'Tab') {
                event.preventDefault();
                const textarea = this;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd
                const value = textarea.value;
                textarea.value = value.substring(0, start) + "\t" + value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 1;
                textarea.dispatchEvent(new Event('input'));
            }
        };
        this.$el.querySelector('.text').addEventListener('keydown', this.$el.tab);
        this.$el.addEventListener('scroll', this.scroll);

        this.$el.prevent = (event) => {
            if (event.key === 'Enter' || event.key === 'Tab')
                event.preventDefault();
        }
        this.$el.querySelectorAll('.tag, .title, .new').forEach(element =>
            element.addEventListener('keydown', this.$el.prevent));
    },
    unmounted() {
        this.mounted = false;
        this.save = null;
        this.top = null;
        this.max = null;

        this.$el.removeEventListener('scroll', this.scroll);
        this.$el.observer.disconnect();
        this.$el.querySelector('.text').removeEventListener('keydown', this.$el.tab);
        this.$el.querySelectorAll('.tag, .title, .new').forEach(element =>
            element.removeEventListener('keydown', this.$el.prevent));
    },
    watch: {
        "note.text"() {
            this.resize({ target: this.$el.querySelector('.text') });
        },
        "note.title"() {
            this.resize({ target: this.$el.querySelector('.title') });
        },
        preview(value, old) {
            if (old != -1)
                this.modified = false;

            if (value != -1)
                sessionStorage.setItem("preview", value);

            requestAnimationFrame(() => {
                this.resize({ target: this.$el.querySelector('.title') });
                this.resize({ target: this.$el.querySelector('.text') });
                this.$el.querySelectorAll('.tag, .new').forEach(tag => this.adjust({ target: tag }));
            })
        },
        width() {
            this.resize({ target: this.$el.querySelector('.title') });
            this.resize({ target: this.$el.querySelector('.text') });
            this.$el.querySelectorAll('.tag, .new').forEach(tag => this.adjust({ target: tag }));
        },
        "top"(value) {
            const id = this.note._id;
            if (id != -1) {
                const bookmarks = JSON.parse(sessionStorage.getItem("bookmarks")) || [];
                const index = bookmarks.findIndex(item => item._id == id);

                if (index == -1)
                    bookmarks.push({
                        _id: id,
                        value
                    })
                else
                    bookmarks[index].value = value;

                sessionStorage.setItem("bookmarks", JSON.stringify(bookmarks))
            }
        }
    },
}
</script>

<style>
.note {
    width: 100%;
    height: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    overflow: auto;
}

.note .date {
    font-weight: 200;
    font-size: 0.7rem !important;
    display: flex;
    justify-content: center;
}

.note .update {
    font-weight: 200;
    font-size: 0.7rem !important;
    padding-bottom: 1rem;
    display: flex;
    justify-content: center;
}

.note textarea:not(.tag):not(.new) {
    all: unset;
    width: 100% !important;

    white-space: pre-wrap !important;
    overflow-wrap: break-word !important;
    word-break: break-word !important;

    resize: none !important;
    overflow: hidden !important;
}

.note .title {
    font-weight: 400;
    font-size: 1.2rem !important;
    line-height: 1.3rem;
    padding-bottom: 0.15rem;
}

.note .text {
    font-weight: 300 !important;
    font-size: 0.8rem !important;
    line-height: 1.15rem !important;
}

.note .tags {
    display: flex;
    flex-wrap: wrap;
    font-weight: 300;
    column-gap: 0.2rem;
    font-size: 0.8rem;
}

.note .hash {
    max-width: 0.45rem !important;
    height: 1rem !important;
}

.note .tags>div {
    display: flex;
    gap: 0.1rem;
}

.note .new,
.note .tag {
    all: unset;

    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;

    resize: none !important;
    overflow: hidden !important;
}
</style>