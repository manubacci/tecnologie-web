<template>
    <div class="profile modal fade" id="modal-profile" :inert="inert">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header bg-body-tertiary">
                    <h6 class="modal-title">
                        {{ user
                            ? !edit
                                ? italian ? "Informazioni Profilo" : "Profile Information"
                                : italian ? "Modifica Profilo" : "Edit Profile"
                            : login
                                ? italian ? "Accesso" : "Login"
                                : italian ? "Registrazione" : "Register"
                        }}
                    </h6>
                    <button class="close btn btn-sm bg-body text-body" data-bs-dismiss="modal">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-label">
                        {{ italian ? "Credenziali" : "Credentials" }}
                    </div>
                    <div class="username input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"><i class="bi bi-at"></i></span>
                        <input name="username" type="text" class="form-control bg-body-tertiary"
                            :maxlength="login ? Infinity : 16" autocomplete="username" :placeholder="(italian ? 'Nome Utente' : 'Username') +
                                (login ? (italian ? ' o Indirizzo Email' : ' or Email Address') : '')"
                            :value="selection.username" @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                    </div>

                    <div v-show="!login" class="email input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"></span>
                        <input name="email" type="text" class="form-control bg-body-tertiary" autocomplete="email"
                            :placeholder="italian ? 'Indirizzo Email' : 'Email Address'" :value="selection.email"
                            @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                    </div>

                    <div v-show="alert.username" class="alert">
                        {{ italian
                            ? "Il nome utente può contenere solo lettere (a-z, A-Z), numeri (0-9) e simboli consentiti (. _)."
                            : "The username can only contain letters (a-z, A-Z), numbers (0-9), and allowed symbols (. _)."
                        }}
                    </div>

                    <div v-show="alert.credentials.username && !alert.credentials.email" class="alert">
                        {{ italian
                            ? "Il nome utente inserito è già in uso."
                            : "This username is already in use." }}
                    </div>

                    <div v-show="alert.email" class="alert">
                        {{ italian
                            ? "L'indirizzo email inserito non è valido."
                            : "The email address is not valid." }}
                    </div>

                    <div v-show="alert.credentials.email && !alert.credentials.username" class="alert">
                        {{ italian
                            ? "L'indirizzo email inserito è già in uso."
                            : "This email address is already in use." }}
                    </div>
                    <div v-show="alert.credentials.username && alert.credentials.email" class="alert">
                        {{ italian
                            ? "Il nome utente e l'indirizzo email inseriti sono già in uso."
                            : "This username and email address are already in use." }}
                    </div>

                    <div v-show="!user || edit" class="password input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"><i class="bi bi-key"></i></span>
                        <input name="password" type="password" class="form-control bg-body-tertiary" maxlength="16"
                            autocomplete="new-password" :value="selection.password" :placeholder="'Password'"
                            @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                    </div>

                    <div v-show="edit" class="change bg-body-tertiary">
                        <span class="bg-body-secondary"></span>
                        <div class="form-check form-switch bg-body-tertiary" @mouseenter="enter" @mouseleave="leave">
                            <label class="form-check-label" for="login-change">
                                {{ italian ? "Modifica" : "Change" }}
                            </label>
                            <input id="login-change" class="form-check-input" type="checkbox" :checked="change"
                                @click="update('change')">
                        </div>
                    </div>

                    <div v-show="alert.authentication" class="alert">
                        {{ !this.edit
                            ? italian
                                ? "Il nome utente o la password inseriti non sono corretti."
                                : "The username or password are incorrect."
                            : italian
                                ? "La password inserita non è corretta."
                                : "The password is incorrect." }}
                    </div>

                    <div v-show="edit && change" class="new input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"><i class="bi bi-key-fill"></i></span>
                        <input name="new" type="password" class="form-control bg-body-tertiary" maxlength="16"
                            autocomplete="new-password" :placeholder="(italian
                                ? 'Nuova'
                                : 'New') + ' Password'" :value="selection.new" @mouseenter="enter"
                            @mouseleave="leave" @keydown.enter="lose">
                    </div>

                    <div v-show="(!login && !user) || (edit && change)" class="repeat input-group bg-body-tertiary">
                        <span class="input-group-text bg-body-secondary"></span>
                        <input name="repeat" type="password" class="form-control bg-body-tertiary" maxlength="16"
                            autocomplete="new-password" :placeholder="(
                                italian
                                    ? 'Ripeti la'
                                    : 'Confirm') + ' Password'" :value="selection.repeat" @mouseenter="enter"
                            @mouseleave="leave" @keydown.enter="lose">
                    </div>

                    <div v-show="alert.password && (!edit || (edit && change))" class="alert">
                        {{ italian
                            ? "La password deve essere lunga almeno 8 caratteri e includere una maiuscola (A-Z), una minuscola (a-z), un numero (0-9), un carattere speciale (es. !,@,#,$) e nessuno spazio."
                            : "The password must be at least 8 characters long and include an uppercase letter (A-Z), a lowercase letter (a-z), a number (0-9), a special character (e.g. !,@,#,$) and no white spaces."
                        }}
                    </div>

                    <div v-show="alert.repeat && (!edit || (edit && change))" class="alert">
                        {{ italian
                            ? "Le password inserite non corrispondono."
                            : "The entered passwords do not match." }}
                    </div>

                    <div v-show="alert.new && (!edit || (edit && change))" class="alert">
                        {{ italian
                            ? "La nuova password non può essere uguale alla precedente."
                            : "The new password cannot be the same as the previous one." }}
                    </div>

                    <div v-show="!login">
                        <div class="form-label">
                            {{ italian ? "Nome e Compleanno" : "Name & Birth Date" }}
                        </div>
                        <div class="name input-group bg-body-tertiary">
                            <span class="input-group-text bg-body-secondary"><i class="bi bi-type"></i></span>
                            <input name="name" type="text" class="form-control bg-body-tertiary" autocomplete="name"
                                :placeholder="italian ? 'Nome Completo' : 'Full Name'" :value="selection.name"
                                @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                        </div>

                        <div v-show="alert.name" class="alert">
                            {{ italian
                                ? "Il nome completo deve contenere solo lettere (a-z, A-Z) e almeno uno spazio."
                                : "The full name must contain only letters (a-z, A-Z) and at least a white space." }}
                        </div>

                        <div class="birth input-group bg-body-tertiary">
                            <span class="input-group-text bg-body-secondary"><i class="bi bi-cake2"></i></span>
                            <span v-show="touch && !selection.birth" class="sample" @click="date">gg mm aaaa</span>
                            <input name="birth" type="date" class="form-control bg-body-tertiary" autocomplete="bday"
                                :value="selection.birth" @mouseenter="enter" @mouseleave="leave" @keydown.enter="lose">
                        </div>

                        <div v-show="alert.birth" class="alert">
                            {{ italian
                                ? "La data di nascita deve essere compresa tra il 01/01/1900 e la data odierna."
                                : "The date of birth must be between 01/01/1900 and the current date." }}
                        </div>

                        <div v-show="!user || selection.propic || edit">
                            <div class="form-label">
                                {{ italian ? "Foto Profilo" : "Profile Picture" }}
                            </div>
                            <div class="propic">
                                <div>
                                    <button class="btn btn-sm bg-body-tertiary" @mouseenter="enter" @mouseleave="leave"
                                        @click="file">
                                        <i v-show="!selection.propic" class="bi bi-person-fill"></i>
                                        <canvas v-show="selection.propic" :width="side" :height="side"></canvas>
                                    </button>
                                    <input name="propic" type="file" class="form-control d-none">
                                    <button v-show="(!user || edit) && selection.propic"
                                        class="erase btn btn-sm bg-body-tertiary" @click="erase">
                                        <i class="bi  bi-eraser"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button v-show="!user" class="register" @click="register()">
                        {{ login
                            ? italian ? "Registrati" : "Register"
                            : italian ? "Accedi" : "Login"
                        }}
                    </button>
                    <button v-show="(user && edit)" class="back" @click="update('back')">
                        {{ italian ? "Indietro" : "Back" }}
                    </button>

                    <button v-show="user && !edit" class="logout" @click="logout">
                        {{ italian ? "Disconnettiti" : "Logout" }}
                    </button>

                    <button class="exit" data-bs-dismiss="modal">
                        {{ italian ? "Esci" : "Close" }}
                    </button>
                    <button v-show="!user" class="log" @click="log" disabled>
                        {{ login
                            ? italian ? "Accedi" : "Login"
                            : italian ? "Registrati" : "Register"
                        }}
                    </button>
                    <button v-show="user" class="update" @click="update(edit ? 'update' : 'edit')">
                        {{ !edit
                            ? italian ? "Modifica" : "Edit"
                            : italian ? "Salva" : "Save" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { global } from '../store/global';
import { settings } from '../store/settings';
import { animations } from '../store/animations';
import { find, update } from '../utils/misc';

export default {
    props: {
        event: {
            type: Event
        }
    },
    data() {
        return {
            selection: {
                username: null,
                email: null,
                password: null,
                repeat: null,
                new: null,
                name: null,
                birth: null,
                propic: null
            },
            login: true,
            alert: {
                username: null,
                email: null,
                credentials: {
                    username: null,
                    email: null
                },
                password: null,
                repeat: null,
                new: null,
                name: null,
                birth: null,
                authentication: null
            },
            edit: null,
            change: null,
            hover: null,
            inert: true,
            restore: null
        }
    },
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        touch() {
            return global.touch;
        },
        side() {
            return 6 * parseFloat(getComputedStyle(document.documentElement).fontSize);
        },
        user() {
            return global.profile.username;
        }
    },
    methods: {
        enter(event) {
            const target = event.target.closest('button, .form-control, .form-check');
            this.hover = target;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-tertiary');
                target.classList.add('bg-body-secondary', 'text-body');
            }
        },
        leave(event, mantain) {
            const target = event.target.closest('button, .form-control, .form-check');
            if (!mantain)
                this.hover = null;
            if (!global.touch && !target.classList.contains('focus')) {
                target.classList.remove('bg-body-secondary', 'text-body');
                target.classList.add('bg-body-tertiary');
            }
        },
        load(_, timeout) {
            if (!timeout && timeout !== 0)
                timeout = animations.open;
            this.inert = false;
            if (this.user) {
                const birth = new Date(global.profile.birth);
                this.selection = {
                    username: global.profile.username,
                    email: global.profile.email,
                    password: null,
                    repeat: null,
                    new: null,
                    name: global.profile.name,
                    birth: `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2, '0')}-${String(birth.getDate()).padStart(2, '0')}`,
                    propic: null
                };
                this.propic(null, global.profile.propic);
                this.login = false;

                this.$el.querySelectorAll('.input-group, .propic button').forEach(item => {
                    item.classList.add('disable');
                    item.parentNode.classList.add('disable');
                });

                const element = this.$el.querySelector('.username');
                element.style.marginBottom = '2px';
                element.style.borderRadius = '1rem 1rem 0 0';
                element.querySelector('.input-group-text').style.borderRadius = '1rem 0 0 0';
                element.querySelector('.form-control').style.borderRadius = '0 1rem 0 0';

                document.documentElement.style.setProperty('--login-date-opacity', 1);

            } else {
                this.selection = {
                    username: null,
                    email: null,
                    password: null,
                    repeat: null,
                    new: null,
                    name: null,
                    birth: null,
                    propic: null,
                };
                this.login = true;

                this.$el.querySelectorAll('.input-group, .propic button').forEach(item => {
                    item.classList.remove('disable');
                    item.parentNode.classList.remove('disable');
                });

                this.$el.querySelectorAll('.username, .password').forEach(element => {
                    element.style.marginBottom = '0.5rem';
                    element.style.borderRadius = '1rem';
                    element.querySelector('.input-group-text').style.borderRadius = '1rem 0 0 1rem';
                    element.querySelector('.form-control').style.borderRadius = '0 1rem 1rem 0';
                });

                if (!global.touch)
                    setTimeout(() => {
                        const username = this.$el.querySelector('.username input');
                        username.focus();
                        username.classList.remove('bg-body-tertiary');
                        username.classList.add('bg-body-secondary');
                    }, timeout);

                document.documentElement.style.setProperty('--login-date-opacity', 0.75);
            }
            this.alert = {
                username: false,
                email: false,
                credentials: {
                    username: false,
                    email: false
                },
                password: false,
                repeat: false,
                new: false,
                name: false,
                birth: false,
                authentication: false
            };
            this.edit = false;
            this.change = false;
            this.hover = null;
            this.restore = false;
            this.$el.querySelector('.username').classList.remove('warning');
            this.$el.querySelector('.email').classList.remove('warning');
            this.$el.querySelector('.password').classList.remove('warning');
            this.$el.querySelector('.repeat').classList.remove('warning');
            this.$el.querySelector('.new').classList.remove('warning');
            this.$el.querySelector('.name').classList.remove('warning');
            this.$el.querySelector('.birth').classList.remove('warning');
            this.$el.querySelector('.update').classList.remove('edit');

            this.$el.querySelector('.update').disabled = false;
            this.erase();
        },
        hide() {
            this.inert = true;
        },
        erase() {
            const canvas = this.$el.querySelector('.propic canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.selection.propic = null;
        },
        input(event) {
            this.$el.querySelectorAll('.modal-body button, .form-control').forEach(element =>
                this.leave({ target: element }, true));
            this.restore = true;

            if (event.target.closest('.username')) {
                const input = event.target;
                let regex;
                if (this.login)
                    regex = /^[a-zA-Z0-9._@]*$/;
                else
                    regex = /^[a-zA-Z0-9._]*$/;
                if (!regex.test(input.value))
                    if (this.login)
                        input.value = input.value.replace(/[^a-zA-Z0-9._@]/g, '');
                    else
                        input.value = input.value.replace(/[^a-zA-Z0-9._]/g, '');
                this.selection.username = input.value;
                this.alert.username = false;
                this.alert.credentials.username = false;
                this.alert.authentication = false;
                this.$el.querySelector('.username').classList.remove('warning');
                this.$el.querySelector('.password').classList.remove('warning');
            }
            else if (event.target.closest('.email')) {
                const input = event.target;
                const regex = /^[a-z0-9._@]*$/;
                if (!regex.test(input.value)) {
                    input.value = input.value.replace(/[^a-zA-Z0-9._@]/g, '');
                    input.value = input.value.toLowerCase();
                }
                this.selection.email = input.value;
                this.alert.credentials.email = false;
                this.alert.email = false;
                this.$el.querySelector('.email').classList.remove('warning');
            }
            else if (event.target.closest('.password')) {
                this.selection.password = event.target.value;
                this.alert.password = false;
                this.alert.authentication = false;
                this.$el.querySelector('.username').classList.remove('warning');
                this.$el.querySelector('.password').classList.remove('warning');
                if (!this.edit) {
                    this.alert.repeat = false;
                    this.$el.querySelector('.repeat').classList.remove('warning');
                } else if (this.alert.new) {
                    this.alert.new = false;
                    this.$el.querySelector('.new').classList.remove('warning');
                }
            }
            else if (event.target.closest('.repeat')) {
                this.selection.repeat = event.target.value;
                this.alert.repeat = false;
                this.$el.querySelector('.repeat').classList.remove('warning');
            }
            else if (event.target.closest('.new')) {
                this.selection.new = event.target.value;
                this.alert.password = false;
                this.alert.repeat = false;
                this.alert.new = false;
                this.$el.querySelector('.new').classList.remove('warning');
            }
            else if (event.target.closest('.name')) {
                const input = event.target;
                const regex = /^[a-zA-Z\s]*$/;
                if (regex.test(input.value)) {
                    input.value = input.value
                        .toLowerCase()
                        .replace(/^\s+/, '')
                        .replace(/\s+/g, ' ')
                        .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
                } else {
                    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
                }
                this.selection.name = input.value;
                this.alert.name = false;
                this.$el.querySelector('.name').classList.remove('warning');
            }
            else if (event.target.closest('.birth')) {
                this.selection.birth = event.target.value;
                this.alert.birth = false;
                this.$el.querySelector('.birth').classList.remove('warning');
            }

            if (!this.selection.birth)
                document.documentElement.style.setProperty('--login-date-opacity', 0.75);
            else document.documentElement.style.setProperty('--login-date-opacity', 1);

            if (!this.selection.username || !this.selection.password || (!this.login && (!this.selection.repeat || !this.selection.name || !this.selection.birth)))
                this.$el.querySelector('.log').disabled = true;
            else
                this.$el.querySelector('.log').disabled = false;

            if (this.edit && this.selection.password && (!this.change || (this.change && this.selection.new && this.selection.repeat)))
                this.$el.querySelector('.update').disabled = false;
            else if (this.edit)
                this.$el.querySelector('.update').disabled = true;
        },
        focus(event, element) {
            let target = !element
                ? event.target.closest('.form-control')
                : element.querySelector('.dropdown-toggle');

            target.classList.add('focus');
        },
        release(event, element) {
            let target = !element
                ? event.target.closest('.form-control')
                : element.querySelector('.dropdown-toggle');

            target.classList.remove('focus');
            if (this.hover !== target) {
                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');
            }
        },
        lose(event) {
            const target = event.target.closest('.form-control');
            target.blur();
            if (!global.touch) {
                this.$el.querySelectorAll('.modal-body button, .form-control').forEach(element =>
                    this.leave({ target: element }, true));

                target.classList.remove('bg-body-secondary');
                target.classList.add('bg-body-tertiary');

                let siblings = Array.from(this.$el.querySelectorAll('.form-control[type="text"], .form-control[type="email"], .form-control[type="password"], .form-control[type="date"]'));
                siblings = siblings.filter(element => {
                    let iteration = element;
                    let hidden = false;
                    while (iteration.closest('.profile')) {
                        if (getComputedStyle(iteration).display === "none") {
                            hidden = true;
                            break;
                        }
                        iteration = iteration.parentElement;
                    }
                    return !hidden && (element === target || !element.value || element.closest('.warning'));
                });
                const index = siblings.indexOf(target);

                function focalize(focus) {
                    focus.focus();
                    focus.classList.remove('bg-body-tertiary');
                    focus.classList.add('bg-body-secondary');
                }

                if (index < siblings.length - 1) {
                    const focus = siblings[index + 1];
                    focalize(focus);
                } else {
                    let i = 0;
                    let focus;
                    while (i < siblings.length) {
                        if (!siblings[i].value) {
                            focus = siblings[i];
                            break;
                        }
                        i++;
                    }
                    if (focus)
                        focalize(focus);
                    else
                        !this.edit ? this.log() : this.update('update');
                }
            }
        },
        recover() {
            if (this.restore && this.hover) {
                this.restore = false;
                this.enter({ target: this.hover });
            }
        },
        register() {
            this.$el.classList.add('disappear');
            setTimeout(() => {
                this.$el.classList.remove('disappear');
                this.$el.classList.add('appear');
                setTimeout(() =>
                    this.$el.classList.remove('appear'),
                    animations.refresh);

                const login = !this.login;
                this.load(null, 0);
                this.login = login;
                if (!this.login) {
                    this.$el.querySelectorAll('.username, .password').forEach(element => {
                        element.style.marginBottom = '2px';
                        element.style.borderRadius = '1rem 1rem 0 0';
                        element.querySelector('.input-group-text').style.borderRadius = '1rem 0 0 0';
                        element.querySelector('.form-control').style.borderRadius = '0 1rem 0 0';
                    });
                } else {
                    this.$el.querySelectorAll('.username, .password').forEach(element => {
                        element.style.marginBottom = '0.5rem';
                        element.style.borderRadius = '1rem';
                        element.querySelector('.input-group-text').style.borderRadius = '1rem 0 0 1rem';
                        element.querySelector('.form-control').style.borderRadius = '0 1rem 1rem 0';
                    });
                }
            }, animations.refresh);
        },
        file() {
            this.$el.querySelector('.propic input').click();
        },
        date() {
            this.$el.querySelector('.birth input').focus();
        },
        propic(event, image) {
            const self = this;
            let file = image;
            if (!file) {
                file = event?.target.files[0];
                if (!file || !file.type.startsWith('image/')) return;
            }

            const load = (source) => {
                const propic = new Image();
                propic.onload = function () {
                    const canvas = document.querySelector('.profile .propic canvas');
                    const ctx = canvas.getContext('2d');
                    const ratio = propic.width / propic.height;

                    if (ratio > 1)
                        ctx.drawImage(propic, (propic.width - propic.height) / 2, 0, propic.height, propic.height, 0, 0, canvas.width, canvas.height);
                    else
                        ctx.drawImage(propic, 0, (propic.height - propic.width) / 2, propic.width, propic.width, 0, 0, canvas.width, canvas.height);

                    self.selection.propic = canvas.toDataURL();
                };
                propic.src = source;
            };

            if (typeof file === 'string' && file.startsWith('data:image'))
                load(file);
            else {
                const reader = new FileReader();
                reader.onload = () => load(reader.result);
                reader.readAsDataURL(file);
            }
            this.$el.querySelector('.propic input').value = null;
        },
        blur(event) {
            event.target.blur();
        },
        async logout() {
            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            this.$el.querySelector('.close').click();
            try {
                await axios.post('/api/user/logout');

                const body = document.querySelector('body');
                body.classList.add('disappear');
                await delay(animations.refresh);

                global.user = null;
                global.events = [];
                global.calendars = [];

                global.profile = {
                    username: null,
                    email: null,
                    password: null,
                    name: null,
                    birth: null,
                    propic: null
                }

                if (this.$route.name === 'notes')
                    this.$router.push({ name: 'home' });

                body.classList.remove('disappear');
                body.classList.add('appear');

                await delay(animations.refresh);
                body.classList.remove('appear');

            } catch (error) {
                console.error('Error while user logout:', error);
            }
        },

        async update(type) {
            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            if (type === 'change') {
                this.change = !this.change;
                if (!this.selection.new || !this.selection.repeat)
                    this.$el.querySelector('.update').disabled = true;
            }
            else if (type === 'edit') {
                this.$el.classList.add('disappear');
                setTimeout(() => {
                    this.$el.classList.remove('disappear');
                    this.$el.classList.add('appear');
                    setTimeout(() =>
                        this.$el.classList.remove('appear'),
                        animations.refresh);

                    this.edit = true;
                    this.$el.querySelectorAll('.password.input-group, .new.input-group, .repeat.input-group, .propic button').forEach(item => {
                        item.classList.remove('disable');
                        item.parentNode.classList.remove('disable');
                    });

                    const password = this.$el.querySelector('.password');
                    password.style.marginBottom = '2px';
                    password.style.borderRadius = '1rem 1rem 0 0';
                    password.querySelector('.input-group-text').style.borderRadius = '1rem 0 00';
                    password.querySelector('.form-control').style.borderRadius = '0 1rem 0 0';

                    this.$el.querySelector('.update').classList.add('edit');
                    this.$el.querySelector('.update').disabled = true;
                }, animations.refresh);
            }
            else if (type === 'back') {
                this.$el.classList.add('disappear');
                setTimeout(() => {
                    this.$el.classList.remove('disappear');
                    this.$el.classList.add('appear');
                    setTimeout(() =>
                        this.$el.classList.remove('appear'),
                        animations.refresh);
                    this.load(null, 0);
                }, animations.refresh);
            }
            else if (type === 'update') {
                if (this.change) {
                    this.alert.password = !this.selection.new ||
                        !(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=])[^\s]{8,}$/.test(this.selection.new));
                    this.alert.repeat = (!this.alert.password && this.selection.new != this.selection.repeat);

                    if (this.alert.password || this.alert.repeat) {
                        let element;
                        if (this.alert.password)
                            element = this.$el.querySelector('.new');
                        else if (this.alert.repeat)
                            element = this.$el.querySelector('.repeat');

                        element.classList.add('warning');
                        element = element.querySelector('input');
                        element.focus();
                        element.classList.remove('bg-body-tertiary');
                        element.classList.add('bg-body-secondary');
                        return;
                    }
                }
                try {
                    let data = {
                        username: this.selection.username,
                        password: this.selection.password
                    }
                    const response = await axios.post('/api/user/login', data);
                    if (!response.data.user) {
                        this.alert.authentication = true;
                        let element = this.$el.querySelector('.password');
                        element.classList.add('warning');
                        element = element.querySelector('input');
                        element.focus();
                        element.classList.remove('bg-body-tertiary');
                        element.classList.add('bg-body-secondary');
                        return;
                    }
                    this.alert.new = this.selection.password === this.selection.new;
                    if (this.alert.new) {
                        let element = this.$el.querySelector('.new');
                        element.classList.add('warning');
                        element = element.querySelector('input');
                        element.focus();
                        element.classList.remove('bg-body-tertiary');
                        element.classList.add('bg-body-secondary');
                        return;
                    }
                    if (this.change) {
                        const alert = confirm(this.italian
                            ? 'Attenzione! Procedendo con la modifica della password verrà effettuata la disconnessione del profilo. Desideri comunque continuare?'
                            : 'Attention! By proceeding with the password change, your profile will be logged out. Do you still want to continue?');
                        if (!alert)
                            return;

                    }

                    let birth = this.selection.birth.split('-');
                    birth = new Date(birth[0], birth[1] - 1, birth[2]);
                    data = {
                        username: this.selection.username,
                        email: this.selection.email,
                        password: this.change ? this.selection.new : this.selection.password,
                        name: this.selection.name,
                        birth: birth,
                        propic: this.selection.propic
                    };
                    await axios.post('/api/user/update', data);

                    if (this.change)
                        this.logout();
                    else {
                        this.$el.querySelector('.close').click();

                        const body = document.querySelector('body');
                        body.classList.add('disappear');
                        await delay(animations.refresh);

                        global.profile = data;

                        body.classList.remove('disappear');
                        body.classList.add('appear');

                        await delay(animations.refresh);
                        body.classList.remove('appear');
                    }
                } catch (error) {
                    console.error('Error while registering user:', error);
                }
            }
        },
        async log(_, login) {
            const delay = (animation) =>
                new Promise(resolve =>
                    setTimeout(resolve,
                        animation));

            const log = this.$el.querySelector('.log');
            if (log.disabled)
                return;

            login = login ?? this.login;
            if (login) {
                try {
                    const data = {
                        username: this.selection.username,
                        password: this.selection.password,
                    }
                    const response = await axios.post('/api/user/login', data);
                    if (response.data.user) {

                        this.$el.querySelector('.close').click();

                        const body = document.querySelector('body');
                        body.classList.add('disappear');
                        await delay(animations.refresh);

                        global.user = response.data.user._id;
                        const preset = {
                            theme: 'dark',
                            color: '#FF0000',
                            format: 'it-IT',
                            seconds: true
                        }
                        if (settings !== preset)
                            await update();
                        await find();

                        global.profile = {
                            username: response.data.user.username,
                            email: response.data.user.email,
                            password: response.data.user.password,
                            name: response.data.user.name,
                            birth: response.data.user.birth,
                            propic: response.data.user.propic
                        };

                        body.classList.remove('disappear');
                        body.classList.add('appear');

                        await delay(animations.refresh);
                        body.classList.remove('appear');

                    } else {
                        this.alert.authentication = true;
                        this.$el.querySelector('.username').classList.add('warning');
                        this.$el.querySelector('.password').classList.add('warning');

                        const element = this.$el.querySelector('.username input');
                        element.focus();
                        element.classList.remove('bg-body-tertiary');
                        element.classList.add('bg-body-secondary');
                    }
                } catch (error) {
                    console.error('Error while login user:', error);
                }
            } else {
                this.alert.username = !this.selection.username ||
                    !(/^[a-zA-Z0-9._]*$/.test(this.selection.username));

                this.alert.email = (!this.selection.email || (/^[a-z0-9._@]*$/.test(this.selection.email) &&
                    !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.selection.email))));

                if (!global.development){
                    this.alert.password = !this.selection.password ||
                        !(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=])[^\s]{8,}$/.test(this.selection.password));
                    this.alert.repeat = (!this.alert.password && this.selection.password != this.selection.repeat);
                }

                this.alert.name = !this.selection.name || !(/^[a-zA-Z]+\s[a-zA-Z]+$/.test(this.selection.name));

                this.alert.birth = false;
                if (this.selection.birth) {
                    const date = this.selection.birth.split('-');
                    const birth = new Date(0, date[1] - 1, date[2]);
                    birth.setFullYear(date[0]);
                    const min = new Date(1900, 0, 1);
                    const max = new Date(Date.now());
                    this.alert.birth = birth.getTime() <= min.getTime() || birth.getTime() >= max.getTime();
                }
                if (this.alert.username || this.alert.password || this.alert.repeat || this.alert.name || this.alert.birth) {
                    if (this.alert.username)
                        this.$el.querySelector('.username').classList.add('warning');
                    if (this.alert.email)
                        this.$el.querySelector('.email').classList.add('warning');
                    if (this.alert.password)
                        this.$el.querySelector('.password').classList.add('warning');
                    else if (this.alert.repeat)
                        this.$el.querySelector('.repeat').classList.add('warning');
                    if (this.alert.name)
                        this.$el.querySelector('.name').classList.add('warning');
                    if (this.alert.birth)
                        this.$el.querySelector('.birth').classList.add('warning');

                    if (!global.touch) {
                        let element;
                        if (this.alert.username)
                            element = this.$el.querySelector('.username input');
                        else if (this.alert.email)
                            element = this.$el.querySelector('.email input');
                        else if (this.alert.password)
                            element = this.$el.querySelector('.password input');
                        else if (this.alert.repeat)
                            element = this.$el.querySelector('.repeat input');
                        else if (this.alert.name)
                            element = this.$el.querySelector('.name input');
                        else if (this.alert.birth)
                            element = this.$el.querySelector('.birth input');

                        element.focus();
                        element.classList.remove('bg-body-tertiary');
                        element.classList.add('bg-body-secondary');
                    }
                    return;
                }
                try {
                    let birth = this.selection.birth.split('-');
                    birth = new Date(birth[0], birth[1] - 1, birth[2]);
                    const data = {
                        username: this.selection.username,
                        email: this.selection.email,
                        password: this.selection.password,
                        name: this.selection.name.trim(),
                        birth,
                        propic: this.selection.propic
                    };

                    const response = await axios.post('/api/user/register', data);
                    if (response.data.user) {
                        await this.log(_, true);
                        try {
                            let data = {
                                user: global.user,
                                title: 'Personal',
                                color: '',
                                show: true
                            }
                            let response = await axios.put('/api/calendars/update', data);
                            global.calendars = [response.data.calendar];

                            let birth = this.selection.birth.split('-');
                            birth = new Date(birth[0], birth[1] - 1, birth[2]);

                            data = {
                                user: global.user,
                                title: (this.italian ? 'Compleanno di ' : 'Birthday of ') + this.selection.name.split(' ')[0],
                                calendar: global.calendars.find(calendar => calendar.title === 'Personal')._id,
                                activity: null,
                                daily: true,
                                start: birth,
                                end: null,
                                repetition: [{ frequency: 'yearly', custom: null }],
                                recurrence: [{ frequency: 'endless', custom: null }],
                                notes: null
                            };
                            response = await axios.put('/api/events/update', data);
                            data._id = response.data.event._id;
                            global.events = [data];
                        } catch (error) {
                            console.error('Error while creating personal birthday:', error);
                        }
                    } else {
                        if (response.data.message.includes('Username')) {
                            this.alert.credentials.username = true;
                            this.$el.querySelector('.username').classList.add('warning');
                        }
                        if (response.data.message.includes('Email')) {
                            this.alert.credentials.email = true;
                            this.$el.querySelector('.email').classList.add('warning');
                        }

                        let element;
                        if (this.alert.credentials.username)
                            element = title.querySelector('.username input');
                        else if (this.alert.credentials.email)
                            element = title.querySelector('.email input');

                        element?.focus();
                        element?.classList.remove('bg-body-tertiary');
                        element?.classList.add('bg-body-secondary');
                    }
                } catch (error) {
                    console.error('Error while registering user:', error);
                }
            }
        }
    },
    mounted() {
        this.$el.addEventListener('show.bs.modal', this.load);
        this.$el.addEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.addEventListener('input', this.input));

        this.$el.querySelector('.propic input')
            .addEventListener('change', this.propic);

        this.$el.querySelector('.form-check-input')
            .addEventListener('focus', this.blur);

        if (!global.touch) {
            this.$el.addEventListener('pointermove', this.recover);

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.addEventListener('blur', this.release));
        }
    },
    unmounted() {
        this.$el.removeEventListener('show.bs.modal', this.load);
        this.$el.removeEventListener('hide.bs.modal', this.hide);

        this.$el.querySelectorAll('.form-control').forEach(element =>
            element.removeEventListener('input', this.input));

        this.$el.querySelector('.propic input')
            .removeEventListener('change', this.propic);

        this.$el.querySelector('.form-check-input')
            .removeEventListener('focus', this.blur);

        if (!global.touch) {
            this.$el.removeEventListener('pointermove', this.recover);

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('focus', this.focus));

            this.$el.querySelectorAll('.form-control').forEach(element =>
                element.removeEventListener('blur', this.release));
        }
        this.selection = {
            username: null,
            email: null,
            password: null,
            repeat: null,
            new: null,
            name: null,
            birth: null,
            propic: null,
        };
        this.login = true;
        this.alert = {
            username: null,
            email: null,
            credentials: {
                username: null,
                email: null
            },
            password: null,
            repeat: null,
            new: null,
            name: null,
            birth: null,
            authentication: null
        };
        this.change = null;
        this.edit = null;
        this.hover = null;
        this.inert = true;
        this.restore = null;
    }
}
</script>

