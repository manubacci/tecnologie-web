<template>
</template>

<script>
import { global } from '../store/global';

export default {
    mounted() {
        const now = new Date(global.today.now)
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.$router.push({ name: 'home', params: { target: sessionStorage.getItem('target') || target.getTime() } });
    }
}
</script>