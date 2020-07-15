<template>
  <div id="app">
   
    <Publications />
  </div>
</template>

<script>
import Publications from './components/Publications.vue'

export default {
  name: 'App',
  components: {
    Publications
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
