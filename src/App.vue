<template>
  <div id="app">
    <Publications />
  </div>
</template>

<script>
import Publications from './components/Publications.vue';

export default {
  name: 'App',
  components: {
    Publications,
  },
};
</script>

<style>
#app {
  font-family:"Open Sans", Helvetica, Roboto, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* font-size: 12px; */
  /* margin-top: 60px; */
}
</style>