<style>
.profile .modal-header {
    height: 3rem;
    padding: 0.5rem;
    padding-left: 0.9rem;
}

.profile .modal-body {
    padding: 0.9rem;
    padding-top: 0.75rem;
    padding-bottom: 0.7rem;
}

.profile .form-label {
    font-size: 0.8rem;
    padding-top: 0.25rem;
}

.profile .modal-footer {
    height: 3rem;
    padding: 0.5rem;
    justify-content: space-between;
}

.profile .modal-header .close {
    border-radius: 50%;
    border: none;
}

@media (hover: none) and (pointer: coarse) {
    .profile .modal-header .close {
        background-color: var(--bs-body-bg) !important;
    }
}

@media (hover: hover) and (pointer: fine) {
    .profile .modal-header button:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .profile .erase:hover {
        background-color: var(--bs-secondary-bg) !important;
    }

    .profile .modal-footer button:hover:not(:disabled) {
        background-color: var(--bs-secondary-bg) !important;
        color: var(--bs-body-color) !important;
    }
}

.profile .input-group,
.profile .propic button {
    transition: transform 0.1s ease-out;
    cursor: pointer;
    z-index: 2;
}

.profile .modal-footer button:active:not(:disabled) {
    transform: scale(var(--pop-lg));
}

.profile .input-group:active {
    transform: scale(var(--pop-xxl));
}

