import './styles/global.css';
import './styles/keyframes.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './store/router';

const app = createApp(App);
app.use(router);
app.mount('#selfie');

import axios from 'axios';

import { global } from './store/global';
import { animations } from './store/animations';
import { appearance, profile } from './utils/misc';

document.addEventListener('DOMContentLoaded', async () => {
    document.body.style.opacity = 0;

    global.today.alpha = JSON.parse(sessionStorage.getItem('timemachine')) || 0;
    global.today.now = new Date(Date.now() - global.today.alpha);
    global.today.day = new Date(Date.now() - global.today.alpha);

    appearance();
    await profile();
    setTimeout(() =>
        document.body.style.opacity = 1,
        animations.refresh);
});

window.addEventListener('resize', () => {
    global.size.height = window.innerHeight;
    global.size.window = window.innerWidth;
    global.size.width = document.querySelector('.view').offsetWidth;
});

window.addEventListener("keydown", function (event) {
    if (!global.touch && event.key === "Escape")
        document.querySelectorAll('.modal-header .close')
            .forEach(element => element.click());
});

window.purge = async function () {
    try {
        await axios.delete('/api/purge');
    } catch (error) {
        console.error('Error while purging:', error);
    }
};

window.dump = async function () {
    try {
        const response = await axios.get('/api/dump');
        console.log(JSON.stringify(response.data.dump));
    } catch (error) {
        console.error('Error while generating dump:', error);
    }
};

window.develop = function () {
    global.development = true;
};
