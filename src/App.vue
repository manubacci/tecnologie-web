<template>
  <Error />
  <Navbar />
  <Menu />
  <Content />
</template>

<script>
import Error from './components/Error.vue';
import Navbar from './components/Navbar.vue';
import Menu from './components/Menu.vue';
import Content from './components/Content.vue';

export default {
  components: {
    Error,
    Navbar,
    Menu,
    Content,
  }
};
</script>

<style>
#selfie.disappear {
    animation: disappear 0.1s ease-in-out forwards;
}

#selfie.appear {
    animation: appear 0.1s ease-in-out forwards;
}
</style>