.profile .propic button:active {
    transform: scale(var(--pop-xl));
}

.profile .modal-header button:active,
.profile .propic .erase:active {
    transform: scale(var(--pop-md));
}

.profile .change,
.profile .input-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 1rem;
    margin-bottom: 0.5rem;
}

.profile .change {
    border-radius: 0 0 1rem 1rem;
}

.profile .change span,
.profile .input-group-text {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0 0 1rem;
    height: 2rem;
    width: 2.05rem;
    border: none;
}

.profile .change span {
    width: 1.98rem;
    border-radius: 0 0 0 1rem;
}

.profile .change .form-check {
    border-radius: 0 0 1rem 0;
}

.profile .modal-header i,
.profile .modal-body i {
    position: relative;
}

.profile .close i {
    top: 0.5px;
}

.profile .username i {
    font-size: 1rem;
    left: 1px;
    top: 0.5px;
}

.profile .password i,
.profile .new i {
    font-size: 0.9rem;
    left: 1px;
    top: 0.5px;
    transform: rotate(45deg);
}

.profile .name i {
    font-size: 0.88rem;
    left: 0.5px;
}

.profile .birth i {
    font-size: 0.75rem;
    left: 1px;
}

.profile .email,
.profile .repeat {
    border-radius: 0 0 1rem 1rem;
}

