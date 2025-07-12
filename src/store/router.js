import { createRouter, createWebHistory } from 'vue-router';
import { h } from 'vue';

import Home from '../components/Home.vue';
import Weekly from '../components/Weekly.vue';
import Wrapper from '../components/Wrapper.vue';
import Monthly from '../components/Monthly.vue';
import Yearly from '../components/Yearly.vue';
import Notes from '../components/Notes.vue';
import Redirect from '../components/Redirect.vue';

const routes = [
    {
        path: '/',
        name: 'redirect',
        component: Redirect
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: { name: 'redirect' }
    },
    {
        path: '/home/:target',
        name: 'home',
        component: Home,
        beforeEnter: (to, from, next) => {
            const id = to.params.target;
            if (!id || isNaN(id) | !Number.isInteger(Number(id))) {
                next({ name: 'redirect' });
            } else {
                next();
            }
        }
    },
    {
        path: '/weekly/:target',
        name: 'weekly',
        component: Weekly,
        beforeEnter: (to, from, next) => {
            const id = to.params.target;
            if (!id || isNaN(id) | !Number.isInteger(Number(id))) {
                next({ name: 'redirect' });
            } else {
                next();
            }
        }
    },
    {
        path: '/monthly/:scroll',
        name: 'monthly',
        component: {
            render() {
                return h(Wrapper, { component: Monthly });
            },
        },
        beforeEnter: (to, from, next) => {
            const id = to.params.scroll;
            if (!id || isNaN(id) | !Number.isInteger(Number(id))) {
                next({ name: 'redirect' });
            } else {
                next();
            }
        }
    },
    {
        path: '/yearly/:scroll',
        name: 'yearly',
        component: {
            render() {
                return h(Wrapper, { component: Yearly });
            },
        },
        beforeEnter: (to, from, next) => {
            const id = to.params.scroll;
            if (!id || isNaN(id) | !Number.isInteger(Number(id))) {
                next({ name: 'redirect' });
            } else {
                next();
            }
        }
    },
    {
        path: '/notes',
        name: 'notes',
        component: Notes
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;