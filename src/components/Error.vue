<template>
    <div v-if="error" class="error">
        <div>
            {{ ":(" }}
        </div>
        <div>
            {{ italian
                ? "La dimensione della pagina, il livello di zoom\no la dimensione del font selezionati potrebbero\ncompromettere la corretta visualizzazione\ndel sito."
                : "The selected page size, font size, or zoom level\nmay affect the proper display of the site."
            }}
        </div>
        <div>
            {{ italian
                ? "È consigliato ripristinare le impostazioni\npredefinite per un'esperienza ottimale."
                : "Is recommended restoring the default settings\nfor an optimal experience."
            }}
        </div>
    </div>
</template>

<script>
import { settings } from '../store/settings';
import { global } from '../store/global';

export default {
    computed: {
        italian() {
            return settings.format === 'it-IT';
        },
        error(){
            const font = parseInt(window.getComputedStyle(document.documentElement).fontSize),
                zoom = Math.round((window.outerWidth / window.innerWidth) * 100),
                error = (!global.touch && global.size.width > 0 && global.size.width < 400) || (global.size.height < 545) ||
                    (font < 14 || font > 24) ||
                    (font >= 14 && font <= 19 && zoom && zoom <= 60) || (font >= 20 && font <= 24 && zoom && zoom <= 40) ||
                    (font >= 14 && font <= 19 && zoom && zoom >= 140) || (font >= 20 && font <= 24 && zoom && zoom >= 120)

            if (error)
                document.querySelectorAll('.modal-header .close').forEach(element => element.click());
            return error;
        }
    }
}
</script>

<style>
.error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--bs-primary);
    color: white;
    z-index: 1051;
    font-size: 1.83vh;
    white-space: pre-line;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.error>div:nth-of-type(1) {
    font-size: 16vh;
    font-weight: 300;
    width: 40.32vh;
}

.error>div:nth-of-type(2) {
    margin-bottom: 0.96vh;
    width: 40.32vh;
}

.error>div:nth-of-type(3) {
    width: 40.32vh;
}

.error>div:nth-of-type(4) {
    display: flex;
    width: 40.32vh;
}

.error>div>div {
    font-size: 1.44vh;
    margin-top: 1.8vh;
    margin-left: 2.3vh;
    font-style: italic;
}
</style>