.profile .email .input-group-text,
.profile .repeat .input-group-text {
    border-radius: 0 0 0 1rem;
}

.profile .email .form-control,
.profile .repeat .form-control {
    border-radius: 0 0 1rem 0;
}

.profile .new {
    margin-bottom: 2px;
    border-radius: 1rem 1rem 0 0;
}

.profile .new .input-group-text {
    border-radius: 1rem 0 0 0;
}

.profile .new .form-control {
    border-radius: 0 1rem 0 0;
}

.profile .form-control {
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    border: none;
    box-shadow: none;
    line-height: 1.8;
    cursor: pointer;
}

.profile .form-control::-webkit-calendar-picker-indicator {
    font-size: 0.75rem;
    background-color: var(--background-secondary);
    border-radius: 1rem;
    padding: 0.3rem;
    position: relative;
    left: 7px;
    cursor: pointer;
}

.profile .disable .form-control::-webkit-calendar-picker-indicator {
    display: none;
}

.profile .form-control::-webkit-datetime-edit-year-field:focus,
.profile .form-control::-webkit-datetime-edit-month-field:focus,
.profile .form-control::-webkit-datetime-edit-day-field:focus,
.profile .form-control::-webkit-datetime-edit-hour-field:focus,
.profile .form-control::-webkit-datetime-edit-minute-field:focus {
    color: var(--bs-secondary);
    background-color: inherit;
}

