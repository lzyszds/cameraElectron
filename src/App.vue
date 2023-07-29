<script setup lang="ts">
import NavTop from './components/NavTop.vue';

</script>

<template>
  <NavTop></NavTop>
</template>

<style lang="scss">
#app{
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 60px 350px 1fr;
  grid-template-rows: 36px 1fr;
}
nav.navbar{
  grid-column: 1/4;
  grid-row: 1/2;
}
</style>