.profile .form-control::-webkit-date-and-time-value {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
}

.profile .birth .sample {
    position: absolute;
    z-index: 1;
    left: 2.75rem;
    font-size: 0.75rem;
    opacity: 0.75;
}

.profile .birth .form-control::-webkit-datetime-edit {
    opacity: var(--login-date-opacity);
}

.profile .propic {
    margin-bottom: 0.5rem;
}

.profile .propic>div {
    display: flex;
    align-items: end;
    gap: 0.5rem;
}

.profile .propic button {
    position: relative;
    width: 6rem;
    height: 6rem;
    border: none;
    border-radius: 1rem;
}

.profile .propic canvas {
    width: 6rem;
    height: 6rem;
    border-radius: 1rem;
    position: absolute;
    top: 0;
    left: 0;
}

.profile .propic i {
    font-size: 3rem;
    z-index: 1;
}

.profile .propic .erase {
    width: 2rem;
    height: 2rem;
}

.profile .erase i {
    font-size: 0.85rem;
    bottom: 0.5px;
}

.profile .form-check {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    border-radius: 0 1rem 1rem 0;
    height: 2rem;
    width: 100%;
    padding-right: 0.8rem;
    border: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
}

.profile .form-check-label {
    display: flex;
    align-items: center;
    padding-left: 0.8rem;
    cursor: pointer;
    width: 100%;
    height: 100%;
}

.profile .form-check-input {
    position: relative;
    right: 0.5rem;
    bottom: 0.1rem;
    width: 1.65rem;
    height: 1rem;
    border: none;
    z-index: 1;
    cursor: pointer;
}

.profile .form-check-input:checked {
    background-color: var(--background-secondary);
}

.profile .form-check-input:focus {
    outline: none;
    box-shadow: none;
}

.profile .disable {
    pointer-events: none;
    opacity: 0.8;
}

.profile .propic button.disable {
    opacity: 1;
}

.profile .disable span {
    background-color: var(--bs-tertiary-bg) !important;
}

.profile .modal-footer button {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    font-size: 0.7rem;
    font-weight: 500;
    height: 1.75rem;
    width: auto;
    padding-left: 0.85rem;
    padding-right: 0.85rem;
    cursor: pointer;
    color: var(--text-secondary);
    background-color: var(--background-secondary);
}

.profile .modal-footer .log {
    color: var(--text-primary);
    background-color: var(--background-primary);
    margin-left: 0.5rem;
}

.profile .modal-footer .update.edit {
    color: var(--text-primary);
    background-color: var(--background-primary);
    margin-left: 0.5rem;
}

.profile .modal-footer .update {
    margin-left: 0.5rem;
}

.profile .modal-footer .log:disabled {
    background-color: var(--bs-secondary-bg);
    color: inherit;
    cursor: inherit;
}

.profile .modal-footer .update:disabled {
    background-color: var(--bs-secondary-bg);
    color: inherit;
    cursor: inherit;
}

.profile .modal-footer .exit {
    margin-left: auto;
}

.profile .alert {
    margin-bottom: 0.5rem;
    padding: 0;
    font-size: 0.7rem;
    color: red;
}

.profile .warning {
    border: 0.11rem solid red;
}
</style>